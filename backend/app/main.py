"""SolarOS FastAPI Application Entrypoint.

Initializes the FastAPI application, configures CORS and static uploads,
mounts all modular REST routers under /api/v1, and manages database readiness.
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
import app.models  # Ensure all 22 models are imported and registered

from app.api.routes import (
    health,
    auth,
    leads,
    assessments,
    recommendations,
    surveys,
    projects,
    quotations,
    payments,
    inventory,
    equipment,
    installations,
    warranties,
    monitoring,
    service_tickets,
    analytics,
)
from app.schemas.health import RootInfoResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle management."""
    # Ensure local upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    # Ensure database schema tables exist (auto-create for SQLite or initial setup)
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        from app.services.auth_service import seed_default_users_if_needed
        seed_default_users_if_needed(db)
    yield


# Initialize FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="SolarOS — AI-Powered Solar Installation Management Platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Configure Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local uploads directory if present
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Health endpoints mounted at root (/health) and also under API prefix (/api/v1/health)
app.include_router(health.router)
app.include_router(health.router, prefix=settings.API_V1_STR)

# Mount all domain routers under /api/v1
api_v1 = settings.API_V1_STR
app.include_router(auth.router, prefix=api_v1)
app.include_router(leads.router, prefix=api_v1)
app.include_router(assessments.router, prefix=api_v1)
app.include_router(recommendations.router, prefix=api_v1)
app.include_router(surveys.router, prefix=api_v1)
app.include_router(projects.router, prefix=api_v1)
app.include_router(quotations.router, prefix=api_v1)
app.include_router(payments.router, prefix=api_v1)
app.include_router(inventory.router, prefix=api_v1)
app.include_router(equipment.router, prefix=api_v1)
app.include_router(installations.router, prefix=api_v1)
app.include_router(warranties.router, prefix=api_v1)
app.include_router(monitoring.router, prefix=api_v1)
app.include_router(service_tickets.router, prefix=api_v1)
app.include_router(analytics.router, prefix=api_v1)


@app.get(
    "/",
    response_model=RootInfoResponse,
    tags=["Root"],
    summary="Root API Information",
    description="Returns metadata about the SolarOS backend API.",
)
def root() -> RootInfoResponse:
    """Return basic API metadata."""
    return RootInfoResponse(
        name=settings.PROJECT_NAME,
        version="1.0.0",
        description="SolarOS — AI-Powered Solar Installation Management Platform API",
        status="online",
        docs_url="/docs",
    )


def init_db():
    """Helper to initialize tables and default seed data for standalone runs."""
    Base.metadata.create_all(bind=engine)
    from app.services.auth_service import seed_default_users_if_needed
    with SessionLocal() as db:
        seed_default_users_if_needed(db)


if __name__ == "__main__":
    import uvicorn

    init_db()
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
