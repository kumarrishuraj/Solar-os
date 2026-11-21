"""Pydantic schemas for solar recommendations."""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class RecommendationCreate(BaseModel):
    """Engineering configuration storage payload."""

    assessment_id: uuid.UUID
    project_id: Optional[uuid.UUID] = None
    system_capacity_kw: Decimal = Field(..., ge=0)
    estimated_generation_kwh: Decimal = Field(..., ge=0)
    estimated_monthly_savings: Decimal = Field(..., ge=0)
    estimated_payback_years: Decimal = Field(..., ge=0)
    recommendation_source: Optional[str] = "engineering"
    assumptions: Optional[Dict[str, Any]] = None
    warnings: Optional[List[Any]] = None
    configuration: Optional[Dict[str, Any]] = None
    bom: Optional[List[Any]] = None
    approval_status: Optional[str] = "draft"


class RecommendationUpdate(BaseModel):
    """Recommendation update payload."""

    system_capacity_kw: Optional[Decimal] = None
    estimated_generation_kwh: Optional[Decimal] = None
    estimated_monthly_savings: Optional[Decimal] = None
    estimated_payback_years: Optional[Decimal] = None
    assumptions: Optional[Dict[str, Any]] = None
    warnings: Optional[List[Any]] = None
    configuration: Optional[Dict[str, Any]] = None
    bom: Optional[List[Any]] = None
    approval_status: Optional[str] = None


class RecommendationResponse(BaseModel):
    """Solar recommendation response representation."""

    id: uuid.UUID
    assessment_id: uuid.UUID
    project_id: Optional[uuid.UUID] = None
    system_capacity_kw: Decimal
    estimated_generation_kwh: Decimal
    estimated_monthly_savings: Decimal
    estimated_payback_years: Decimal
    recommendation_source: str
    assumptions: Dict[str, Any] = {}
    warnings: List[Any] = []
    configuration: Dict[str, Any] = {}
    bom: List[Any] = []
    approval_status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
