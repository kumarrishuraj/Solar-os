"""Pydantic schemas for customers."""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class CustomerCreate(BaseModel):
    """Customer creation payload."""

    full_name: str = Field(..., max_length=150)
    email: Optional[str] = None
    phone: str = Field(..., max_length=20)
    alternate_phone: Optional[str] = Field(None, max_length=20)
    property_address: str
    city: str = Field(..., max_length=100)
    state: str = Field(..., max_length=100)
    postal_code: str = Field(..., max_length=10)
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    property_type: Optional[str] = "residential"
    notes: Optional[str] = None


class CustomerUpdate(BaseModel):
    """Customer update payload."""

    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    alternate_phone: Optional[str] = None
    property_address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    property_type: Optional[str] = None
    notes: Optional[str] = None


class CustomerResponse(BaseModel):
    """Customer response representation."""

    id: uuid.UUID
    full_name: str
    email: Optional[str] = None
    phone: str
    alternate_phone: Optional[str] = None
    property_address: str
    city: str
    state: str
    postal_code: str
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    property_type: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
