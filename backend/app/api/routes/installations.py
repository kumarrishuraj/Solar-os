"""Field Installation Management Routes."""

import uuid
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query, UploadFile, File, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_optional, AuthenticatedUser
from app.schemas.installation import (
    InstallationCreate,
    InstallationStatusUpdate,
    ChecklistBatchUpdateRequest,
    InstallationCompleteRequest,
    InstallationResponse,
)
from app.services.installation_service import InstallationService

router = APIRouter(prefix="/installations", tags=["Field Installations & Commissioning"])


@router.post(
    "",
    response_model=InstallationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Schedule Field Installation",
    description="Schedules installation crew and seeds standard 9-point SOP checklist tasks.",
)
def create_installation(
    payload: InstallationCreate,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> InstallationResponse:
    """Schedule installation."""
    user_id = uuid.UUID(current_user.id) if current_user else None
    inst = InstallationService.create_installation(db, payload, acting_user_id=user_id)
    return InstallationResponse.model_validate(inst)


@router.get(
    "",
    response_model=List[InstallationResponse],
    summary="List Installations",
    description="Returns field installations with checklist completion status.",
)
def list_installations(
    project_id: Optional[uuid.UUID] = Query(None),
    technician_id: Optional[uuid.UUID] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> List[InstallationResponse]:
    """List installations."""
    items, _ = InstallationService.list_installations(
        db=db,
        project_id=project_id,
        technician_id=technician_id,
        installation_status=status,
        page=page,
        limit=limit,
    )
    return [InstallationResponse.model_validate(i) for i in items]


@router.get(
    "/{installation_id}",
    response_model=InstallationResponse,
    summary="Get Installation by ID",
    description="Fetches installation details, testing results, and SOP checklist.",
)
def get_installation(
    installation_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> InstallationResponse:
    """Fetch installation."""
    inst = InstallationService.get_installation_by_id(db, installation_id)
    return InstallationResponse.model_validate(inst)


@router.patch(
    "/{installation_id}/status",
    response_model=InstallationResponse,
    summary="Update Installation Status",
    description="Updates execution status and testing readings.",
)
def update_installation_status(
    installation_id: uuid.UUID,
    payload: InstallationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> InstallationResponse:
    """Update status."""
    user_id = uuid.UUID(current_user.id) if current_user else None
    inst = InstallationService.update_installation_status(
        db=db,
        installation_id=installation_id,
        payload=payload,
        acting_user_id=user_id,
    )
    return InstallationResponse.model_validate(inst)


@router.post(
    "/{installation_id}/checklist",
    response_model=InstallationResponse,
    summary="Update SOP Checklist Tasks",
    description="Records technician completion of checklist items and recalculates progress percentage.",
)
def update_checklist(
    installation_id: uuid.UUID,
    payload: ChecklistBatchUpdateRequest,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> InstallationResponse:
    """Update checklist."""
    user_id = uuid.UUID(current_user.id) if current_user else None
    inst = InstallationService.update_checklist(
        db=db,
        installation_id=installation_id,
        payload=payload,
        acting_user_id=user_id,
    )
    return InstallationResponse.model_validate(inst)


@router.post(
    "/{installation_id}/photos",
    summary="Upload Installation Photo",
    description="Uploads completion, earthing, or panel layout photo to storage.",
)
async def upload_installation_photo(
    installation_id: uuid.UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> Dict[str, Any]:
    """Upload installation photo."""
    user_id = uuid.UUID(current_user.id) if current_user else None
    return await InstallationService.upload_installation_photo(
        db=db,
        installation_id=installation_id,
        file=file,
        acting_user_id=user_id,
    )


@router.post(
    "/{installation_id}/complete",
    response_model=InstallationResponse,
    summary="Complete & Commission Installation",
    description="STRICT REQUIREMENT: Validates all required SOP checklist tasks before commissioning. Automatically activates warranties.",
)
def complete_installation(
    installation_id: uuid.UUID,
    payload: InstallationCompleteRequest,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> InstallationResponse:
    """Commission installation."""
    user_id = uuid.UUID(current_user.id) if current_user else None
    inst = InstallationService.complete_installation(
        db=db,
        installation_id=installation_id,
        payload=payload,
        acting_user_id=user_id,
    )
    return InstallationResponse.model_validate(inst)
