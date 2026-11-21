"""SQLAlchemy models for quotations and quotation_items tables.

Commercial proposals, itemized BOM pricing, GST and installation calculations.
"""

import uuid
from datetime import datetime, date, timezone
from decimal import Decimal
from typing import Optional, List
from sqlalchemy import (
    String,
    Text,
    Numeric,
    Date,
    DateTime,
    ForeignKey,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class QuotationModel(Base):
    """Quotation entity mapped to PostgreSQL quotations table."""

    __tablename__ = "quotations"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quotation_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    project_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("projects.id", ondelete="RESTRICT"), nullable=False)
    customer_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("customers.id", ondelete="RESTRICT"), nullable=False)
    system_capacity_kw: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    discount: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=Decimal("0.00"), nullable=False)
    gst_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=Decimal("0.00"), nullable=False)
    installation_charges: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=Decimal("0.00"), nullable=False)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    quotation_status: Mapped[str] = mapped_column(String(30), default="draft", nullable=False)
    valid_until: Mapped[date] = mapped_column(Date, nullable=False)
    approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    project = relationship("ProjectModel", back_populates="quotations")
    customer = relationship("CustomerModel", back_populates="quotations")
    items = relationship("QuotationItemModel", back_populates="quotation", cascade="all, delete-orphan")
    payments = relationship("PaymentModel", back_populates="quotation")


class QuotationItemModel(Base):
    """Line item entity mapped to PostgreSQL quotation_items table."""

    __tablename__ = "quotation_items"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quotation_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("quotations.id", ondelete="CASCADE"), nullable=False)
    product_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("products.id", ondelete="RESTRICT"), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    quantity: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    total_price: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)

    # Relationships
    quotation = relationship("QuotationModel", back_populates="items")
    product = relationship("ProductModel", back_populates="quotation_items")
