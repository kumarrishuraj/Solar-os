"""SQLAlchemy model for service_tickets table.

Post-commissioning corrective & preventive maintenance service tickets.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import (
    String,
    Text,
    DateTime,
    ForeignKey,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class ServiceTicketModel(Base):
    """Service ticket entity mapped to PostgreSQL service_tickets table."""

    __tablename__ = "service_tickets"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticket_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    customer_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("customers.id", ondelete="RESTRICT"), nullable=False)
    project_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid(as_uuid=True), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    equipment_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid(as_uuid=True), ForeignKey("equipment.id", ondelete="SET NULL"), nullable=True)
    issue_description: Mapped[str] = mapped_column(Text, nullable=False)
    issue_category: Mapped[str] = mapped_column(String(50), nullable=False)
    priority: Mapped[str] = mapped_column(String(20), default="medium", nullable=False)
    assigned_technician_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    ticket_status: Mapped[str] = mapped_column(String(40), default="open", nullable=False)
    resolution_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    customer = relationship("CustomerModel", back_populates="service_tickets")
    project = relationship("ProjectModel", back_populates="service_tickets")
    equipment = relationship("EquipmentModel", back_populates="service_tickets")
    assigned_technician = relationship("UserModel", back_populates="assigned_service_tickets", foreign_keys=[assigned_technician_id])
