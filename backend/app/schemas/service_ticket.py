"""Pydantic schemas for post-commissioning service tickets."""

import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class ServiceTicketCreate(BaseModel):
    """Service ticket intake payload."""

    customer_id: uuid.UUID
    project_id: Optional[uuid.UUID] = None
    equipment_id: Optional[uuid.UUID] = None
    issue_description: str = Field(..., min_length=5)
    issue_category: str = Field(..., description="inverter_fault, panel_damage, generation_drop, wiring_issue, etc.")
    priority: Optional[str] = "medium"


class ServiceTicketAssign(BaseModel):
    """Ticket technician assignment."""

    assigned_technician_id: uuid.UUID


class ServiceTicketStatusUpdate(BaseModel):
    """Ticket status update."""

    ticket_status: str
    resolution_notes: Optional[str] = None


class ServiceTicketResolve(BaseModel):
    """Ticket resolution payload."""

    resolution_notes: str = Field(..., min_length=5)


class ServiceTicketResponse(BaseModel):
    """Service ticket response representation."""

    id: uuid.UUID
    ticket_number: str
    customer_id: uuid.UUID
    project_id: Optional[uuid.UUID] = None
    equipment_id: Optional[uuid.UUID] = None
    issue_description: str
    issue_category: str
    priority: str
    assigned_technician_id: Optional[uuid.UUID] = None
    ticket_status: str
    resolution_notes: Optional[str] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
