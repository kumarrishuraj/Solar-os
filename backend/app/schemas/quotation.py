"""Pydantic schemas for quotations and quotation items."""

import uuid
from datetime import datetime, date
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class QuotationItemCreate(BaseModel):
    """Quotation line item creation."""

    product_id: uuid.UUID
    description: str
    quantity: Decimal = Field(..., gt=0)
    unit_price: Decimal = Field(..., ge=0)


class QuotationItemResponse(BaseModel):
    """Quotation line item response."""

    id: uuid.UUID
    quotation_id: uuid.UUID
    product_id: uuid.UUID
    description: str
    quantity: Decimal
    unit_price: Decimal
    total_price: Decimal

    model_config = ConfigDict(from_attributes=True)


class QuotationCreate(BaseModel):
    """Commercial quotation proposal creation."""

    project_id: uuid.UUID
    customer_id: uuid.UUID
    system_capacity_kw: Decimal = Field(..., ge=0)
    items: List[QuotationItemCreate]
    discount: Optional[Decimal] = Decimal("0.00")
    gst_percent: Optional[Decimal] = Decimal("18.00")  # Default 18% GST in India
    installation_charges: Optional[Decimal] = Decimal("0.00")
    valid_until: date


class QuotationRejectRequest(BaseModel):
    """Quotation rejection request."""

    rejection_reason: Optional[str] = None


class QuotationResponse(BaseModel):
    """Quotation response representation."""

    id: uuid.UUID
    quotation_number: str
    project_id: uuid.UUID
    customer_id: uuid.UUID
    system_capacity_kw: Decimal
    subtotal: Decimal
    discount: Decimal
    gst_amount: Decimal
    installation_charges: Decimal
    total_amount: Decimal
    quotation_status: str
    valid_until: date
    approved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    items: List[QuotationItemResponse] = []

    model_config = ConfigDict(from_attributes=True)
