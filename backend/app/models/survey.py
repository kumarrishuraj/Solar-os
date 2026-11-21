"""SQLAlchemy model for site_surveys table.

On-site physical engineering audits by field site surveyors.
"""

import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional
from sqlalchemy import String, Text, Numeric, DateTime, ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class SiteSurveyModel(Base):
    """Site survey entity mapped to PostgreSQL site_surveys table."""

    __tablename__ = "site_surveys"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("projects.id", ondelete="RESTRICT"), nullable=False)
    assessment_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid(as_uuid=True), ForeignKey("property_assessments.id", ondelete="SET NULL"), nullable=True)
    surveyor_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    scheduled_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    actual_survey_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    verified_roof_area: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2), nullable=True)
    verified_roof_orientation: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    verified_roof_tilt: Mapped[Optional[Decimal]] = mapped_column(Numeric(6, 2), nullable=True)
    structural_observations: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    shading_observations: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    cable_distance: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    electrical_observations: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    safety_observations: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    approval_status: Mapped[str] = mapped_column(String(30), default="pending", nullable=False)
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    approved_by: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    project = relationship("ProjectModel", back_populates="surveys")
    assessment = relationship("PropertyAssessmentModel", back_populates="surveys")
    surveyor = relationship("UserModel", back_populates="assigned_surveys", foreign_keys=[surveyor_id])
    approver = relationship("UserModel", back_populates="approved_surveys", foreign_keys=[approved_by])
