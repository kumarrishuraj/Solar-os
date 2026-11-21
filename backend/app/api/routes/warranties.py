"""Warranty Management Routes."""

import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_optional, AuthenticatedUser
from app.schemas.warranty import WarrantyCreate, WarrantyResponse
from app.services.warranty_service import WarrantyService

router = APIRouter(prefix="/warranties", tags=["Warranties & Certificates"])


@router.post(
    "",
    response_model=WarrantyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Warranty Certificate",
    description="Creates warranty record. Duration is taken from approved product specifications.",
)
def create_warranty(
    payload: WarrantyCreate,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> WarrantyResponse:
    """Register warranty."""
    user_id = uuid.UUID(current_user.id) if current_user else None
    warranty = WarrantyService.create_warranty(db, payload, acting_user_id=user_id)
    return WarrantyResponse.model_validate(warranty)


@router.get(
    "",
    response_model=List[WarrantyResponse],
    summary="List Warranties",
    description="Returns active and historical warranty certificates.",
)
def list_warranties(
    customer_id: Optional[uuid.UUID] = Query(None),
    equipment_id: Optional[uuid.UUID] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> List[WarrantyResponse]:
    """List warranties."""
    items, _ = WarrantyService.list_warranties(
        db=db,
        customer_id=customer_id,
        equipment_id=equipment_id,
        page=page,
        limit=limit,
    )
    return [WarrantyResponse.model_validate(w) for w in items]


@router.get(
    "/{warranty_id}",
    response_model=WarrantyResponse,
    summary="Get Warranty by ID",
    description="Fetches warranty details.",
)
def get_warranty(
    warranty_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> WarrantyResponse:
    """Fetch warranty."""
    warranty = WarrantyService.get_warranty_by_id(db, warranty_id)
    return WarrantyResponse.model_validate(warranty)
