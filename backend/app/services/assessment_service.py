"""Property Assessment Business Logic Service.

Handles self-service and surveyor rooftop measurements, consumption tariffs,
and rooftop image file management.
"""

import uuid
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, UploadFile, status

from app.models.assessment import PropertyAssessmentModel, AssessmentImageModel
from app.models.customer import CustomerModel
from app.schemas.assessment import AssessmentCreate, AssessmentUpdate
from app.core.storage import storage_service
from app.core.audit import record_audit_log


class AssessmentService:
    """Business operations for property rooftop assessments and images."""

    @staticmethod
    def create_assessment(
        db: Session,
        payload: AssessmentCreate,
        acting_user_id: Optional[uuid.UUID] = None,
    ) -> PropertyAssessmentModel:
        """Create new assessment record. Allows unknown rooftop dimensions without inventing fake data."""
        # Validate customer exists
        customer = db.query(CustomerModel).filter(CustomerModel.id == payload.customer_id).first()
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Customer with ID '{payload.customer_id}' does not exist",
            )

        # Validate usable roof area <= roof area if both provided
        if payload.roof_area is not None and payload.usable_roof_area is not None:
            if payload.usable_roof_area > payload.roof_area:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="usable_roof_area cannot exceed gross roof_area",
                )

        assessment = PropertyAssessmentModel(
            id=uuid.uuid4(),
            **payload.model_dump(),
        )
        db.add(assessment)
        db.commit()
        db.refresh(assessment)

        record_audit_log(
            db=db,
            action="assessment_created",
            entity_type="property_assessments",
            entity_id=assessment.id,
            user_id=acting_user_id,
        )

        return assessment

    @staticmethod
    def list_assessments(
        db: Session,
        customer_id: Optional[uuid.UUID] = None,
        lead_id: Optional[uuid.UUID] = None,
        page: int = 1,
        limit: int = 20,
    ) -> Tuple[List[PropertyAssessmentModel], int]:
        """List assessments with pagination and filters."""
        query = db.query(PropertyAssessmentModel).options(joinedload(PropertyAssessmentModel.images))

        if customer_id:
            query = query.filter(PropertyAssessmentModel.customer_id == customer_id)
        if lead_id:
            query = query.filter(PropertyAssessmentModel.lead_id == lead_id)

        total = query.count()
        offset = (page - 1) * limit
        items = query.order_by(PropertyAssessmentModel.created_at.desc()).offset(offset).limit(limit).all()
        return items, total

    @staticmethod
    def get_assessment_by_id(db: Session, assessment_id: uuid.UUID) -> PropertyAssessmentModel:
        """Get single assessment with images."""
        assessment = (
            db.query(PropertyAssessmentModel)
            .options(joinedload(PropertyAssessmentModel.images))
            .filter(PropertyAssessmentModel.id == assessment_id)
            .first()
        )
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Property assessment with ID '{assessment_id}' not found",
            )
        return assessment

    @staticmethod
    def update_assessment(
        db: Session,
        assessment_id: uuid.UUID,
        payload: AssessmentUpdate,
        acting_user_id: Optional[uuid.UUID] = None,
    ) -> PropertyAssessmentModel:
        """Update property assessment."""
        assessment = AssessmentService.get_assessment_by_id(db, assessment_id)
        data = payload.model_dump(exclude_unset=True)

        # Check usable roof area constraint
        target_roof_area = data.get("roof_area", assessment.roof_area)
        target_usable_area = data.get("usable_roof_area", assessment.usable_roof_area)
        if target_roof_area is not None and target_usable_area is not None:
            if target_usable_area > target_roof_area:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="usable_roof_area cannot exceed gross roof_area",
                )

        for field, value in data.items():
            setattr(assessment, field, value)

        record_audit_log(
            db=db,
            action="assessment_updated",
            entity_type="property_assessments",
            entity_id=assessment.id,
            user_id=acting_user_id,
            metadata=data,
        )

        db.commit()
        db.refresh(assessment)
        return assessment

    @staticmethod
    async def upload_assessment_image(
        db: Session,
        assessment_id: uuid.UUID,
        file: UploadFile,
        image_type: str = "rooftop_full_view",
        acting_user_id: Optional[uuid.UUID] = None,
    ) -> AssessmentImageModel:
        """Upload image to storage and record metadata in database."""
        # Verify assessment exists
        AssessmentService.get_assessment_by_id(db, assessment_id)

        valid_types = {
            "rooftop_full_view",
            "rooftop_angle",
            "obstacles",
            "shaded_area",
            "electricity_bill",
            "switchboard_meter",
            "other",
        }
        if image_type not in valid_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid image_type '{image_type}'. Allowed: {sorted(list(valid_types))}",
            )

        file_path, file_name, file_size, mime_type = await storage_service.save_file(
            file=file,
            subfolder=f"assessments/{assessment_id}",
        )

        image = AssessmentImageModel(
            id=uuid.uuid4(),
            assessment_id=assessment_id,
            file_path=file_path,
            file_name=file_name,
            mime_type=mime_type,
            file_size_bytes=file_size,
            image_type=image_type,
        )
        db.add(image)
        db.commit()
        db.refresh(image)

        record_audit_log(
            db=db,
            action="assessment_image_uploaded",
            entity_type="assessment_images",
            entity_id=image.id,
            user_id=acting_user_id,
            metadata={"file_name": file_name, "image_type": image_type},
        )

        return image

    @staticmethod
    def list_assessment_images(db: Session, assessment_id: uuid.UUID) -> List[AssessmentImageModel]:
        """List all images belonging to an assessment."""
        # Verify assessment exists
        AssessmentService.get_assessment_by_id(db, assessment_id)
        return db.query(AssessmentImageModel).filter(AssessmentImageModel.assessment_id == assessment_id).all()

    @staticmethod
    def delete_assessment_image(
        db: Session,
        assessment_id: uuid.UUID,
        image_id: uuid.UUID,
        acting_user_id: Optional[uuid.UUID] = None,
    ) -> bool:
        """Delete image from storage and remove database record."""
        image = (
            db.query(AssessmentImageModel)
            .filter(AssessmentImageModel.id == image_id, AssessmentImageModel.assessment_id == assessment_id)
            .first()
        )
        if not image:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Image with ID '{image_id}' not found for assessment '{assessment_id}'",
            )

        storage_service.delete_file(image.file_path)
        db.delete(image)
        db.commit()

        record_audit_log(
            db=db,
            action="assessment_image_deleted",
            entity_type="assessment_images",
            entity_id=image_id,
            user_id=acting_user_id,
        )

        return True
