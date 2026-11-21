"""Pydantic schemas for authentication and user identities."""

import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class Token(BaseModel):
    """JWT response payload."""

    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: str
    email: str
    full_name: str


class LoginRequest(BaseModel):
    """Staff user credentials login request."""

    email: str = Field(..., max_length=255)
    password: str


class UserCreate(BaseModel):
    """Internal user creation schema."""

    full_name: str = Field(..., max_length=150)
    email: str = Field(..., max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    role: str
    password: Optional[str] = None


class UserResponse(BaseModel):
    """Staff user response model."""

    id: uuid.UUID
    auth_user_id: Optional[uuid.UUID] = None
    full_name: str
    email: str
    phone: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
