"""
Auth Routes — PostgreSQL version
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv

from database import get_db, User

load_dotenv()

import logging
logger = logging.getLogger("visio3d")

import re

router = APIRouter()

SECRET_KEY   = os.getenv("SECRET_KEY", "visio3d-super-secret-key-2025-change-me")
ALGORITHM    = "HS256"
EXPIRE_HOURS = 24 * 7

# Use pbkdf2_sha256 instead of bcrypt - no 72 byte limitation
pwd_ctx       = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


class SignupRequest(BaseModel):
    username:  str
    email:     str
    password:  str
    full_name: Optional[str] = ""


class LoginRequest(BaseModel):
    username: str
    password: str


def hash_pw(pw: str) -> str:
    return pwd_ctx.hash(pw)

def verify_pw(plain: str, hashed: str) -> bool:
    return pwd_ctx.verify(plain, hashed)

def make_token(username: str) -> str:
    exp = datetime.utcnow() + timedelta(hours=EXPIRE_HOURS)
    return jwt.encode({"sub": username, "exp": exp}, SECRET_KEY, algorithm=ALGORITHM)

def user_dict(u: User) -> dict:
    return {
        "id": u.id, "username": u.username, "email": u.email,
        "full_name": u.full_name, "plan": u.plan,
        "created_at": u.created_at.isoformat() if u.created_at else "",
    }


def get_current_user(
    token: str     = Depends(oauth2_scheme),
    db:    Session = Depends(get_db)
) -> User:
    try:
        payload  = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise HTTPException(401, "Invalid token")
    except JWTError:
        raise HTTPException(401, "Token expired — please login again")
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(401, "User not found")
    return user


@router.post("/signup")
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    logger.info(f"Signup attempt: {req.username}, {req.email}")
    try:
        # SECURITY: Input sanitization — only allow safe characters
        if not re.match(r'^[a-zA-Z0-9_.-]+$', req.username.strip()):
            raise HTTPException(400, "Username can only contain letters, numbers, dots, hyphens and underscores")
        if len(req.username.strip()) < 3:
            raise HTTPException(400, "Username must be at least 3 characters")
        if len(req.username.strip()) > 30:
            raise HTTPException(400, "Username too long (max 30 characters)")
        if len(req.password) < 4:
            raise HTTPException(400, "Password too short (min 4)")
        if "@" not in req.email:
            raise HTTPException(400, "Invalid email")
        if db.query(User).filter(User.username == req.username.strip()).first():
            raise HTTPException(400, "Username already taken")
        if db.query(User).filter(User.email == req.email.lower().strip()).first():
            raise HTTPException(400, "Email already registered")

        user = User(
            username=req.username.strip(),
            email=req.email.lower().strip(),
            password=hash_pw(req.password),  # hash_pw will handle truncation
            full_name=req.full_name.strip() if req.full_name else req.username.strip(),
            plan="free",
            created_at=datetime.utcnow(),
        )
        print(f"Creating user: {user.username}")
        db.add(user)
        db.commit()
        db.refresh(user)
        logger.info(f"User created: {user.id}")
        return {"access_token": make_token(user.username), "token_type": "bearer", "user": user_dict(user)}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in signup: {e}")
        db.rollback()
        raise HTTPException(500, "Registration failed. Please try again.")


@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == req.username.strip()).first()
    if not user or not verify_pw(req.password, user.password):
        raise HTTPException(401, "Wrong username or password")
    return {"access_token": make_token(user.username), "token_type": "bearer", "user": user_dict(user)}


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return user_dict(current_user)
