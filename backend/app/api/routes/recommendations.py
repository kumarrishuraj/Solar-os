"""Solar Recommendation Data Management Routes."""

import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_optional, AuthenticatedUser
from app.schemas.recommendation import (
    RecommendationCreate,
    RecommendationUpdate,
    RecommendationResponse,
)
from app.services.recommendation_service import RecommendationService

router = APIRouter(prefix="/recommendations", tags=["Solar Recommendations"])


@router.post(
    "",
    response_model=RecommendationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Store Solar Recommendation",
    description="Stores engineering sizing configurations (without running ML inference).",
)
def create_recommendation(
    payload: RecommendationCreate,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> RecommendationResponse:
    """Store recommendation."""
    user_id = uuid.UUID(current_user.id) if current_user else None
    rec = RecommendationService.create_recommendation(db, payload, acting_user_id=user_id)
    return RecommendationResponse.model_validate(rec)


@router.get(
    "/{recommendation_id}",
    response_model=RecommendationResponse,
    summary="Get Recommendation by ID",
    description="Fetches engineering sizing parameters and bill of materials.",
)
def get_recommendation(
    recommendation_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> RecommendationResponse:
    """Fetch recommendation."""
    rec = RecommendationService.get_recommendation_by_id(db, recommendation_id)
    return RecommendationResponse.model_validate(rec)


@router.patch(
    "/{recommendation_id}",
    response_model=RecommendationResponse,
    summary="Update Recommendation",
    description="Updates sizing configuration or acceptance/rejection status.",
)
def update_recommendation(
    recommendation_id: uuid.UUID,
    payload: RecommendationUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> RecommendationResponse:
    """Update recommendation."""
    user_id = uuid.UUID(current_user.id) if current_user else None
    rec = RecommendationService.update_recommendation(
        db=db,
        recommendation_id=recommendation_id,
        payload=payload,
        acting_user_id=user_id,
    )
    return RecommendationResponse.model_validate(rec)
