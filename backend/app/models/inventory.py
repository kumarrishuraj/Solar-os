"""SQLAlchemy models for inventory and inventory_movements tables.

Warehouse stock levels, reservations, adjustments, and immutable movement ledger.
"""

import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional, List
from sqlalchemy import (
    String,
    Text,
    Numeric,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class InventoryModel(Base):
    """Warehouse stock entity mapped to PostgreSQL inventory table."""

    __tablename__ = "inventory"
    __table_args__ = (UniqueConstraint("product_id", "warehouse_name", name="uq_inventory_product_warehouse"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("products.id", ondelete="RESTRICT"), nullable=False)
    warehouse_name: Mapped[str] = mapped_column(String(150), nullable=False)
    quantity_on_hand: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    quantity_reserved: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    reorder_level: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("5.00"), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    product = relationship("ProductModel", back_populates="inventory_entries")
    movements = relationship("InventoryMovementModel", back_populates="inventory")

    @property
    def available_stock(self) -> Decimal:
        """Calculate available free stock."""
        return self.quantity_on_hand - self.quantity_reserved


class InventoryMovementModel(Base):
    """Stock movement ledger entity mapped to PostgreSQL inventory_movements table."""

    __tablename__ = "inventory_movements"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("products.id", ondelete="RESTRICT"), nullable=False)
    inventory_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("inventory.id", ondelete="RESTRICT"), nullable=False)
    movement_type: Mapped[str] = mapped_column(String(30), nullable=False)
    quantity: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    reference_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    reference_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid(as_uuid=True), nullable=True)
    performed_by: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    product = relationship("ProductModel", back_populates="inventory_movements")
    inventory = relationship("InventoryModel", back_populates="movements")
