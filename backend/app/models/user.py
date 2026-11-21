"""SQLAlchemy model for users table.

Internal staff, operators, engineers, and field technicians.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import String, Boolean, DateTime, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class UserModel(Base):
    """Staff user entity mapped to the PostgreSQL users table."""

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    auth_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid(as_uuid=True), unique=True, nullable=True)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    role: Mapped[str] = mapped_column(String(30), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    assigned_leads = relationship("LeadModel", back_populates="assigned_salesperson", foreign_keys="LeadModel.assigned_salesperson_id")
    assigned_surveys = relationship("SiteSurveyModel", back_populates="surveyor", foreign_keys="SiteSurveyModel.surveyor_id")
    approved_surveys = relationship("SiteSurveyModel", back_populates="approver", foreign_keys="SiteSurveyModel.approved_by")
    assigned_installations = relationship("InstallationModel", back_populates="assigned_technician", foreign_keys="InstallationModel.assigned_technician_id")
    assigned_service_tickets = relationship("ServiceTicketModel", back_populates="assigned_technician", foreign_keys="ServiceTicketModel.assigned_technician_id")
