"""SQLAlchemy model for leads table.

Inbound commercial leads and solar enquiries intake pipeline.
"""

import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional, List
from sqlalchemy import String, Text, Numeric, DateTime, ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class LeadModel(Base):
    """Lead entity mapped to the PostgreSQL leads table."""

    __tablename__ = "leads"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lead_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    customer_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("customers.id", ondelete="RESTRICT"), nullable=False)
    source: Mapped[Optional[str]] = mapped_column(String(50), default="website", nullable=True)
    monthly_electricity_bill: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2), nullable=True)
    monthly_consumption_kwh: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2), nullable=True)
    estimated_system_capacity_kw: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    status: Mapped[str] = mapped_column(String(40), default="new", nullable=False)
    assigned_salesperson_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    customer = relationship("CustomerModel", back_populates="leads")
    assigned_salesperson = relationship("UserModel", back_populates="assigned_leads", foreign_keys=[assigned_salesperson_id])
    projects = relationship("ProjectModel", back_populates="lead")
    assessments = relationship("PropertyAssessmentModel", back_populates="lead")
