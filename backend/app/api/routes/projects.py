"""Project Management Routes."""

import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_optional, AuthenticatedUser
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectStatusUpdate,
    ProjectResponse,
)
from app.schemas.payment import ProjectPaymentSummary
from app.services.project_service import ProjectService
from app.services.payment_service import PaymentService

router = APIRouter(prefix="/projects", tags=["Project Management"])


@router.post(
    "",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Solar Project",
    description="Initializes project entity with unique code (PRJ-YYYY-NNNN).",
)
def create_project(
    payload: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> ProjectResponse:
    """Create project."""
    user_id = uuid.UUID(current_user.id) if current_user else None
    project = ProjectService.create_project(db, payload, acting_user_id=user_id)
    return ProjectResponse.model_validate(project)


@router.get(
    "",
    response_model=List[ProjectResponse],
    summary="List Projects",
    description="Returns solar installation contracts filtered by customer or status.",
)
def list_projects(
    customer_id: Optional[uuid.UUID] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> List[ProjectResponse]:
    """List projects."""
    items, _ = ProjectService.list_projects(
        db=db,
        customer_id=customer_id,
        status_filter=status,
        page=page,
        limit=limit,
    )
    return [ProjectResponse.model_validate(p) for p in items]


@router.get(
    "/{project_id}",
    response_model=ProjectResponse,
    summary="Get Project by ID",
    description="Fetches project lifecycle details.",
)
def get_project(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> ProjectResponse:
    """Fetch project."""
    project = ProjectService.get_project_by_id(db, project_id)
    return ProjectResponse.model_validate(project)


@router.put(
    "/{project_id}",
    response_model=ProjectResponse,
    summary="Update Project Details",
    description="Updates project capacities, costs, or completion dates.",
)
def update_project(
    project_id: uuid.UUID,
    payload: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> ProjectResponse:
    """Update project."""
    user_id = uuid.UUID(current_user.id) if current_user else None
    project = ProjectService.update_project(
        db=db,
        project_id=project_id,
        payload=payload,
        acting_user_id=user_id,
    )
    return ProjectResponse.model_validate(project)


@router.patch(
    "/{project_id}/status",
    response_model=ProjectResponse,
    summary="Transition Project Status",
    description="Validates and progresses project milestone status across the 13 defined lifecycle stages.",
)
def update_project_status(
    project_id: uuid.UUID,
    payload: ProjectStatusUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> ProjectResponse:
    """Update status milestone."""
    user_id = uuid.UUID(current_user.id) if current_user else None
    project = ProjectService.update_project_status(
        db=db,
        project_id=project_id,
        target_status=payload.status,
        notes=payload.notes,
        acting_user_id=user_id,
    )
    return ProjectResponse.model_validate(project)


@router.get(
    "/{project_id}/payments",
    response_model=ProjectPaymentSummary,
    summary="Get Project Payment Balance",
    description="Returns financial statement: total quoted, total received, and outstanding balance.",
)
def get_project_payments(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> ProjectPaymentSummary:
    """Get project financial breakdown."""
    return PaymentService.get_project_payments_summary(db, project_id)
