"""Pydantic schemas for serialized equipment."""

import uuid
from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.product import ProductResponse


class EquipmentCreate(BaseModel):
    """Equipment registration payload."""

    product_id: uuid.UUID
    serial_number: str = Field(..., max_length=150)
    supplier: str = Field(..., max_length=150)
    purchase_date: date
    equipment_status: Optional[str] = "in_stock"
    project_id: Optional[uuid.UUID] = None
    installation_id: Optional[uuid.UUID] = None


class EquipmentDispatch(BaseModel):
    """Equipment assignment and dispatch payload."""

    project_id: uuid.UUID
    installation_id: Optional[uuid.UUID] = None


class EquipmentResponse(BaseModel):
    """Equipment serialized unit response."""

    id: uuid.UUID
    product_id: uuid.UUID
    serial_number: str
    supplier: str
    purchase_date: date
    warranty_start_date: Optional[date] = None
    warranty_end_date: Optional[date] = None
    equipment_status: str
    project_id: Optional[uuid.UUID] = None
    installation_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime
    product: Optional[ProductResponse] = None

    model_config = ConfigDict(from_attributes=True)
