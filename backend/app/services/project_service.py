"""Project Management Business Logic Service.

Orchestrates the 13 discrete project lifecycle stages and validates status transitions.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status

from app.models.project import ProjectModel
from app.models.customer import CustomerModel
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.core.audit import record_audit_log


VALID_PROJECT_STATUSES = [
    "enquiry",
    "assessment",
    "survey_pending",
    "survey_approved",
    "design_approved",
    "quotation_pending",
    "quotation_approved",
    "payment_pending",
    "ready_for_dispatch",
    "installation_scheduled",
    "installation_in_progress",
    "completed",
    "cancelled",
]

# State transition matrix enforcing business lifecycle rules
ALLOWED_TRANSITIONS = {
    "enquiry": {"assessment", "survey_pending", "cancelled"},
    "assessment": {"survey_pending", "design_approved", "quotation_pending", "cancelled"},
    "survey_pending": {"survey_approved", "assessment", "cancelled"},
    "survey_approved": {"design_approved", "quotation_pending", "cancelled"},
    "design_approved": {"quotation_pending", "quotation_approved", "cancelled"},
    "quotation_pending": {"quotation_approved", "cancelled"},
    "quotation_approved": {"payment_pending", "ready_for_dispatch", "cancelled"},
    "payment_pending": {"ready_for_dispatch", "installation_scheduled", "cancelled"},
    "ready_for_dispatch": {"installation_scheduled", "installation_in_progress", "cancelled"},
    "installation_scheduled": {"installation_in_progress", "ready_for_dispatch", "cancelled"},
    "installation_in_progress": {"completed", "installation_scheduled", "cancelled"},
    "completed": set(),  # Terminal state
    "cancelled": {"enquiry"},  # Can reopen if needed
}


def generate_project_number(db: Session) -> str:
    """Generate sequential unique project number (PRJ-YYYY-NNNN)."""
    current_year = datetime.now(timezone.utc).year
    prefix = f"PRJ-{current_year}-"
    count = db.query(ProjectModel).count()
    return f"{prefix}{count + 1:04d}"


class ProjectService:
    """Business operations for solar projects."""

    @staticmethod
    def create_project(
        db: Session,
        payload: ProjectCreate,
        acting_user_id: Optional[uuid.UUID] = None,
    ) -> ProjectModel:
        """Create new project contract."""
        customer = db.query(CustomerModel).filter(CustomerModel.id == payload.customer_id).first()
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Customer '{payload.customer_id}' not found",
            )

        prj_number = generate_project_number(db)
        project = ProjectModel(
            id=uuid.uuid4(),
            project_number=prj_number,
            customer_id=payload.customer_id,
            lead_id=payload.lead_id,
            project_name=payload.project_name,
            proposed_capacity_kw=payload.proposed_capacity_kw,
            approved_capacity_kw=payload.approved_capacity_kw,
            project_status="enquiry",
            estimated_cost=payload.estimated_cost,
            final_cost=payload.final_cost,
            expected_completion_date=payload.expected_completion_date,
        )
        db.add(project)
        db.commit()
        db.refresh(project)

        record_audit_log(
            db=db,
            action="project_created",
            entity_type="projects",
            entity_id=project.id,
            user_id=acting_user_id,
            metadata={"project_number": project.project_number},
        )

        return project

    @staticmethod
    def list_projects(
        db: Session,
        customer_id: Optional[uuid.UUID] = None,
        status_filter: Optional[str] = None,
        page: int = 1,
        limit: int = 20,
    ) -> Tuple[List[ProjectModel], int]:
        """List projects with filtering and pagination."""
        query = db.query(ProjectModel)

        if customer_id:
            query = query.filter(ProjectModel.customer_id == customer_id)
        if status_filter:
            query = query.filter(ProjectModel.project_status == status_filter.strip())

        total = query.count()
        offset = (page - 1) * limit
        items = query.order_by(ProjectModel.created_at.desc()).offset(offset).limit(limit).all()
        return items, total

    @staticmethod
    def get_project_by_id(db: Session, project_id: uuid.UUID) -> ProjectModel:
        """Fetch project by ID."""
        project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project '{project_id}' not found",
            )
        return project

    @staticmethod
    def update_project(
        db: Session,
        project_id: uuid.UUID,
        payload: ProjectUpdate,
        acting_user_id: Optional[uuid.UUID] = None,
    ) -> ProjectModel:
        """Update project details."""
        project = ProjectService.get_project_by_id(db, project_id)
        data = payload.model_dump(exclude_unset=True)

        for field, value in data.items():
            setattr(project, field, value)

        record_audit_log(
            db=db,
            action="project_updated",
            entity_type="projects",
            entity_id=project.id,
            user_id=acting_user_id,
            metadata=data,
        )

        db.commit()
        db.refresh(project)
        return project

    @staticmethod
    def update_project_status(
        db: Session,
        project_id: uuid.UUID,
        target_status: str,
        notes: Optional[str] = None,
        acting_user_id: Optional[uuid.UUID] = None,
    ) -> ProjectModel:
        """Validate and execute project status milestone transition."""
        if target_status not in VALID_PROJECT_STATUSES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid project status '{target_status}'. Allowed: {VALID_PROJECT_STATUSES}",
            )

        project = ProjectService.get_project_by_id(db, project_id)
        current = project.project_status

        # Validate transition
        allowed = ALLOWED_TRANSITIONS.get(current, set())
        if target_status != current and target_status not in allowed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Illegal project transition from '{current}' to '{target_status}'. Allowed transitions: {sorted(list(allowed))}",
            )

        project.project_status = target_status

        if target_status == "completed" and not project.actual_completion_date:
            project.actual_completion_date = datetime.now(timezone.utc).date()

        record_audit_log(
            db=db,
            action="project_status_changed",
            entity_type="projects",
            entity_id=project.id,
            user_id=acting_user_id,
            metadata={"from": current, "to": target_status, "notes": notes},
        )

        db.commit()
        db.refresh(project)
        return project
