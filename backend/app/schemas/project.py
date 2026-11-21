"""Pydantic schemas for projects."""

import uuid
from datetime import datetime, date
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class ProjectCreate(BaseModel):
    """Project creation payload."""

    customer_id: uuid.UUID
    lead_id: Optional[uuid.UUID] = None
    project_name: str = Field(..., max_length=200)
    proposed_capacity_kw: Optional[Decimal] = None
    approved_capacity_kw: Optional[Decimal] = None
    estimated_cost: Optional[Decimal] = None
    final_cost: Optional[Decimal] = None
    expected_completion_date: Optional[date] = None


class ProjectUpdate(BaseModel):
    """Project details update."""

    project_name: Optional[str] = None
    proposed_capacity_kw: Optional[Decimal] = None
    approved_capacity_kw: Optional[Decimal] = None
    estimated_cost: Optional[Decimal] = None
    final_cost: Optional[Decimal] = None
    expected_completion_date: Optional[date] = None
    actual_completion_date: Optional[date] = None


class ProjectStatusUpdate(BaseModel):
    """Project milestone status transition."""

    status: str = Field(..., description="Target project milestone status")
    notes: Optional[str] = None


class ProjectResponse(BaseModel):
    """Project response representation."""

    id: uuid.UUID
    project_number: str
    customer_id: uuid.UUID
    lead_id: Optional[uuid.UUID] = None
    project_name: str
    proposed_capacity_kw: Optional[Decimal] = None
    approved_capacity_kw: Optional[Decimal] = None
    project_status: str
    estimated_cost: Optional[Decimal] = None
    final_cost: Optional[Decimal] = None
    expected_completion_date: Optional[date] = None
    actual_completion_date: Optional[date] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
