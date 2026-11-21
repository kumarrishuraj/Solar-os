"""Pydantic schemas for site surveys."""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class SurveyCreate(BaseModel):
    """Site survey creation payload."""

    project_id: uuid.UUID
    assessment_id: Optional[uuid.UUID] = None
    surveyor_id: uuid.UUID
    scheduled_date: datetime
    remarks: Optional[str] = None


class SurveyUpdate(BaseModel):
    """Survey field observations update."""

    actual_survey_date: Optional[datetime] = None
    verified_roof_area: Optional[Decimal] = None
    verified_roof_orientation: Optional[str] = None
    verified_roof_tilt: Optional[Decimal] = None
    structural_observations: Optional[str] = None
    shading_observations: Optional[str] = None
    cable_distance: Optional[Decimal] = None
    electrical_observations: Optional[str] = None
    safety_observations: Optional[str] = None
    remarks: Optional[str] = None


class SurveyRejectRequest(BaseModel):
    """Survey rejection action requiring a mandatory reason."""

    rejection_reason: str = Field(..., min_length=5, description="Mandatory detailed rejection reason")


class SurveyResponse(BaseModel):
    """Site survey response representation."""

    id: uuid.UUID
    project_id: uuid.UUID
    assessment_id: Optional[uuid.UUID] = None
    surveyor_id: uuid.UUID
    scheduled_date: datetime
    actual_survey_date: Optional[datetime] = None
    verified_roof_area: Optional[Decimal] = None
    verified_roof_orientation: Optional[str] = None
    verified_roof_tilt: Optional[Decimal] = None
    structural_observations: Optional[str] = None
    shading_observations: Optional[str] = None
    cable_distance: Optional[Decimal] = None
    electrical_observations: Optional[str] = None
    safety_observations: Optional[str] = None
    approval_status: str
    rejection_reason: Optional[str] = None
    approved_by: Optional[uuid.UUID] = None
    approved_at: Optional[datetime] = None
    remarks: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
