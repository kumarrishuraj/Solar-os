"""SQLAlchemy model for customers table.

Customer and property owner accounts.
"""

import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional, List
from sqlalchemy import String, Text, Numeric, DateTime, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class CustomerModel(Base):
    """Customer entity mapped to the PostgreSQL customers table."""

    __tablename__ = "customers"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    alternate_phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    property_address: Mapped[str] = mapped_column(Text, nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    postal_code: Mapped[str] = mapped_column(String(10), nullable=False)
    latitude: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 7), nullable=True)
    longitude: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 7), nullable=True)
    property_type: Mapped[Optional[str]] = mapped_column(String(50), default="residential", nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    leads = relationship("LeadModel", back_populates="customer")
    projects = relationship("ProjectModel", back_populates="customer")
    assessments = relationship("PropertyAssessmentModel", back_populates="customer")
    quotations = relationship("QuotationModel", back_populates="customer")
    warranties = relationship("WarrantyModel", back_populates="customer")
    service_tickets = relationship("ServiceTicketModel", back_populates="customer")
