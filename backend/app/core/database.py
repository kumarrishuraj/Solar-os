"""SQLAlchemy Database Engine and Session Management.

Provides database connection pooling and request-scoped session dependencies.
"""

from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings

# Configure SQLite or PostgreSQL connection arguments
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

# Create SQLAlchemy engine with connection pool
engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
)

# Request-scoped session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# Declarative base class for ORM models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """Dependency that provides a request-scoped database session.

    Ensures transactions are safely closed after request lifecycle finishes.
    """
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
