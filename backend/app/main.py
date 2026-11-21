"""SolarOS FastAPI Application Entrypoint.

Initializes the FastAPI application, registers middleware (CORS, error handlers),
and mounts core API routers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import health
from app.schemas.health import RootInfoResponse

# Initialize FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Powered Solar Installation Management Platform API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Configure Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
# Health endpoints mounted at root (/health) and also under API prefix (/api/v1/health)
app.include_router(health.router)
app.include_router(health.router, prefix=settings.API_V1_STR)


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
        version="0.1.0",
        description="AI-Powered Solar Installation Management Platform API",
        status="online",
        docs_url="/docs",
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
