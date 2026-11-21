"""Site Survey Management Routes."""

import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_optional, require_roles, AuthenticatedUser
from app.schemas.survey import (
    SurveyCreate,
    SurveyUpdate,
    SurveyRejectRequest,
    SurveyResponse,
)
from app.services.survey_service import SurveyService

router = APIRouter(prefix="/surveys", tags=["Site Surveys"])


@router.post(
    "",
    response_model=SurveyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Schedule Site Survey",
    description="Assigns field surveyor and schedules on-site technical inspection.",
)
def create_survey(
    payload: SurveyCreate,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> SurveyResponse:
    """Schedule survey."""
    user_id = uuid.UUID(current_user.id) if current_user else None
    survey = SurveyService.create_survey(db, payload, acting_user_id=user_id)
    return SurveyResponse.model_validate(survey)


@router.get(
    "",
    response_model=List[SurveyResponse],
    summary="List Site Surveys",
    description="Returns site audits filtered by project, surveyor, or approval status.",
)
def list_surveys(
    project_id: Optional[uuid.UUID] = Query(None),
    surveyor_id: Optional[uuid.UUID] = Query(None),
    approval_status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> List[SurveyResponse]:
    """List surveys."""
    items, _ = SurveyService.list_surveys(
        db=db,
        project_id=project_id,
        surveyor_id=surveyor_id,
        approval_status=approval_status,
        page=page,
        limit=limit,
    )
    return [SurveyResponse.model_validate(s) for s in items]


@router.get(
    "/{survey_id}",
    response_model=SurveyResponse,
    summary="Get Survey by ID",
    description="Fetches verified dimensions, tilt, orientation, and safety findings.",
)
def get_survey(
    survey_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> SurveyResponse:
    """Fetch survey."""
    survey = SurveyService.get_survey_by_id(db, survey_id)
    return SurveyResponse.model_validate(survey)


@router.put(
    "/{survey_id}",
    response_model=SurveyResponse,
    summary="Update Survey Measurements",
    description="Updates laser-verified roof dimensions, DC cable length, and structural observations.",
)
def update_survey(
    survey_id: uuid.UUID,
    payload: SurveyUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> SurveyResponse:
    """Update survey observations."""
    user_id = uuid.UUID(current_user.id) if current_user else None
    survey = SurveyService.update_survey(
        db=db,
        survey_id=survey_id,
        payload=payload,
        acting_user_id=user_id,
    )
    return SurveyResponse.model_validate(survey)


@router.patch(
    "/{survey_id}/submit",
    response_model=SurveyResponse,
    summary="Submit Survey for Review",
    description="Surveyor marks physical audit as completed and ready for engineering signoff.",
)
def submit_survey(
    survey_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> SurveyResponse:
    """Submit survey."""
    user_id = uuid.UUID(current_user.id) if current_user else None
    survey = SurveyService.submit_survey(db, survey_id, acting_user_id=user_id)
    return SurveyResponse.model_validate(survey)


@router.patch(
    "/{survey_id}/approve",
    response_model=SurveyResponse,
    summary="Approve Site Survey",
    description="Reviewing engineer formally approves site survey and advances project to survey_approved.",
)
def approve_survey(
    survey_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> SurveyResponse:
    """Approve survey."""
    approver_id = uuid.UUID(current_user.id) if current_user else uuid.uuid4()
    survey = SurveyService.approve_survey(db, survey_id, approved_by_id=approver_id)
    return SurveyResponse.model_validate(survey)


@router.patch(
    "/{survey_id}/reject",
    response_model=SurveyResponse,
    summary="Reject Site Survey",
    description="Rejects survey findings. STRICT REQUIREMENT: Rejection reason is mandatory.",
)
def reject_survey(
    survey_id: uuid.UUID,
    payload: SurveyRejectRequest,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> SurveyResponse:
    """Reject survey with mandatory reason."""
    user_id = uuid.UUID(current_user.id) if current_user else None
    survey = SurveyService.reject_survey(
        db=db,
        survey_id=survey_id,
        rejection_reason=payload.rejection_reason,
        acting_user_id=user_id,
    )
    return SurveyResponse.model_validate(survey)
