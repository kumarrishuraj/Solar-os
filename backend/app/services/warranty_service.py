"""Warranty Management Business Logic Service.

Generates warranty records derived from product warranty_months catalog definitions
and manages equipment warranty certificates.
"""

import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.warranty import WarrantyModel
from app.models.equipment import EquipmentModel
from app.models.product import ProductModel
from app.models.customer import CustomerModel
from app.schemas.warranty import WarrantyCreate
from app.core.audit import record_audit_log


class WarrantyService:
    """Business operations for equipment warranties."""

    @staticmethod
    def create_warranty(
        db: Session,
        payload: WarrantyCreate,
        acting_user_id: Optional[uuid.UUID] = None,
    ) -> WarrantyModel:
        """Create a warranty certificate record. Duration taken from approved product info."""
        equipment = db.query(EquipmentModel).filter(EquipmentModel.id == payload.equipment_id).first()
        if not equipment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Equipment '{payload.equipment_id}' not found",
            )

        customer = db.query(CustomerModel).filter(CustomerModel.id == payload.customer_id).first()
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Customer '{payload.customer_id}' not found",
            )

        # Determine warranty duration from approved product info
        product = db.query(ProductModel).filter(ProductModel.id == equipment.product_id).first()
        warranty_months = payload.warranty_months or (product.warranty_months if product else 60)

        start_date = payload.warranty_start_date
        end_date = payload.warranty_end_date or (start_date + timedelta(days=warranty_months * 30))

        if end_date < start_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="warranty_end_date cannot be earlier than warranty_start_date",
            )

        warranty = WarrantyModel(
            id=uuid.uuid4(),
            equipment_id=payload.equipment_id,
            customer_id=payload.customer_id,
            warranty_start_date=start_date,
            warranty_end_date=end_date,
            warranty_status="active",
            warranty_document_path=payload.warranty_document_path,
        )
        db.add(warranty)

        # Update equipment warranty dates
        equipment.warranty_start_date = start_date
        equipment.warranty_end_date = end_date

        record_audit_log(
            db=db,
            action="warranty_registered",
            entity_type="warranties",
            entity_id=warranty.id,
            user_id=acting_user_id,
            metadata={"equipment_id": str(payload.equipment_id), "warranty_months": warranty_months},
        )

        db.commit()
        db.refresh(warranty)
        return warranty

    @staticmethod
    def list_warranties(
        db: Session,
        customer_id: Optional[uuid.UUID] = None,
        equipment_id: Optional[uuid.UUID] = None,
        page: int = 1,
        limit: int = 50,
    ) -> Tuple[List[WarrantyModel], int]:
        """List warranty certificates."""
        query = db.query(WarrantyModel)
        if customer_id:
            query = query.filter(WarrantyModel.customer_id == customer_id)
        if equipment_id:
            query = query.filter(WarrantyModel.equipment_id == equipment_id)

        total = query.count()
        offset = (page - 1) * limit
        items = query.order_by(WarrantyModel.created_at.desc()).offset(offset).limit(limit).all()
        return items, total

    @staticmethod
    def get_warranty_by_id(db: Session, warranty_id: uuid.UUID) -> WarrantyModel:
        """Fetch warranty certificate by ID."""
        warranty = db.query(WarrantyModel).filter(WarrantyModel.id == warranty_id).first()
        if not warranty:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Warranty '{warranty_id}' not found",
            )
        return warranty

    @staticmethod
    def get_equipment_warranty(db: Session, equipment_id: uuid.UUID) -> WarrantyModel:
        """Fetch warranty for a given equipment unit."""
        warranty = db.query(WarrantyModel).filter(WarrantyModel.equipment_id == equipment_id).first()
        if not warranty:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No warranty registered for equipment '{equipment_id}'",
            )
        return warranty
