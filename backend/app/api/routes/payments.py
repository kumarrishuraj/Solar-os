"""Payment Management Routes."""

import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_optional, AuthenticatedUser
from app.schemas.payment import PaymentCreate, PaymentResponse
from app.services.payment_service import PaymentService

router = APIRouter(prefix="/payments", tags=["Payments & Accounting"])


@router.post(
    "",
    response_model=PaymentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record Milestone Payment",
    description="Records customer advance or installment payment with transaction reference (UTR/UPI).",
)
def record_payment(
    payload: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> PaymentResponse:
    """Record payment."""
    user_id = uuid.UUID(current_user.id) if current_user else None
    payment = PaymentService.record_payment(db, payload, acting_user_id=user_id)
    return PaymentResponse.model_validate(payment)


@router.get(
    "",
    response_model=List[PaymentResponse],
    summary="List Payments",
    description="Returns transaction records with pagination.",
)
def list_payments(
    project_id: Optional[uuid.UUID] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> List[PaymentResponse]:
    """List payments."""
    items, _ = PaymentService.list_payments(db, project_id=project_id, page=page, limit=limit)
    return [PaymentResponse.model_validate(p) for p in items]


@router.get(
    "/{payment_id}",
    response_model=PaymentResponse,
    summary="Get Payment by ID",
    description="Fetches single payment transaction record.",
)
def get_payment(
    payment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> PaymentResponse:
    """Fetch payment."""
    payment = PaymentService.get_payment_by_id(db, payment_id)
    return PaymentResponse.model_validate(payment)
