"""Solar Recommendation Data Management Service.

Stores and retrieves solar engineering configurations supplied by engineers
or future AI models (without performing AI inference).
"""

import uuid
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.recommendation import SolarRecommendationModel
from app.models.assessment import PropertyAssessmentModel
from app.schemas.recommendation import RecommendationCreate, RecommendationUpdate
from app.core.audit import record_audit_log


class RecommendationService:
    """Business operations for solar sizing and engineering configurations."""

    @staticmethod
    def create_recommendation(
        db: Session,
        payload: RecommendationCreate,
        acting_user_id: Optional[uuid.UUID] = None,
    ) -> SolarRecommendationModel:
        """Store an engineering configuration."""
        # Verify assessment exists
        assessment = db.query(PropertyAssessmentModel).filter(PropertyAssessmentModel.id == payload.assessment_id).first()
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Property assessment '{payload.assessment_id}' not found",
            )

        recommendation = SolarRecommendationModel(
            id=uuid.uuid4(),
            **payload.model_dump(),
        )
        db.add(recommendation)
        db.commit()
        db.refresh(recommendation)

        record_audit_log(
            db=db,
            action="recommendation_created",
            entity_type="solar_recommendations",
            entity_id=recommendation.id,
            user_id=acting_user_id,
            metadata={"capacity_kw": str(payload.system_capacity_kw)},
        )

        return recommendation

    @staticmethod
    def get_recommendation_by_id(db: Session, recommendation_id: uuid.UUID) -> SolarRecommendationModel:
        """Fetch recommendation by ID."""
        rec = db.query(SolarRecommendationModel).filter(SolarRecommendationModel.id == recommendation_id).first()
        if not rec:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Solar recommendation '{recommendation_id}' not found",
            )
        return rec

    @staticmethod
    def get_recommendations_by_assessment(db: Session, assessment_id: uuid.UUID) -> List[SolarRecommendationModel]:
        """Fetch all recommendations for a given property assessment."""
        return (
            db.query(SolarRecommendationModel)
            .filter(SolarRecommendationModel.assessment_id == assessment_id)
            .order_by(SolarRecommendationModel.created_at.desc())
            .all()
        )

    @staticmethod
    def update_recommendation(
        db: Session,
        recommendation_id: uuid.UUID,
        payload: RecommendationUpdate,
        acting_user_id: Optional[uuid.UUID] = None,
    ) -> SolarRecommendationModel:
        """Update recommendation parameters or approval status."""
        rec = RecommendationService.get_recommendation_by_id(db, recommendation_id)
        data = payload.model_dump(exclude_unset=True)

        for field, value in data.items():
            setattr(rec, field, value)

        record_audit_log(
            db=db,
            action="recommendation_updated",
            entity_type="solar_recommendations",
            entity_id=rec.id,
            user_id=acting_user_id,
            metadata=data,
        )

        db.commit()
        db.refresh(rec)
        return rec
