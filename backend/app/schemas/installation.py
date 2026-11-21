"""Pydantic schemas for field installations and checklist."""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, AliasChoices


class ChecklistItemUpdate(BaseModel):
    """Checklist item update."""

    task_name: str
    is_completed: bool
    remarks: Optional[str] = None


class ChecklistBatchUpdateRequest(BaseModel):
    """Batch checklist completion update."""

    items: List[ChecklistItemUpdate]


class InstallationCreate(BaseModel):
    """Installation scheduling creation."""

    project_id: uuid.UUID
    assigned_technician_id: Optional[uuid.UUID] = None
    scheduled_date: datetime
    system_capacity_kw: Decimal = Field(..., ge=0)


class InstallationStatusUpdate(BaseModel):
    """Installation progress and status update."""

    installation_status: str
    progress_percentage: Optional[Decimal] = None
    start_time: Optional[datetime] = None
    completion_time: Optional[datetime] = None
    testing_results: Optional[Dict[str, Any]] = None
    customer_confirmation: Optional[bool] = None


class InstallationCompleteRequest(BaseModel):
    """Commissioning handover request verifying checklist items."""

    testing_results: Optional[Dict[str, Any]] = None
    customer_confirmation: bool = True
    completion_time: Optional[datetime] = None


class ChecklistItemResponse(BaseModel):
    """Checklist item representation."""

    id: uuid.UUID
    installation_id: uuid.UUID
    task_name: str
    is_completed: bool
    completed_by: Optional[uuid.UUID] = None
    completed_at: Optional[datetime] = None
    remarks: Optional[str] = None

    class Config:
        from_attributes = True


class InstallationResponse(BaseModel):
    """Field installation response representation."""

    id: uuid.UUID
    installation_number: str
    project_id: uuid.UUID
    assigned_technician_id: Optional[uuid.UUID] = None
    scheduled_date: datetime
    start_time: Optional[datetime] = None
    completion_time: Optional[datetime] = None
    installation_status: str
    progress_percentage: Decimal
    system_capacity_kw: Decimal
    testing_results: Dict[str, Any] = {}
    customer_confirmation: bool
    created_at: datetime
    updated_at: datetime
    checklist: List[ChecklistItemResponse] = Field(default_factory=list, validation_alias=AliasChoices("checklist", "checklist_items"))

    class Config:
        from_attributes = True
