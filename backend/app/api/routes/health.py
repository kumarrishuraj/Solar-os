"""Health and diagnostics API endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.schemas.health import HealthCheckResponse

router = APIRouter(tags=["Health & Diagnostics"])


@router.get(
    "/health",
    response_model=HealthCheckResponse,
    summary="Service Health Check",
    description="Returns application health status, database connectivity, and environment metadata.",
)
def get_health_status(db: Session = Depends(get_db)) -> HealthCheckResponse:
    """Evaluate database connectivity and return overall service status."""
    db_status = "connected"
    try:
        # Simple test query to ensure database connection pool is responsive
        db.execute(text("SELECT 1"))
    except Exception:
        db_status = "disconnected"

    overall_status = "healthy" if db_status == "connected" else "degraded"

    return HealthCheckResponse(
        status=overall_status,
        environment=settings.ENVIRONMENT,
        database=db_status,
        version="0.1.0",
    )
