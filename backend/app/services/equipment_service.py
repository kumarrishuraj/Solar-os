"""Serialized Hardware Equipment Management Service.

Tracks individual hardware units (panels, inverters, batteries) by unique manufacturer
serial number, verifies uniqueness, and manages site dispatch.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status

from app.models.equipment import EquipmentModel
from app.models.product import ProductModel
from app.models.project import ProjectModel
from app.models.installation import InstallationModel
from app.schemas.equipment import EquipmentCreate, EquipmentDispatch
from app.core.audit import record_audit_log


class EquipmentService:
    """Business operations for serialized hardware equipment units."""

    @staticmethod
    def register_equipment(
        db: Session,
        payload: EquipmentCreate,
        acting_user_id: Optional[uuid.UUID] = None,
    ) -> EquipmentModel:
        """Register equipment unit. Strictly rejects duplicate serial numbers."""
        # 1. Verify serial number uniqueness
        clean_serial = payload.serial_number.strip().upper()
        existing = db.query(EquipmentModel).filter(EquipmentModel.serial_number == clean_serial).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Hardware with serial number '{clean_serial}' is already registered",
            )

        # 2. Verify product exists
        product = db.query(ProductModel).filter(ProductModel.id == payload.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Catalog product '{payload.product_id}' not found",
            )

        equipment = EquipmentModel(
            id=uuid.uuid4(),
            product_id=payload.product_id,
            serial_number=clean_serial,
            supplier=payload.supplier.strip(),
            purchase_date=payload.purchase_date,
            equipment_status=payload.equipment_status or "in_stock",
            project_id=payload.project_id,
            installation_id=payload.installation_id,
        )
        db.add(equipment)
        db.commit()
        db.refresh(equipment)

        record_audit_log(
            db=db,
            action="equipment_registered",
            entity_type="equipment",
            entity_id=equipment.id,
            user_id=acting_user_id,
            metadata={"serial_number": clean_serial, "product_id": str(payload.product_id)},
        )

        return equipment

    @staticmethod
    def list_equipment(
        db: Session,
        product_id: Optional[uuid.UUID] = None,
        project_id: Optional[uuid.UUID] = None,
        equipment_status: Optional[str] = None,
        page: int = 1,
        limit: int = 50,
    ) -> Tuple[List[EquipmentModel], int]:
        """List equipment units with pagination."""
        query = db.query(EquipmentModel).options(joinedload(EquipmentModel.product))

        if product_id:
            query = query.filter(EquipmentModel.product_id == product_id)
        if project_id:
            query = query.filter(EquipmentModel.project_id == project_id)
        if equipment_status:
            query = query.filter(EquipmentModel.equipment_status == equipment_status)

        total = query.count()
        offset = (page - 1) * limit
        items = query.order_by(EquipmentModel.created_at.desc()).offset(offset).limit(limit).all()
        return items, total

    @staticmethod
    def get_equipment_by_id(db: Session, equipment_id: uuid.UUID) -> EquipmentModel:
        """Fetch equipment by internal UUID."""
        unit = (
            db.query(EquipmentModel)
            .options(joinedload(EquipmentModel.product))
            .filter(EquipmentModel.id == equipment_id)
            .first()
        )
        if not unit:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Equipment unit '{equipment_id}' not found",
            )
        return unit

    @staticmethod
    def get_equipment_by_serial(db: Session, serial_number: str) -> EquipmentModel:
        """Lookup equipment by manufacturer serial number."""
        clean_serial = serial_number.strip().upper()
        unit = (
            db.query(EquipmentModel)
            .options(joinedload(EquipmentModel.product))
            .filter(EquipmentModel.serial_number == clean_serial)
            .first()
        )
        if not unit:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No equipment registered with serial number '{clean_serial}'",
            )
        return unit

    @staticmethod
    def dispatch_equipment(
        db: Session,
        equipment_id: uuid.UUID,
        payload: EquipmentDispatch,
        acting_user_id: Optional[uuid.UUID] = None,
    ) -> EquipmentModel:
        """Dispatch equipment unit to project site."""
        unit = EquipmentService.get_equipment_by_id(db, equipment_id)

        # Verify project exists
        project = db.query(ProjectModel).filter(ProjectModel.id == payload.project_id).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project '{payload.project_id}' not found",
            )

        if payload.installation_id:
            installation = db.query(InstallationModel).filter(InstallationModel.id == payload.installation_id).first()
            if not installation:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Installation '{payload.installation_id}' not found",
                )

        unit.project_id = payload.project_id
        unit.installation_id = payload.installation_id
        unit.equipment_status = "dispatched"

        record_audit_log(
            db=db,
            action="equipment_dispatched",
            entity_type="equipment",
            entity_id=unit.id,
            user_id=acting_user_id,
            metadata={"project_id": str(payload.project_id), "serial_number": unit.serial_number},
        )

        db.commit()
        db.refresh(unit)
        return unit
