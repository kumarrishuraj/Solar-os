"""SQLAlchemy model for products table.

Master equipment catalog for solar hardware components.
"""

import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional, List, Any
from sqlalchemy import String, Numeric, Integer, Boolean, DateTime, JSON, Uuid
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class ProductModel(Base):
    """Product master catalog entity mapped to PostgreSQL products table."""

    __tablename__ = "products"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sku: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    product_name: Mapped[str] = mapped_column(String(200), nullable=False)
    brand: Mapped[str] = mapped_column(String(100), nullable=False)
    model: Mapped[str] = mapped_column(String(100), nullable=False)
    category: Mapped[str] = mapped_column(String(60), nullable=False)
    rated_power_w: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    voltage: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    current: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    technical_specifications: Mapped[Any] = mapped_column(JSON().with_variant(JSONB, "postgresql"), default=dict)
    purchase_price: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    selling_price: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    warranty_months: Mapped[int] = mapped_column(Integer, default=60, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    quotation_items = relationship("QuotationItemModel", back_populates="product")
    inventory_entries = relationship("InventoryModel", back_populates="product")
    inventory_movements = relationship("InventoryMovementModel", back_populates="product")
    equipment_units = relationship("EquipmentModel", back_populates="product")
