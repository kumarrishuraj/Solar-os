"""Field Installation Management Service.

Schedules field installation, manages standard SOP checklist tasks,
enforces full checklist completion before commissioning, and activates hardware warranties.
"""

import uuid
from datetime import datetime, timezone, timedelta
from decimal import Decimal
from typing import Optional, List, Tuple, Dict, Any
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, UploadFile, status

from app.models.installation import InstallationModel, InstallationChecklistModel
from app.models.project import ProjectModel
from app.models.equipment import EquipmentModel
from app.models.product import ProductModel
from app.models.warranty import WarrantyModel
from app.schemas.installation import (
    InstallationCreate,
    InstallationStatusUpdate,
    ChecklistBatchUpdateRequest,
    InstallationCompleteRequest,
)
from app.core.storage import storage_service
from app.core.audit import record_audit_log


STANDARD_SOP_TASKS = [
    "Structure installed",
    "Panels installed",
    "Inverter installed",
    "DC wiring completed",
    "AC wiring completed",
    "Earthing completed",
    "Testing completed",
    "Commissioning completed",
    "Customer handover completed",
]


def generate_installation_number(db: Session) -> str:
    """Generate sequential unique installation identifier (INST-YYYY-NNNN)."""
    current_year = datetime.now(timezone.utc).year
    prefix = f"INST-{current_year}-"
    count = db.query(InstallationModel).count()
    return f"{prefix}{count + 1:04d}"


