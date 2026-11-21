"""Site Survey Management Service.

Handles surveyor assignment, scheduling, field measurements audit,
and engineering approval/rejection workflows with mandatory rejection reasons.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status

from app.models.survey import SiteSurveyModel
from app.models.project import ProjectModel
from app.models.user import UserModel
from app.schemas.survey import SurveyCreate, SurveyUpdate
from app.core.audit import record_audit_log


class SurveyService:
    """Business operations for site surveys."""

    @staticmethod
    def create_survey(
        db: Session,
        payload: SurveyCreate,
        acting_user_id: Optional[uuid.UUID] = None,
    ) -> SiteSurveyModel:
        """Create and schedule on-site physical survey."""
        # Verify project and surveyor exist
        project = db.query(ProjectModel).filter(ProjectModel.id == payload.project_id).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project '{payload.project_id}' not found",
            )

        surveyor = db.query(UserModel).filter(UserModel.id == payload.surveyor_id).first()
        if not surveyor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Surveyor user '{payload.surveyor_id}' not found",
            )

        survey = SiteSurveyModel(
            id=uuid.uuid4(),
            project_id=payload.project_id,
            assessment_id=payload.assessment_id,
            surveyor_id=payload.surveyor_id,
            scheduled_date=payload.scheduled_date,
            remarks=payload.remarks,
            approval_status="pending",
        )
        db.add(survey)

        # Update project status to survey_pending
        if project.project_status in ("enquiry", "assessment"):
            project.project_status = "survey_pending"

        record_audit_log(
            db=db,
            action="survey_scheduled",
            entity_type="site_surveys",
            entity_id=survey.id,
            user_id=acting_user_id,
            metadata={"project_id": str(payload.project_id), "surveyor_id": str(payload.surveyor_id)},
        )

        db.commit()
        db.refresh(survey)
        return survey

    @staticmethod
    def list_surveys(
        db: Session,
        project_id: Optional[uuid.UUID] = None,
        surveyor_id: Optional[uuid.UUID] = None,
        approval_status: Optional[str] = None,
        page: int = 1,
        limit: int = 20,
    ) -> Tuple[List[SiteSurveyModel], int]:
        """List surveys with pagination and filters."""
        query = db.query(SiteSurveyModel)

        if project_id:
            query = query.filter(SiteSurveyModel.project_id == project_id)
        if surveyor_id:
            query = query.filter(SiteSurveyModel.surveyor_id == surveyor_id)
        if approval_status:
            query = query.filter(SiteSurveyModel.approval_status == approval_status)

        total = query.count()
        offset = (page - 1) * limit
        items = query.order_by(SiteSurveyModel.scheduled_date.desc()).offset(offset).limit(limit).all()
        return items, total

    @staticmethod
    def get_survey_by_id(db: Session, survey_id: uuid.UUID) -> SiteSurveyModel:
        """Fetch survey by ID."""
        survey = db.query(SiteSurveyModel).filter(SiteSurveyModel.id == survey_id).first()
        if not survey:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Site survey '{survey_id}' not found",
            )
        return survey

    @staticmethod
    def update_survey(
        db: Session,
        survey_id: uuid.UUID,
        payload: SurveyUpdate,
        acting_user_id: Optional[uuid.UUID] = None,
    ) -> SiteSurveyModel:
        """Update survey field findings."""
        survey = SurveyService.get_survey_by_id(db, survey_id)
        data = payload.model_dump(exclude_unset=True)

        for field, value in data.items():
            setattr(survey, field, value)

        record_audit_log(
            db=db,
            action="survey_updated",
            entity_type="site_surveys",
            entity_id=survey.id,
            user_id=acting_user_id,
            metadata=data,
        )

        db.commit()
        db.refresh(survey)
        return survey

    @staticmethod
    def submit_survey(
        db: Session,
        survey_id: uuid.UUID,
        acting_user_id: Optional[uuid.UUID] = None,
    ) -> SiteSurveyModel:
        """Mark survey as completed and submitted by surveyor."""
        survey = SurveyService.get_survey_by_id(db, survey_id)
        if not survey.actual_survey_date:
            survey.actual_survey_date = datetime.now(timezone.utc)
        survey.approval_status = "pending"

        record_audit_log(
            db=db,
            action="survey_submitted",
            entity_type="site_surveys",
            entity_id=survey.id,
            user_id=acting_user_id,
        )

        db.commit()
        db.refresh(survey)
        return survey

    @staticmethod
    def approve_survey(
        db: Session,
        survey_id: uuid.UUID,
        approved_by_id: uuid.UUID,
    ) -> SiteSurveyModel:
        """Engineer approval of survey findings."""
        survey = SurveyService.get_survey_by_id(db, survey_id)
        survey.approval_status = "approved"
        survey.approved_by = approved_by_id
        survey.approved_at = datetime.now(timezone.utc)
        survey.rejection_reason = None

        # Advance project status to survey_approved
        project = db.query(ProjectModel).filter(ProjectModel.id == survey.project_id).first()
        if project:
            project.project_status = "survey_approved"

        record_audit_log(
            db=db,
            action="survey_approved",
            entity_type="site_surveys",
            entity_id=survey.id,
            user_id=approved_by_id,
        )

        db.commit()
        db.refresh(survey)
        return survey

    @staticmethod
    def reject_survey(
        db: Session,
        survey_id: uuid.UUID,
        rejection_reason: str,
        acting_user_id: Optional[uuid.UUID] = None,
    ) -> SiteSurveyModel:
        """Reject survey. Strictly requires a rejection reason."""
        if not rejection_reason or len(rejection_reason.strip()) < 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A valid rejection reason (minimum 5 characters) is required",
            )

        survey = SurveyService.get_survey_by_id(db, survey_id)
        survey.approval_status = "rejected"
        survey.rejection_reason = rejection_reason.strip()

        record_audit_log(
            db=db,
            action="survey_rejected",
            entity_type="site_surveys",
            entity_id=survey.id,
            user_id=acting_user_id,
            metadata={"rejection_reason": rejection_reason},
        )

        db.commit()
        db.refresh(survey)
        return survey
