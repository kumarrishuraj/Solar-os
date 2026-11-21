"""Pydantic schemas for leads and customer enquiry intake."""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.customer import CustomerResponse


class LeadCreate(BaseModel):
    """Direct lead creation payload."""

    customer_id: uuid.UUID
    source: Optional[str] = "website"
    monthly_electricity_bill: Optional[Decimal] = None
    monthly_consumption_kwh: Optional[Decimal] = None
    estimated_system_capacity_kw: Optional[Decimal] = None
    status: Optional[str] = "new"
    assigned_salesperson_id: Optional[uuid.UUID] = None
    notes: Optional[str] = None


class LeadUpdate(BaseModel):
    """Lead edit payload."""

    source: Optional[str] = None
    monthly_electricity_bill: Optional[Decimal] = None
    monthly_consumption_kwh: Optional[Decimal] = None
    estimated_system_capacity_kw: Optional[Decimal] = None
    assigned_salesperson_id: Optional[uuid.UUID] = None
    notes: Optional[str] = None


class LeadStatusUpdate(BaseModel):
    """Lead status transition payload."""

    status: str
    notes: Optional[str] = None


class LeadEnquiryIntakeRequest(BaseModel):
    """Customer enquiry intake request.
    
    Validates customer info, creates or links customer, creates lead,
    and creates property assessment if details provided.
    """

    # Customer Information
    full_name: str = Field(..., max_length=150)
    phone: str = Field(..., max_length=20)
    email: Optional[str] = None
    property_address: str
    city: str = Field(..., max_length=100)
    state: str = Field(..., max_length=100)
    postal_code: str = Field(..., max_length=10)
    property_type: Optional[str] = "residential"

    # Lead specific details
    source: Optional[str] = "website"
    monthly_bill: Optional[Decimal] = None
    monthly_consumption_kwh: Optional[Decimal] = None
    estimated_capacity_kw: Optional[Decimal] = None
    notes: Optional[str] = None

    # Optional property assessment details (dimensions can be unknown)
    roof_length: Optional[Decimal] = None
    roof_width: Optional[Decimal] = None
    roof_area: Optional[Decimal] = None
    usable_roof_area: Optional[Decimal] = None
    measurement_unit: Optional[str] = "sq_meters"
    roof_type: Optional[str] = None
    roof_orientation: Optional[str] = None
    roof_tilt: Optional[Decimal] = None
    connection_phase: Optional[str] = None
    preferred_solar_type: Optional[str] = None
    budget: Optional[Decimal] = None


class LeadEnquiryIntakeResponse(BaseModel):
    """Enquiry intake result returning all relevant entity IDs."""

    customer_id: uuid.UUID
    lead_id: uuid.UUID
    lead_number: str
    assessment_id: Optional[uuid.UUID] = None
    status: str
    message: str


class LeadResponse(BaseModel):
    """Lead response representation."""

    id: uuid.UUID
    lead_number: str
    customer_id: uuid.UUID
    source: Optional[str] = None
    monthly_electricity_bill: Optional[Decimal] = None
    monthly_consumption_kwh: Optional[Decimal] = None
    estimated_system_capacity_kw: Optional[Decimal] = None
    status: str
    assigned_salesperson_id: Optional[uuid.UUID] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    customer: Optional[CustomerResponse] = None

    model_config = ConfigDict(from_attributes=True)


class LeadListResponse(BaseModel):
    """Paginated list of leads."""

    items: List[LeadResponse]
    total: int
    page: int
    limit: int
