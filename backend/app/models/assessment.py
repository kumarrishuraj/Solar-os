"""SQLAlchemy models for property_assessments, assessment_images, and ai_analysis_results.
"""

import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional, List, Dict, Any
from sqlalchemy import (
    String,
    Text,
    Numeric,
    Integer,
    Boolean,
    BigInteger,
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


class PropertyAssessmentModel(Base):
    """Property assessment entity mapped to PostgreSQL property_assessments table."""

    __tablename__ = "property_assessments"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("customers.id", ondelete="RESTRICT"), nullable=False)
    lead_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid(as_uuid=True), ForeignKey("leads.id", ondelete="SET NULL"), nullable=True)
    project_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid(as_uuid=True), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    property_address: Mapped[str] = mapped_column(Text, nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    postal_code: Mapped[str] = mapped_column(String(10), nullable=False)
    latitude: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 7), nullable=True)
    longitude: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 7), nullable=True)
    roof_length: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    roof_width: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    roof_area: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2), nullable=True)
    usable_roof_area: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2), nullable=True)
    measurement_unit: Mapped[Optional[str]] = mapped_column(String(20), default="sq_meters", nullable=True)
    roof_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    roof_orientation: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    roof_tilt: Mapped[Optional[Decimal]] = mapped_column(Numeric(6, 2), nullable=True)
    number_of_roof_sections: Mapped[Optional[int]] = mapped_column(Integer, default=1, nullable=True)
    grid_availability: Mapped[Optional[bool]] = mapped_column(Boolean, default=True, nullable=True)
    monthly_bill: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2), nullable=True)
    monthly_consumption_kwh: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2), nullable=True)
    connection_phase: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    preferred_solar_type: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    budget: Mapped[Optional[Decimal]] = mapped_column(Numeric(14, 2), nullable=True)
    assessment_status: Mapped[str] = mapped_column(String(40), default="draft", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    customer = relationship("CustomerModel", back_populates="assessments")
    lead = relationship("LeadModel", back_populates="assessments")
    project = relationship("ProjectModel", back_populates="assessments")
    images = relationship("AssessmentImageModel", back_populates="assessment", cascade="all, delete-orphan")
    ai_results = relationship("AIAnalysisResultModel", back_populates="assessment", cascade="all, delete-orphan")
    recommendations = relationship("SolarRecommendationModel", back_populates="assessment", cascade="all, delete-orphan")
    surveys = relationship("SiteSurveyModel", back_populates="assessment")


class AssessmentImageModel(Base):
    """Assessment image reference entity mapped to PostgreSQL assessment_images table."""

    __tablename__ = "assessment_images"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("property_assessments.id", ondelete="CASCADE"), nullable=False)
    file_path: Mapped[str] = mapped_column(Text, nullable=False)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)
    image_type: Mapped[str] = mapped_column(String(50), nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    assessment = relationship("PropertyAssessmentModel", back_populates="images")


class AIAnalysisResultModel(Base):
    """Future AI/ML Vision model inference output storage."""

    __tablename__ = "ai_analysis_results"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("property_assessments.id", ondelete="CASCADE"), nullable=False)
    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    model_version: Mapped[str] = mapped_column(String(100), nullable=False)
    analysis_status: Mapped[str] = mapped_column(String(40), default="completed", nullable=False)
    detected_obstacles: Mapped[Any] = mapped_column(JSON().with_variant(JSONB, "postgresql"), default=list)
    detected_shading_regions: Mapped[Any] = mapped_column(JSON().with_variant(JSONB, "postgresql"), default=list)
    estimated_usable_area: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2), nullable=True)
    proposed_panel_layout: Mapped[Any] = mapped_column(JSON().with_variant(JSONB, "postgresql"), default=dict)
    confidence: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 4), nullable=True)
    missing_information: Mapped[Any] = mapped_column(JSON().with_variant(JSONB, "postgresql"), default=list)
    raw_result_json: Mapped[Any] = mapped_column(JSON().with_variant(JSONB, "postgresql"), default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    assessment = relationship("PropertyAssessmentModel", back_populates="ai_results")
