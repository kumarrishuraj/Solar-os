"""IoT Telemetry Data Storage Service.

Stores and queries time-series sensor telemetry from inverters and smart energy meters
(without ML anomaly detection).
"""

import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.telemetry import TelemetryModel
from app.models.equipment import EquipmentModel
from app.schemas.monitoring import TelemetryCreate


class MonitoringService:
    """Business operations for IoT sensor readings."""

    @staticmethod
    def ingest_telemetry(
        db: Session,
        payload: TelemetryCreate,
    ) -> TelemetryModel:
        """Store IoT inverter telemetry reading."""
        equipment = db.query(EquipmentModel).filter(EquipmentModel.id == payload.equipment_id).first()
        if not equipment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Equipment '{payload.equipment_id}' not found",
            )

        reading = TelemetryModel(
            id=uuid.uuid4(),
            equipment_id=payload.equipment_id,
            timestamp=payload.timestamp or datetime.now(timezone.utc),
            voltage=payload.voltage,
            current=payload.current,
            power=payload.power,
            temperature=payload.temperature,
            energy_generated_kwh=payload.energy_generated_kwh,
            source=payload.source or "iot_gateway",
        )
        db.add(reading)
        db.commit()
        db.refresh(reading)
        return reading

    @staticmethod
    def get_latest_reading(db: Session, equipment_id: uuid.UUID) -> Optional[TelemetryModel]:
        """Fetch latest sensor reading for an equipment unit."""
        return (
            db.query(TelemetryModel)
            .filter(TelemetryModel.equipment_id == equipment_id)
            .order_by(TelemetryModel.timestamp.desc())
            .first()
        )

    @staticmethod
    def get_telemetry_history(
        db: Session,
        equipment_id: uuid.UUID,
        limit: int = 100,
    ) -> List[TelemetryModel]:
        """Fetch historical sensor readings for an equipment unit."""
        return (
            db.query(TelemetryModel)
            .filter(TelemetryModel.equipment_id == equipment_id)
            .order_by(TelemetryModel.timestamp.desc())
            .limit(limit)
            .all()
        )
