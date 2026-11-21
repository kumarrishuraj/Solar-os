"""Pydantic schemas for property assessments and images."""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class AssessmentCreate(BaseModel):
    """Property assessment creation payload.
    
    Allows unknown rooftop dimensions; never invents missing values.
    """

    customer_id: uuid.UUID
    lead_id: Optional[uuid.UUID] = None
    project_id: Optional[uuid.UUID] = None

    property_address: str
    city: str = Field(..., max_length=100)
    state: str = Field(..., max_length=100)
    postal_code: str = Field(..., max_length=10)
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None

    roof_length: Optional[Decimal] = None
    roof_width: Optional[Decimal] = None
    roof_area: Optional[Decimal] = None
    usable_roof_area: Optional[Decimal] = None
    measurement_unit: Optional[str] = "sq_meters"
    roof_type: Optional[str] = None
    roof_orientation: Optional[str] = None
    roof_tilt: Optional[Decimal] = None
    number_of_roof_sections: Optional[int] = 1

    grid_availability: Optional[bool] = True
    monthly_bill: Optional[Decimal] = None
    monthly_consumption_kwh: Optional[Decimal] = None
    connection_phase: Optional[str] = None
    preferred_solar_type: Optional[str] = None
    budget: Optional[Decimal] = None
    assessment_status: Optional[str] = "draft"


class AssessmentUpdate(BaseModel):
    """Property assessment update payload."""

    property_address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[Optional[str]] = None
    postal_code: Optional[str] = None
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None

    roof_length: Optional[Decimal] = None
    roof_width: Optional[Decimal] = None
    roof_area: Optional[Decimal] = None
    usable_roof_area: Optional[Decimal] = None
    measurement_unit: Optional[str] = None
    roof_type: Optional[str] = None
    roof_orientation: Optional[str] = None
    roof_tilt: Optional[Decimal] = None
    number_of_roof_sections: Optional[int] = None

    grid_availability: Optional[bool] = None
    monthly_bill: Optional[Decimal] = None
    monthly_consumption_kwh: Optional[Decimal] = None
    connection_phase: Optional[str] = None
    preferred_solar_type: Optional[str] = None
    budget: Optional[Decimal] = None
    assessment_status: Optional[str] = None


class AssessmentImageResponse(BaseModel):
    """Assessment image metadata response."""

    id: uuid.UUID
    assessment_id: uuid.UUID
    file_path: str
    file_name: str
    mime_type: str
    file_size_bytes: int
    image_type: str
    uploaded_at: datetime
    url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class AssessmentResponse(BaseModel):
    """Property assessment response representation."""

    id: uuid.UUID
    customer_id: uuid.UUID
    lead_id: Optional[uuid.UUID] = None
    project_id: Optional[uuid.UUID] = None
    property_address: str
    city: str
    state: str
    postal_code: str
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    roof_length: Optional[Decimal] = None
    roof_width: Optional[Decimal] = None
    roof_area: Optional[Decimal] = None
    usable_roof_area: Optional[Decimal] = None
    measurement_unit: Optional[str] = None
    roof_type: Optional[str] = None
    roof_orientation: Optional[str] = None
    roof_tilt: Optional[Decimal] = None
    number_of_roof_sections: Optional[int] = 1
    grid_availability: Optional[bool] = True
    monthly_bill: Optional[Decimal] = None
    monthly_consumption_kwh: Optional[Decimal] = None
    connection_phase: Optional[str] = None
    preferred_solar_type: Optional[str] = None
    budget: Optional[Decimal] = None
    assessment_status: str
    created_at: datetime
    updated_at: datetime
    images: List[AssessmentImageResponse] = []

    model_config = ConfigDict(from_attributes=True)
