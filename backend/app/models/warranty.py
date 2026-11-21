"""SQLAlchemy model for warranties table.

Warranty certificates and guarantees mapped to serialized hardware and customer.
"""

import uuid
from datetime import datetime, date, timezone
from typing import Optional
from sqlalchemy import (
    String,
    Text,
    Date,
    DateTime,
    ForeignKey,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class WarrantyModel(Base):
    """Warranty certificate entity mapped to PostgreSQL warranties table."""

    __tablename__ = "warranties"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    equipment_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("equipment.id", ondelete="RESTRICT"), nullable=False)
    customer_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("customers.id", ondelete="RESTRICT"), nullable=False)
    warranty_start_date: Mapped[date] = mapped_column(Date, nullable=False)
    warranty_end_date: Mapped[date] = mapped_column(Date, nullable=False)
    warranty_status: Mapped[str] = mapped_column(String(30), default="active", nullable=False)
    warranty_document_path: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    equipment = relationship("EquipmentModel", back_populates="warranties")
    customer = relationship("CustomerModel", back_populates="warranties")
