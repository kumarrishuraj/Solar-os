"""SQLAlchemy model for projects table.

Solar installation lifecycle tracking across operational milestones.
"""

import uuid
from datetime import datetime, date, timezone
from decimal import Decimal
from typing import Optional, List
from sqlalchemy import String, Numeric, Date, DateTime, ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class ProjectModel(Base):
    """Project entity mapped to the PostgreSQL projects table."""

    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    customer_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("customers.id", ondelete="RESTRICT"), nullable=False)
    lead_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid(as_uuid=True), ForeignKey("leads.id", ondelete="SET NULL"), nullable=True)
    project_name: Mapped[str] = mapped_column(String(200), nullable=False)
    proposed_capacity_kw: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    approved_capacity_kw: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    project_status: Mapped[str] = mapped_column(String(50), default="enquiry", nullable=False)
    estimated_cost: Mapped[Optional[Decimal]] = mapped_column(Numeric(14, 2), nullable=True)
    final_cost: Mapped[Optional[Decimal]] = mapped_column(Numeric(14, 2), nullable=True)
    expected_completion_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    actual_completion_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    customer = relationship("CustomerModel", back_populates="projects")
    lead = relationship("LeadModel", back_populates="projects")
    assessments = relationship("PropertyAssessmentModel", back_populates="project")
    surveys = relationship("SiteSurveyModel", back_populates="project")
    recommendations = relationship("SolarRecommendationModel", back_populates="project")
    quotations = relationship("QuotationModel", back_populates="project")
    payments = relationship("PaymentModel", back_populates="project")
    equipment_items = relationship("EquipmentModel", back_populates="project")
    installations = relationship("InstallationModel", back_populates="project")
    service_tickets = relationship("ServiceTicketModel", back_populates="project")
