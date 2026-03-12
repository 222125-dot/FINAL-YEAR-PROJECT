"""
Queries Routes
POST /api/queries/
GET  /api/queries/
"""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import QueryMessage, get_db
from routes.auth import User, get_current_user

router = APIRouter()


class QueryCreateRequest(BaseModel):
    name: str
    email: str
    message: str


def query_dict(q: QueryMessage) -> dict:
    return {
        "id": q.id,
        "username": q.username,
        "name": q.full_name,
        "email": q.email,
        "message": q.message,
        "source": q.source,
        "created_at": q.created_at.isoformat() if q.created_at else "",
    }


@router.post("/")
def create_query(
    req: QueryCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    name = req.name.strip()
    msg = req.message.strip()

    if len(name) < 2:
        raise HTTPException(status_code=400, detail="Name must be at least 2 characters")
    if "@" not in req.email or len(req.email.strip()) < 5:
        raise HTTPException(status_code=400, detail="Invalid email address")
    if len(msg) < 5:
        raise HTTPException(status_code=400, detail="Message must be at least 5 characters")

    query = QueryMessage(
        username=current_user.username,
        full_name=name,
        email=req.email.lower().strip(),
        message=msg,
        source="about",
        created_at=datetime.utcnow(),
    )
    db.add(query)
    db.commit()
    db.refresh(query)

    return {"message": "Query saved", "query": query_dict(query)}


@router.get("/")
def list_queries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(QueryMessage)
        .filter(QueryMessage.username == current_user.username)
        .order_by(QueryMessage.created_at.desc())
        .all()
    )
    return [query_dict(r) for r in rows]