class InstallationService:
    """Business operations for solar plant field installation."""

    @staticmethod
    def create_installation(
        db: Session,
        payload: InstallationCreate,
        acting_user_id: Optional[uuid.UUID] = None,
    ) -> InstallationModel:
        """Schedule installation and seed standard SOP checklist tasks."""
        project = db.query(ProjectModel).filter(ProjectModel.id == payload.project_id).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project '{payload.project_id}' not found",
            )

        inst_id = uuid.uuid4()
        installation = InstallationModel(
            id=inst_id,
            project_id=payload.project_id,
            installation_number=generate_installation_number(db),
            assigned_technician_id=payload.assigned_technician_id,
            scheduled_date=payload.scheduled_date,
            system_capacity_kw=payload.system_capacity_kw,
            installation_status="scheduled",
            progress_percentage=Decimal("0.00"),
        )
        db.add(installation)

        # Seed standard SOP checklist
        for task in STANDARD_SOP_TASKS:
            chk = InstallationChecklistModel(
                id=uuid.uuid4(),
                installation_id=inst_id,
                task_name=task,
                is_completed=False,
            )
            db.add(chk)

        # Advance project status to installation_scheduled
        project.project_status = "installation_scheduled"

        record_audit_log(
            db=db,
            action="installation_scheduled",
            entity_type="installations",
            entity_id=installation.id,
            user_id=acting_user_id,
            metadata={"installation_number": installation.installation_number},
        )

        db.commit()
        db.refresh(installation)
        return installation

    @staticmethod
    def list_installations(
        db: Session,
        project_id: Optional[uuid.UUID] = None,
        technician_id: Optional[uuid.UUID] = None,
        installation_status: Optional[str] = None,
        page: int = 1,
        limit: int = 20,
    ) -> Tuple[List[InstallationModel], int]:
        """List installations with checklist items."""
        query = db.query(InstallationModel).options(joinedload(InstallationModel.checklist_items))

        if project_id:
            query = query.filter(InstallationModel.project_id == project_id)
        if technician_id:
            query = query.filter(InstallationModel.assigned_technician_id == technician_id)
        if installation_status:
            query = query.filter(InstallationModel.installation_status == installation_status)

        total = query.count()
        offset = (page - 1) * limit
        items = query.order_by(InstallationModel.scheduled_date.desc()).offset(offset).limit(limit).all()
        return items, total

    @staticmethod
    def get_installation_by_id(db: Session, installation_id: uuid.UUID) -> InstallationModel:
        """Fetch installation with checklist items."""
        installation = (
            db.query(InstallationModel)
            .options(joinedload(InstallationModel.checklist_items))
            .filter(InstallationModel.id == installation_id)
            .first()
        )
        if not installation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Installation '{installation_id}' not found",
            )
        return installation

    @staticmethod
    def update_installation_status(
        db: Session,
        installation_id: uuid.UUID,
        payload: InstallationStatusUpdate,
        acting_user_id: Optional[uuid.UUID] = None,
    ) -> InstallationModel:
        """Update installation status, start time, testing results."""
        installation = InstallationService.get_installation_by_id(db, installation_id)
        data = payload.model_dump(exclude_unset=True)

        for field, value in data.items():
            setattr(installation, field, value)

        # Sync project status
        project = db.query(ProjectModel).filter(ProjectModel.id == installation.project_id).first()
        if project:
            if installation.installation_status == "in_progress":
                project.project_status = "installation_in_progress"

        record_audit_log(
            db=db,
            action="installation_status_updated",
            entity_type="installations",
            entity_id=installation.id,
            user_id=acting_user_id,
            metadata=data,
        )

        db.commit()
        db.refresh(installation)
        return installation

    @staticmethod
    def update_checklist(
        db: Session,
        installation_id: uuid.UUID,
        payload: ChecklistBatchUpdateRequest,
        acting_user_id: Optional[uuid.UUID] = None,
    ) -> InstallationModel:
        """Update checklist tasks and recalculate progress percentage."""
        installation = InstallationService.get_installation_by_id(db, installation_id)

        now = datetime.now(timezone.utc)
        for item in payload.items:
            task = (
                db.query(InstallationChecklistModel)
                .filter(
                    InstallationChecklistModel.installation_id == installation_id,
                    InstallationChecklistModel.task_name == item.task_name,
                )
                .first()
            )
            if task:
                task.is_completed = item.is_completed
                if item.remarks is not None:
                    task.remarks = item.remarks
                if item.is_completed and not task.completed_at:
                    task.completed_at = now
                    task.completed_by = acting_user_id
                elif not item.is_completed:
                    task.completed_at = None
                    task.completed_by = None

        db.flush()

        # Recalculate progress percentage
        all_tasks = db.query(InstallationChecklistModel).filter(InstallationChecklistModel.installation_id == installation_id).all()
        total_count = len(all_tasks) or 1
        completed_count = sum(1 for t in all_tasks if t.is_completed)
        progress = Decimal(str(round((completed_count / total_count) * 100, 2)))
        installation.progress_percentage = progress

        if progress > Decimal("0.00") and installation.installation_status == "scheduled":
            installation.installation_status = "in_progress"
            if not installation.start_time:
                installation.start_time = now

        db.commit()
        db.refresh(installation)
        return installation

    @staticmethod
    def complete_installation(
        db: Session,
        installation_id: uuid.UUID,
        payload: InstallationCompleteRequest,
        acting_user_id: Optional[uuid.UUID] = None,
    ) -> InstallationModel:
        """Complete installation.
        
        STRICT VALIDATION: Verifies that ALL required standard checklist tasks are completed!
        Upon successful commissioning, marks project 'completed' and automatically activates warranties.
        """
        installation = InstallationService.get_installation_by_id(db, installation_id)

        # Validate checklist
        incomplete_tasks = (
            db.query(InstallationChecklistModel)
            .filter(
                InstallationChecklistModel.installation_id == installation_id,
                InstallationChecklistModel.is_completed == False,
            )
            .all()
        )
        if incomplete_tasks:
            names = [t.task_name for t in incomplete_tasks]
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot complete installation. Pending checklist items: {names}",
            )

        now = datetime.now(timezone.utc)
        installation.installation_status = "completed"
        installation.progress_percentage = Decimal("100.00")
        installation.completion_time = payload.completion_time or now
        installation.customer_confirmation = payload.customer_confirmation
        if payload.testing_results:
            installation.testing_results = payload.testing_results

        # Complete linked project
        project = db.query(ProjectModel).filter(ProjectModel.id == installation.project_id).first()
        if project:
            project.project_status = "completed"
            project.actual_completion_date = now.date()

        # Activate warranties for all assigned equipment units
        assigned_equipment = (
            db.query(EquipmentModel)
            .filter(EquipmentModel.project_id == installation.project_id)
            .all()
        )
        for unit in assigned_equipment:
            unit.equipment_status = "installed"
            unit.installation_id = installation.id
            unit.warranty_start_date = now.date()
            # Calculate warranty duration from product
            product = db.query(ProductModel).filter(ProductModel.id == unit.product_id).first()
            warranty_months = product.warranty_months if product else 60
            unit.warranty_end_date = now.date() + timedelta(days=warranty_months * 30)

            # Create warranty certificate if not existing
            existing_warranty = db.query(WarrantyModel).filter(WarrantyModel.equipment_id == unit.id).first()
            if not existing_warranty and project:
                w_cert = WarrantyModel(
                    id=uuid.uuid4(),
                    equipment_id=unit.id,
                    customer_id=project.customer_id,
                    warranty_start_date=unit.warranty_start_date,
                    warranty_end_date=unit.warranty_end_date,
                    warranty_status="active",
                )
                db.add(w_cert)

        record_audit_log(
            db=db,
            action="installation_commissioned",
            entity_type="installations",
            entity_id=installation.id,
            user_id=acting_user_id,
        )

        db.commit()
        db.refresh(installation)
        return installation

    @staticmethod
    async def upload_installation_photo(
        db: Session,
        installation_id: uuid.UUID,
        file: UploadFile,
        acting_user_id: Optional[uuid.UUID] = None,
    ) -> Dict[str, Any]:
        """Upload site completion or milestone photograph."""
        installation = InstallationService.get_installation_by_id(db, installation_id)

        file_path, file_name, file_size, mime_type = await storage_service.save_file(
            file=file,
            subfolder=f"installations/{installation_id}",
        )

        record_audit_log(
            db=db,
            action="installation_photo_uploaded",
            entity_type="installations",
            entity_id=installation.id,
            user_id=acting_user_id,
            metadata={"file_name": file_name, "file_path": file_path},
        )
        db.commit()

        return {
            "installation_id": installation_id,
            "file_name": file_name,
            "file_path": file_path,
            "mime_type": mime_type,
            "file_size_bytes": file_size,
        }
