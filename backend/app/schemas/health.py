"""Pydantic schemas for application health and status checks."""

from datetime import datetime, timezone
from pydantic import BaseModel, Field


class HealthCheckResponse(BaseModel):
    """Schema representing system health check response."""

    status: str = Field(..., description="Overall service health status ('healthy', 'degraded', 'unhealthy')")
    environment: str = Field(..., description="Active runtime environment name")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="UTC timestamp of the health check")
    database: str = Field(..., description="Database connection health status ('connected', 'disconnected')")
    version: str = Field(..., description="API version identifier")


class RootInfoResponse(BaseModel):
    """Schema representing root endpoint API metadata."""

    name: str = Field(..., description="Project name")
    version: str = Field(..., description="Application version")
    description: str = Field(..., description="Brief project description")
    status: str = Field(..., description="API status")
    docs_url: str = Field(..., description="Path to interactive Swagger documentation")
