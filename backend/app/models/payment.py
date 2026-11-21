"""SQLAlchemy model for payments table.

Customer deposits, milestone payments, and bank remittances.
"""

import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional
from sqlalchemy import (
    String,
    Numeric,
    DateTime,
    ForeignKey,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class PaymentModel(Base):
    """Payment transaction entity mapped to PostgreSQL payments table."""

    __tablename__ = "payments"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("projects.id", ondelete="RESTRICT"), nullable=False)
    quotation_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid(as_uuid=True), ForeignKey("quotations.id", ondelete="SET NULL"), nullable=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    payment_method: Mapped[str] = mapped_column(String(40), nullable=False)
    transaction_reference: Mapped[str] = mapped_column(String(150), nullable=False)
    payment_status: Mapped[str] = mapped_column(String(30), default="pending", nullable=False)
    payment_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    project = relationship("ProjectModel", back_populates="payments")
    quotation = relationship("QuotationModel", back_populates="payments")
