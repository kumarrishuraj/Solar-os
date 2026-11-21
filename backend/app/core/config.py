"""Application Configuration Module.

Loads and validates environment variables using Pydantic Settings
with robust fallback to standard Pydantic and python-dotenv.
"""

import os
from typing import List, Union
from dotenv import load_dotenv

# Load local .env file if present
load_dotenv()

try:
    from pydantic_settings import BaseSettings, SettingsConfigDict

    class Settings(BaseSettings):
        """Application runtime settings and environment variables."""

        PROJECT_NAME: str = os.getenv("PROJECT_NAME", "SolarOS")
        API_V1_STR: str = os.getenv("API_V1_STR", "/api/v1")
        ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
        DEBUG: bool = os.getenv("DEBUG", "true").lower() in ("true", "1", "yes")
        PORT: int = int(os.getenv("PORT", "8000"))
        HOST: str = os.getenv("HOST", "0.0.0.0")

        # CORS configuration
        ALLOWED_ORIGINS: Union[str, List[str]] = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,*")

        # Supabase / PostgreSQL Database Connection URL
        DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./solaros_dev.db")

        # Supabase Credentials
        SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
        SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
        SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
        SUPABASE_STORAGE_BUCKET: str = os.getenv("SUPABASE_STORAGE_BUCKET", "solaros-uploads")

        # Local Storage Fallback Directory
        UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
        MAX_UPLOAD_SIZE_BYTES: int = int(os.getenv("MAX_UPLOAD_SIZE_BYTES", str(10 * 1024 * 1024)))
        ALLOWED_IMAGE_MIME_TYPES: List[str] = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf",
        ]

        # Authentication & Security Secrets
        SECRET_KEY: str = os.getenv("SECRET_KEY", "solaros-hackathon-development-secret-key-change-in-prod")
        ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
        ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

        model_config = SettingsConfigDict(
            env_file=".env",
            env_file_encoding="utf-8",
            case_sensitive=True,
            extra="ignore",
        )

except ImportError:
    from pydantic import BaseModel

    class Settings(BaseModel):  # type: ignore
        """Application runtime settings using standard Pydantic and os.environ."""

        PROJECT_NAME: str = os.getenv("PROJECT_NAME", "SolarOS")
        API_V1_STR: str = os.getenv("API_V1_STR", "/api/v1")
        ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
        DEBUG: bool = os.getenv("DEBUG", "true").lower() in ("true", "1", "yes")
        PORT: int = int(os.getenv("PORT", "8000"))
        HOST: str = os.getenv("HOST", "0.0.0.0")

        # CORS configuration
        ALLOWED_ORIGINS: Union[str, List[str]] = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,*")

        # Supabase / PostgreSQL Database Connection URL
        DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./solaros_dev.db")

        # Supabase Credentials
        SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
        SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
        SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
        SUPABASE_STORAGE_BUCKET: str = os.getenv("SUPABASE_STORAGE_BUCKET", "solaros-uploads")

        # Local Storage Fallback Directory
        UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
        MAX_UPLOAD_SIZE_BYTES: int = int(os.getenv("MAX_UPLOAD_SIZE_BYTES", str(10 * 1024 * 1024)))
        ALLOWED_IMAGE_MIME_TYPES: List[str] = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf",
        ]

        # Authentication & Security Secrets
        SECRET_KEY: str = os.getenv("SECRET_KEY", "solaros-hackathon-development-secret-key-change-in-prod")
        ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
        ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))


# Global settings singleton
settings = Settings()

# Ensure ALLOWED_ORIGINS is a list
if isinstance(settings.ALLOWED_ORIGINS, str):
    if settings.ALLOWED_ORIGINS == "*":
        settings.ALLOWED_ORIGINS = ["*"]
    else:
        settings.ALLOWED_ORIGINS = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]
