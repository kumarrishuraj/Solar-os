"""Serialized Equipment Management Routes."""

import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_optional, AuthenticatedUser
from app.schemas.equipment import (
    EquipmentCreate,
    EquipmentDispatch,
    EquipmentResponse,
)
from app.schemas.warranty import WarrantyResponse
from app.services.equipment_service import EquipmentService
from app.services.warranty_service import WarrantyService

router = APIRouter(prefix="/equipment", tags=["Serialized Equipment"])


@router.post(
    "",
    response_model=EquipmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register Equipment Unit",
    description="Registers hardware unit by manufacturer serial number. Enforces unique serial numbers.",
)
def register_equipment(
    payload: EquipmentCreate,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> EquipmentResponse:
    """Register equipment."""
    user_id = uuid.UUID(current_user.id) if current_user else None
    unit = EquipmentService.register_equipment(db, payload, acting_user_id=user_id)
    return EquipmentResponse.model_validate(unit)


@router.get(
    "",
    response_model=List[EquipmentResponse],
    summary="List Serialized Equipment",
    description="Returns equipment units with product and dispatch status.",
)
def list_equipment(
    product_id: Optional[uuid.UUID] = Query(None),
    project_id: Optional[uuid.UUID] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> List[EquipmentResponse]:
    """List equipment."""
    items, _ = EquipmentService.list_equipment(
        db=db,
        product_id=product_id,
        project_id=project_id,
        equipment_status=status,
        page=page,
        limit=limit,
    )
    return [EquipmentResponse.model_validate(e) for e in items]


@router.get(
    "/{equipment_id}",
    response_model=EquipmentResponse,
    summary="Get Equipment by ID",
    description="Fetches equipment unit details.",
)
def get_equipment(
    equipment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> EquipmentResponse:
    """Fetch equipment."""
    unit = EquipmentService.get_equipment_by_id(db, equipment_id)
    return EquipmentResponse.model_validate(unit)


@router.get(
    "/serial/{serial_number}",
    response_model=EquipmentResponse,
    summary="Lookup Equipment by Serial Number",
    description="Barcode / QR code serial lookup.",
)
def get_equipment_by_serial(
    serial_number: str,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> EquipmentResponse:
    """Lookup by serial barcode."""
    unit = EquipmentService.get_equipment_by_serial(db, serial_number)
    return EquipmentResponse.model_validate(unit)


@router.post(
    "/dispatch",
    response_model=EquipmentResponse,
    summary="Dispatch Equipment Unit",
    description="Allocates and dispatches equipment to a specific project site and installation.",
)
def dispatch_equipment(
    equipment_id: uuid.UUID = Query(...),
    payload: EquipmentDispatch = ...,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> EquipmentResponse:
    """Dispatch equipment."""
    user_id = uuid.UUID(current_user.id) if current_user else None
    unit = EquipmentService.dispatch_equipment(
        db=db,
        equipment_id=equipment_id,
        payload=payload,
        acting_user_id=user_id,
    )
    return EquipmentResponse.model_validate(unit)


@router.get(
    "/{equipment_id}/warranty",
    response_model=WarrantyResponse,
    summary="Get Equipment Warranty",
    description="Returns warranty certificate mapped to this equipment unit.",
)
def get_equipment_warranty(
    equipment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> WarrantyResponse:
    """Get warranty certificate."""
    w = WarrantyService.get_equipment_warranty(db, equipment_id)
    return WarrantyResponse.model_validate(w)
