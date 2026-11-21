"""Pydantic schemas for warranties."""

import uuid
from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, ConfigDict


class WarrantyCreate(BaseModel):
    """Warranty certificate creation payload."""

    equipment_id: uuid.UUID
    customer_id: uuid.UUID
    warranty_start_date: date
    warranty_months: Optional[int] = None
    warranty_end_date: Optional[date] = None
    warranty_document_path: Optional[str] = None


class WarrantyResponse(BaseModel):
    """Warranty certificate representation."""

    id: uuid.UUID
    equipment_id: uuid.UUID
    customer_id: uuid.UUID
    warranty_start_date: date
    warranty_end_date: date
    warranty_status: str
    warranty_document_path: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
