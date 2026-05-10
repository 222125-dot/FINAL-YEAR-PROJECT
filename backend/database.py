"""
database.py — PostgreSQL / SQLite with SQLAlchemy.
SQLite: tables created on startup. Managed Postgres (Supabase): use migrations.
"""

from sqlalchemy import (
    create_engine, Column, String, Float, Integer,
    DateTime, Text, JSON, Uuid,
)
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# ─── DATABASE URL ──────────────────────────────────────────────────────────
# Format: postgresql://user:password@host:port/dbname or sqlite:///path/to/db.db
_RAW_DB_URL = os.getenv("DATABASE_URL", "").strip()
if _RAW_DB_URL and "://" not in _RAW_DB_URL:
    raise ValueError(
        "DATABASE_URL must be a full connection URI (not just the hostname). "
        "In Supabase: Project Settings -> Database -> copy 'URI' (Session pooler or Direct). "
        "Example shape: postgresql://postgres.[ref]:[password]@[host].pooler.supabase.com:6543/postgres"
    )
DATABASE_URL = _RAW_DB_URL or "sqlite:///./visio3d.db"

# ─── ENGINE ───────────────────────────────────────────────────────────────
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},  # needed for SQLite
        echo=False,
    )
else:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,       # auto-reconnect
        pool_size=5,
        max_overflow=10,
        echo=False,               # set True to debug SQL
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ═══════════════════════════════════════════
#  MODELS (Tables)
# ═══════════════════════════════════════════

class User(Base):
    """Profile row linked to auth.users.id (Supabase Auth)."""

    __tablename__ = "users"

    id         = Column(Uuid(as_uuid=True), primary_key=True)
    username   = Column(String(80),  unique=True, nullable=False, index=True)
    email      = Column(String(120), unique=True, nullable=False, index=True)
    full_name  = Column(String(120), default="")
    plan       = Column(String(20),  default="free")
    created_at = Column(DateTime, default=datetime.utcnow)


class Report(Base):
    __tablename__ = "reports"

    id                = Column(Integer, primary_key=True, index=True)
    scan_id           = Column(String(20),  unique=True, index=True)
    username          = Column(String(80),  nullable=False, index=True)
    organ             = Column(String(50),  default="Kidney")
    patient_id        = Column(String(50),  default="")
    date              = Column(DateTime,    default=datetime.utcnow)
    detections        = Column(JSON,        default=list)   # list of dicts
    total_found       = Column(Integer,     default=0)
    overall_severity  = Column(String(20),  default="Low")
    confidence        = Column(Float,       default=0.0)
    analysis_time     = Column(Float,       default=0.0)
    model_3d_url      = Column(String(300), default="")
    recommendations   = Column(JSON,        default=list)


class QueryMessage(Base):
    __tablename__ = "query_messages"

    id         = Column(Integer, primary_key=True, index=True)
    username   = Column(String(80),  nullable=False, index=True)
    full_name  = Column(String(120), default="")
    email      = Column(String(120), nullable=False, index=True)
    message    = Column(Text,         nullable=False)
    source     = Column(String(50),   default="about")
    created_at = Column(DateTime,     default=datetime.utcnow)


# ─── CREATE ALL TABLES ────────────────────────────────────────────────────
def init_db():
    """Create tables for local SQLite only; managed Postgres uses migrations."""
    if DATABASE_URL.startswith("sqlite"):
        Base.metadata.create_all(bind=engine)
        print("✅ SQLite tables created/verified")
    else:
        print("✅ External PostgreSQL — schema managed via migrations (skipped create_all)")


# ─── DEPENDENCY ──────────────────────────────────────────────────────────
def get_db():
    """FastAPI dependency — yields a DB session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
