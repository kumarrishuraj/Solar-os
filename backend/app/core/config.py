"""Application Configuration Module.

Loads and validates environment variables using Pydantic Settings.
"""

from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application runtime settings and environment variables."""

    PROJECT_NAME: str = "SolarOS"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # CORS configuration
    ALLOWED_ORIGINS: Union[str, List[str]] = "http://localhost:3000,http://127.0.0.1:3000"

    @field_validator("ALLOWED_ORIGINS", mode="after")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        """Convert comma-delimited string to list if necessary."""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    # Supabase / PostgreSQL Database Connection URL
    # Default fallback to in-memory SQLite for local testing without external database
    DATABASE_URL: str = "sqlite:///./solaros_dev.db"

    # Supabase Credentials (optional for starter setup)
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # AI & Computer Vision configurations
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    YOLO_WEIGHTS_PATH: str = "app/ai/weights/yolov8_rooftop.pt"
    CONFIDENCE_THRESHOLD: float = 0.45

    # Security
    SECRET_KEY: str = "solaros-hackathon-development-secret-key-change-in-prod"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


# Global settings singleton
settings = Settings()
