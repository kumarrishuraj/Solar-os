"""Customer and Lead Management Routes."""

import uuid
from typing import Optional, List, Union
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_optional, require_roles, AuthenticatedUser
from app.schemas.lead import (
    LeadEnquiryIntakeRequest,
    LeadEnquiryIntakeResponse,
    LeadResponse,
    LeadUpdate,
    LeadStatusUpdate,
)
from app.services.customer_lead_service import CustomerLeadService

router = APIRouter(prefix="/leads", tags=["Leads & Intake CRM"])


@router.post(
    "",
    response_model=LeadEnquiryIntakeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit Customer Enquiry / Create Lead",
    description=(
        "Core enquiry intake: Validates customer information, creates or identifies customer, "
        "creates lead with unique code, and creates property assessment if details are provided."
    ),
)
def create_lead_enquiry(
    payload: LeadEnquiryIntakeRequest,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> LeadEnquiryIntakeResponse:
    """Ingest enquiry and generate customer, lead, and assessment entities."""
    user_id = uuid.UUID(current_user.id) if current_user else None
    customer, lead, assessment = CustomerLeadService.process_enquiry_intake(
        db=db,
        request=payload,
        acting_user_id=user_id,
    )
    return LeadEnquiryIntakeResponse(
        customer_id=customer.id,
        lead_id=lead.id,
        lead_number=lead.lead_number,
        assessment_id=assessment.id if assessment else None,
        status=lead.status,
        message="Enquiry processed successfully",
    )


@router.get(
    "",
    response_model=List[LeadResponse],
    summary="List and Filter Leads",
    description="Returns CRM leads. Supports search, status, city, lead source, and salesperson filters.",
)
def list_leads(
    search: Optional[str] = Query(None, description="Search across customer name, phone, email, lead code"),
    status: Optional[str] = Query(None, description="Filter by lead status"),
    city: Optional[str] = Query(None, description="Filter by city"),
    source: Optional[str] = Query(None, description="Filter by lead source"),
    salesperson_id: Optional[uuid.UUID] = Query(None, description="Filter by assigned salesperson"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> List[LeadResponse]:
    """Retrieve leads with search and filtering."""
    items, _ = CustomerLeadService.list_leads(
        db=db,
        search=search,
        status_filter=status,
        city_filter=city,
        source_filter=source,
        salesperson_id=salesperson_id,
        page=page,
        limit=limit,
    )
    return [LeadResponse.model_validate(item) for item in items]


@router.get(
    "/{lead_id}",
    response_model=LeadResponse,
    summary="Get Lead by ID",
    description="Fetches full details of a specific lead.",
)
def get_lead(
    lead_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> LeadResponse:
    """Fetch lead by UUID."""
    lead = CustomerLeadService.get_lead_by_id(db, lead_id)
    return LeadResponse.model_validate(lead)


@router.put(
    "/{lead_id}",
    response_model=LeadResponse,
    summary="Update Lead",
    description="Updates lead details.",
)
def update_lead(
    lead_id: uuid.UUID,
    payload: LeadUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> LeadResponse:
    """Edit lead."""
    user_id = uuid.UUID(current_user.id) if current_user else None
    lead = CustomerLeadService.update_lead(
        db=db,
        lead_id=lead_id,
        payload=payload,
        acting_user_id=user_id,
    )
    return LeadResponse.model_validate(lead)


@router.patch(
    "/{lead_id}/status",
    response_model=LeadResponse,
    summary="Update Lead Status",
    description="Transitions the sales funnel status of a lead.",
)
def update_lead_status(
    lead_id: uuid.UUID,
    payload: LeadStatusUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> LeadResponse:
    """Update lead status."""
    user_id = uuid.UUID(current_user.id) if current_user else None
    lead = CustomerLeadService.update_lead_status(
        db=db,
        lead_id=lead_id,
        new_status=payload.status,
        notes=payload.notes,
        acting_user_id=user_id,
    )
    return LeadResponse.model_validate(lead)
