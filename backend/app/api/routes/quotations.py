"""Commercial Quotation Management Routes."""

import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_optional, require_roles, AuthenticatedUser
from app.schemas.quotation import (
    QuotationCreate,
    QuotationRejectRequest,
    QuotationResponse,
)
from app.services.quotation_service import QuotationService

router = APIRouter(prefix="/quotations", tags=["Quotations & Commercial Proposals"])


@router.post(
    "",
    response_model=QuotationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Commercial Quotation",
    description="Generates quotation proposal with Decimal financial precision (subtotal, GST, EPC charges). Enforces site survey readiness.",
)
def create_quotation(
    payload: QuotationCreate,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> QuotationResponse:
    """Create quotation."""
    user_id = uuid.UUID(current_user.id) if current_user else None
    quotation = QuotationService.create_quotation(db, payload, acting_user_id=user_id)
    return QuotationResponse.model_validate(quotation)


@router.get(
    "",
    response_model=List[QuotationResponse],
    summary="List Quotations",
    description="Returns commercial quotations filtered by project, customer, or status.",
)
def list_quotations(
    project_id: Optional[uuid.UUID] = Query(None),
    customer_id: Optional[uuid.UUID] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> List[QuotationResponse]:
    """List quotations."""
    items, _ = QuotationService.list_quotations(
        db=db,
        project_id=project_id,
        customer_id=customer_id,
        status_filter=status,
        page=page,
        limit=limit,
    )
    return [QuotationResponse.model_validate(q) for q in items]


@router.get(
    "/{quotation_id}",
    response_model=QuotationResponse,
    summary="Get Quotation by ID",
    description="Fetches full quotation details including itemized BOM pricing.",
)
def get_quotation(
    quotation_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> QuotationResponse:
    """Fetch quotation."""
    quotation = QuotationService.get_quotation_by_id(db, quotation_id)
    return QuotationResponse.model_validate(quotation)


@router.patch(
    "/{quotation_id}/approve",
    response_model=QuotationResponse,
    summary="Approve Commercial Quotation",
    description="Formally accepts quotation proposal and progresses linked project.",
)
def approve_quotation(
    quotation_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> QuotationResponse:
    """Approve quotation."""
    user_id = uuid.UUID(current_user.id) if current_user else None
    quotation = QuotationService.approve_quotation(db, quotation_id, acting_user_id=user_id)
    return QuotationResponse.model_validate(quotation)


@router.patch(
    "/{quotation_id}/reject",
    response_model=QuotationResponse,
    summary="Reject Commercial Quotation",
    description="Marks quotation as rejected.",
)
def reject_quotation(
    quotation_id: uuid.UUID,
    payload: QuotationRejectRequest,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> QuotationResponse:
    """Reject quotation."""
    user_id = uuid.UUID(current_user.id) if current_user else None
    quotation = QuotationService.reject_quotation(
        db=db,
        quotation_id=quotation_id,
        rejection_reason=payload.rejection_reason,
        acting_user_id=user_id,
    )
    return QuotationResponse.model_validate(quotation)


@router.post(
    "/{quotation_id}/pdf",
    summary="Generate Quotation PDF Document",
    description="Generates and streams a professional PDF commercial quotation proposal.",
)
def download_quotation_pdf(
    quotation_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> Response:
    """Generate and return quotation PDF document."""
    pdf_bytes = QuotationService.generate_pdf(db, quotation_id)
    quotation = QuotationService.get_quotation_by_id(db, quotation_id)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=SolarOS_Quotation_{quotation.quotation_number}.pdf",
        },
    )
