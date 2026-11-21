"""Pydantic schemas for products catalog."""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class ProductCreate(BaseModel):
    """Product catalog creation schema."""

    sku: str = Field(..., max_length=80)
    product_name: str = Field(..., max_length=200)
    brand: str = Field(..., max_length=100)
    model: str = Field(..., max_length=100)
    category: str = Field(..., max_length=60)
    rated_power_w: Optional[Decimal] = None
    voltage: Optional[Decimal] = None
    current: Optional[Decimal] = None
    technical_specifications: Optional[Dict[str, Any]] = None
    purchase_price: Decimal = Field(..., ge=0)
    selling_price: Decimal = Field(..., ge=0)
    warranty_months: int = Field(60, ge=0)
    is_active: bool = True


class ProductUpdate(BaseModel):
    """Product catalog update schema."""

    product_name: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    category: Optional[str] = None
    rated_power_w: Optional[Decimal] = None
    voltage: Optional[Decimal] = None
    current: Optional[Decimal] = None
    technical_specifications: Optional[Dict[str, Any]] = None
    purchase_price: Optional[Decimal] = None
    selling_price: Optional[Decimal] = None
    warranty_months: Optional[int] = None
    is_active: Optional[bool] = None


class ProductResponse(BaseModel):
    """Product catalog item response."""

    id: uuid.UUID
    sku: str
    product_name: str
    brand: str
    model: str
    category: str
    rated_power_w: Optional[Decimal] = None
    voltage: Optional[Decimal] = None
    current: Optional[Decimal] = None
    technical_specifications: Dict[str, Any] = {}
    purchase_price: Decimal
    selling_price: Decimal
    warranty_months: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
