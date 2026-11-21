"""SQLAlchemy models for installations and installation_checklist tables.

Field installations, technician assignments, SOP checklist signoffs, and commissioning.
"""

import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional, List, Any
from sqlalchemy import (
    String,
    Text,
    Numeric,
    Boolean,
    DateTime,
    ForeignKey,
    JSON,
    Uuid,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class InstallationModel(Base):
    """Field installation entity mapped to PostgreSQL installations table."""

    __tablename__ = "installations"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("projects.id", ondelete="RESTRICT"), nullable=False)
    installation_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    assigned_technician_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    scheduled_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    start_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completion_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    installation_status: Mapped[str] = mapped_column(String(40), default="scheduled", nullable=False)
    progress_percentage: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal("0.00"), nullable=False)
    system_capacity_kw: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    testing_results: Mapped[Any] = mapped_column(JSON().with_variant(JSONB, "postgresql"), default=dict)
    customer_confirmation: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    project = relationship("ProjectModel", back_populates="installations")
    assigned_technician = relationship("UserModel", back_populates="assigned_installations", foreign_keys=[assigned_technician_id])
    checklist_items = relationship("InstallationChecklistModel", back_populates="installation", cascade="all, delete-orphan")
    equipment_units = relationship("EquipmentModel", back_populates="installation", foreign_keys="EquipmentModel.installation_id")

    @property
    def checklist(self):
        """Alias for checklist_items to match API schema contract."""
        return self.checklist_items


class InstallationChecklistModel(Base):
    """Checklist SOP item entity mapped to PostgreSQL installation_checklist table."""

    __tablename__ = "installation_checklist"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    installation_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("installations.id", ondelete="CASCADE"), nullable=False)
    task_name: Mapped[str] = mapped_column(String(200), nullable=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    completed_by: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    installation = relationship("InstallationModel", back_populates="checklist_items")
    completed_by_user = relationship("UserModel", foreign_keys=[completed_by])
