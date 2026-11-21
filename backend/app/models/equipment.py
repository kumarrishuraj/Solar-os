"""SQLAlchemy model for equipment table.

Serialized hardware units tracking (panels, inverters, batteries).
"""

import uuid
from datetime import datetime, date, timezone
from typing import Optional, List
from sqlalchemy import (
    String,
    Date,
    DateTime,
    ForeignKey,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class EquipmentModel(Base):
    """Equipment serialized unit entity mapped to PostgreSQL equipment table."""

    __tablename__ = "equipment"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("products.id", ondelete="RESTRICT"), nullable=False)
    serial_number: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)
    supplier: Mapped[str] = mapped_column(String(150), nullable=False)
    purchase_date: Mapped[date] = mapped_column(Date, nullable=False)
    warranty_start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    warranty_end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    equipment_status: Mapped[str] = mapped_column(String(40), default="in_stock", nullable=False)
    project_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid(as_uuid=True), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    installation_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid(as_uuid=True), ForeignKey("installations.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    product = relationship("ProductModel", back_populates="equipment_units")
    project = relationship("ProjectModel", back_populates="equipment_items")
    installation = relationship("InstallationModel", back_populates="equipment_units", foreign_keys=[installation_id])
    warranties = relationship("WarrantyModel", back_populates="equipment")
    telemetry_readings = relationship("TelemetryModel", back_populates="equipment", cascade="all, delete-orphan")
    service_tickets = relationship("ServiceTicketModel", back_populates="equipment")
