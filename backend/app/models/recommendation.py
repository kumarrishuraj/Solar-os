"""SQLAlchemy model for solar_recommendations table.

Calculated solar sizing, estimated generation, financial payback and proposed BOM.
"""

import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional, Any
from sqlalchemy import String, Numeric, DateTime, ForeignKey, JSON, Uuid
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class SolarRecommendationModel(Base):
    """Solar sizing recommendation entity mapped to PostgreSQL solar_recommendations table."""

    __tablename__ = "solar_recommendations"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("property_assessments.id", ondelete="CASCADE"), nullable=False)
    project_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid(as_uuid=True), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    system_capacity_kw: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    estimated_generation_kwh: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    estimated_monthly_savings: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    estimated_payback_years: Mapped[Decimal] = mapped_column(Numeric(8, 2), nullable=False)
    recommendation_source: Mapped[str] = mapped_column(String(30), default="engineering", nullable=False)
    assumptions: Mapped[Any] = mapped_column(JSON().with_variant(JSONB, "postgresql"), default=dict)
    warnings: Mapped[Any] = mapped_column(JSON().with_variant(JSONB, "postgresql"), default=list)
    configuration: Mapped[Any] = mapped_column(JSON().with_variant(JSONB, "postgresql"), default=dict)
    bom: Mapped[Any] = mapped_column(JSON().with_variant(JSONB, "postgresql"), default=list)
    approval_status: Mapped[str] = mapped_column(String(30), default="draft", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    assessment = relationship("PropertyAssessmentModel", back_populates="recommendations")
    project = relationship("ProjectModel", back_populates="recommendations")
