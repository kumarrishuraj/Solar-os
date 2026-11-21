"""Pydantic schemas for warehouse inventory and stock movements."""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.product import ProductResponse


class InventoryStockAdjustRequest(BaseModel):
    """Stock adjustment or reservation payload."""

    action: str = Field(..., description="One of: 'adjust', 'reserve', 'release'")
    warehouse_name: str
    quantity: Decimal = Field(..., gt=0)
    reference_type: Optional[str] = None
    reference_id: Optional[uuid.UUID] = None
    notes: Optional[str] = None


class InventoryStockResponse(BaseModel):
    """Warehouse inventory level response."""

    id: uuid.UUID
    product_id: uuid.UUID
    warehouse_name: str
    quantity_on_hand: Decimal
    quantity_reserved: Decimal
    available_stock: Decimal
    reorder_level: Decimal
    updated_at: datetime
    product: Optional[ProductResponse] = None

    model_config = ConfigDict(from_attributes=True)


class InventoryMovementResponse(BaseModel):
    """Stock movement ledger entry response."""

    id: uuid.UUID
    product_id: uuid.UUID
    inventory_id: uuid.UUID
    movement_type: str
    quantity: Decimal
    reference_type: Optional[str] = None
    reference_id: Optional[uuid.UUID] = None
    performed_by: Optional[uuid.UUID] = None
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
