"""Property Assessment and Image Management Routes."""

import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, UploadFile, File, Form, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_optional, AuthenticatedUser
from app.schemas.assessment import (
    AssessmentCreate,
    AssessmentUpdate,
    AssessmentResponse,
    AssessmentImageResponse,
)
from app.schemas.recommendation import RecommendationResponse
from app.services.assessment_service import AssessmentService
from app.services.recommendation_service import RecommendationService

router = APIRouter(prefix="/assessments", tags=["Property Assessments"])


@router.post(
    "",
    response_model=AssessmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Property Assessment",
    description="Creates a rooftop assessment. Unknown rooftop dimensions are permitted; missing values are never invented.",
)
def create_assessment(
    payload: AssessmentCreate,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> AssessmentResponse:
    """Create assessment."""
    user_id = uuid.UUID(current_user.id) if current_user else None
    assessment = AssessmentService.create_assessment(db, payload, acting_user_id=user_id)
    return AssessmentResponse.model_validate(assessment)


@router.get(
    "",
    response_model=List[AssessmentResponse],
    summary="List Assessments",
    description="Returns assessments filtered by customer or lead.",
)
def list_assessments(
    customer_id: Optional[uuid.UUID] = Query(None),
    lead_id: Optional[uuid.UUID] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> List[AssessmentResponse]:
    """List assessments."""
    items, _ = AssessmentService.list_assessments(
        db=db,
        customer_id=customer_id,
        lead_id=lead_id,
        page=page,
        limit=limit,
    )
    return [AssessmentResponse.model_validate(a) for a in items]


@router.get(
    "/{assessment_id}",
    response_model=AssessmentResponse,
    summary="Get Assessment by ID",
    description="Fetches single assessment with uploaded images.",
)
def get_assessment(
    assessment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> AssessmentResponse:
    """Fetch assessment."""
    assessment = AssessmentService.get_assessment_by_id(db, assessment_id)
    return AssessmentResponse.model_validate(assessment)


@router.put(
    "/{assessment_id}",
    response_model=AssessmentResponse,
    summary="Update Assessment",
    description="Updates rooftop dimensions, location or electricity consumption values.",
)
def update_assessment(
    assessment_id: uuid.UUID,
    payload: AssessmentUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> AssessmentResponse:
    """Update assessment."""
    user_id = uuid.UUID(current_user.id) if current_user else None
    assessment = AssessmentService.update_assessment(
        db=db,
        assessment_id=assessment_id,
        payload=payload,
        acting_user_id=user_id,
    )
    return AssessmentResponse.model_validate(assessment)


# --- Image File Management (Storage Only) ---


@router.post(
    "/{assessment_id}/images",
    response_model=AssessmentImageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload Rooftop Image / Electricity Bill",
    description="Validates MIME type & file size, generates unique filename, uploads to storage, and stores DB metadata reference.",
)
async def upload_image(
    assessment_id: uuid.UUID,
    file: UploadFile = File(...),
    image_type: str = Form("rooftop_full_view"),
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> AssessmentImageResponse:
    """Upload image binary."""
    user_id = uuid.UUID(current_user.id) if current_user else None
    image = await AssessmentService.upload_assessment_image(
        db=db,
        assessment_id=assessment_id,
        file=file,
        image_type=image_type,
        acting_user_id=user_id,
    )
    return AssessmentImageResponse.model_validate(image)


@router.get(
    "/{assessment_id}/images",
    response_model=List[AssessmentImageResponse],
    summary="List Assessment Images",
    description="Returns authorized image records for an assessment.",
)
def list_images(
    assessment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> List[AssessmentImageResponse]:
    """List images."""
    images = AssessmentService.list_assessment_images(db, assessment_id)
    return [AssessmentImageResponse.model_validate(img) for img in images]


@router.delete(
    "/{assessment_id}/images/{image_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Assessment Image",
    description="Removes image file from storage and deletes metadata record.",
)
def delete_image(
    assessment_id: uuid.UUID,
    image_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
):
    """Delete image."""
    user_id = uuid.UUID(current_user.id) if current_user else None
    AssessmentService.delete_assessment_image(
        db=db,
        assessment_id=assessment_id,
        image_id=image_id,
        acting_user_id=user_id,
    )
    return None


@router.get(
    "/{assessment_id}/recommendations",
    response_model=List[RecommendationResponse],
    summary="Get Recommendations for Assessment",
    description="Returns engineering recommendations calculated for this assessment.",
)
def get_assessment_recommendations(
    assessment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> List[RecommendationResponse]:
    """List recommendations."""
    recs = RecommendationService.get_recommendations_by_assessment(db, assessment_id)
    return [RecommendationResponse.model_validate(r) for r in recs]
