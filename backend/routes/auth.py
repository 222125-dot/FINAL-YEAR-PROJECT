"""
Auth Routes — Supabase JWT verification
GET /api/auth/me

Supports HS256 (legacy JWT secret) and ES256 (JWT Signing Keys / asymmetric).
"""

from datetime import datetime
from functools import lru_cache
from typing import Any, Optional
from uuid import UUID

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from jwt import PyJWKClient
from jwt.exceptions import InvalidTokenError, PyJWKClientError
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv

from database import get_db, User

load_dotenv()

import logging

logger = logging.getLogger("visio3d")

router = APIRouter()

SUPABASE_JWT_SECRET = (os.getenv("SUPABASE_JWT_SECRET") or "").strip()
SUPABASE_URL = (os.getenv("SUPABASE_URL") or "").strip().rstrip("/")
AUDIENCE = "authenticated"

http_bearer = HTTPBearer(auto_error=False)


def user_dict(u: User) -> dict:
    return {
        "id": str(u.id),
        "username": u.username,
        "email": u.email,
        "full_name": u.full_name,
        "plan": u.plan,
        "created_at": u.created_at.isoformat() if u.created_at else "",
    }


@lru_cache(maxsize=1)
def _jwks_client_for_project(base_url: str) -> PyJWKClient:
    jwks_url = f"{base_url}/auth/v1/.well-known/jwks.json"
    return PyJWKClient(jwks_url)


def _decode_hs256(token: str) -> dict[str, Any]:
    if not SUPABASE_JWT_SECRET:
        raise HTTPException(
            500,
            "SUPABASE_JWT_SECRET is not set (required for HS256 tokens).",
        )
    try:
        return jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience=AUDIENCE,
        )
    except InvalidTokenError:
        pass
    try:
        return jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False},
        )
    except InvalidTokenError as e:
        logger.warning("HS256 JWT verification failed: %s", e)
        raise HTTPException(
            401,
            "Invalid or expired session. For HS256, ensure SUPABASE_JWT_SECRET matches "
            "Supabase Dashboard → Project Settings → API → JWT Secret.",
        ) from e


def _decode_es256(token: str) -> dict[str, Any]:
    if not SUPABASE_URL:
        raise HTTPException(
            500,
            "SUPABASE_URL must be set for ES256 JWTs (e.g. https://YOUR_PROJECT.supabase.co — "
            "same host as VITE_SUPABASE_URL).",
        )
    try:
        client = _jwks_client_for_project(SUPABASE_URL)
        signing_key = client.get_signing_key_from_jwt(token)
    except PyJWKClientError as e:
        logger.warning("JWKS resolution failed: %s", e)
        raise HTTPException(
            401,
            "Could not load signing keys from Supabase. Check SUPABASE_URL and network access.",
        ) from e

    peek = jwt.decode(
        token,
        options={
            "verify_signature": False,
            "verify_exp": False,
            "verify_aud": False,
        },
    )
    iss = peek.get("iss") or ""
    if not iss.startswith(SUPABASE_URL):
        raise HTTPException(401, "Invalid token issuer")

    try:
        return jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256"],
            audience=AUDIENCE,
            issuer=iss,
        )
    except InvalidTokenError:
        pass
    try:
        return jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256"],
            issuer=iss,
            options={"verify_aud": False},
        )
    except InvalidTokenError as e:
        logger.warning("ES256 JWT verification failed: %s", e)
        raise HTTPException(401, "Invalid or expired session.") from e


def _decode_supabase_access_token(token: str) -> dict[str, Any]:
    try:
        header = jwt.get_unverified_header(token)
        alg = header.get("alg") or "HS256"
    except InvalidTokenError as e:
        raise HTTPException(401, "Malformed token") from e

    if alg == "HS256":
        return _decode_hs256(token)
    if alg == "ES256":
        return _decode_es256(token)

    raise HTTPException(
        401,
        f"Unsupported JWT algorithm {alg!r}. Supported: HS256 (JWT secret), ES256 (JWT Signing Keys + SUPABASE_URL).",
    )


def _ensure_profile(db: Session, user_uuid: UUID, payload: dict[str, Any]) -> User:
    """Create public.users row if missing (e.g. trigger failed or legacy auth user)."""
    user = db.query(User).filter(User.id == user_uuid).first()
    if user:
        return user

    email = (payload.get("email") or "").strip().lower()
    meta = payload.get("user_metadata") or {}
    if not isinstance(meta, dict):
        meta = {}

    username = (meta.get("username") or "").strip()
    if not username and email:
        username = email.split("@")[0]
    if not username:
        username = f"user_{str(user_uuid)[:8]}"

    base = username
    n = 0
    while db.query(User).filter(User.username == username).first():
        n += 1
        username = f"{base}_{n}"

    full_name = (meta.get("full_name") or "").strip() or username
    if not email:
        raise HTTPException(
            401,
            "Your account has no email on file; cannot create an app profile. "
            "Contact support or sign up again with email.",
        )

    user = User(
        id=user_uuid,
        username=username[:80],
        email=email[:120],
        full_name=full_name[:120],
        plan="free",
        created_at=datetime.utcnow(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    logger.info("Created missing app profile for auth user %s", user_uuid)
    return user


def get_current_user(
    creds: Optional[HTTPAuthorizationCredentials] = Depends(http_bearer),
    db: Session = Depends(get_db),
) -> User:
    if creds is None or not creds.credentials:
        raise HTTPException(401, "Not authenticated")

    payload = _decode_supabase_access_token(creds.credentials)
    sub = payload.get("sub")
    if not sub:
        raise HTTPException(401, "Invalid token")
    try:
        user_uuid = UUID(sub)
    except ValueError:
        raise HTTPException(401, "Invalid token subject")

    return _ensure_profile(db, user_uuid, payload)


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return user_dict(current_user)
