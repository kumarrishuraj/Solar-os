"""IoT Sensor Monitoring and Telemetry Routes."""

import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_optional, AuthenticatedUser
from app.schemas.monitoring import (
    TelemetryCreate,
    TelemetryResponse,
    EquipmentTelemetryHistory,
)
from app.services.monitoring_service import MonitoringService

router = APIRouter(prefix="/monitoring", tags=["IoT Monitoring & Telemetry"])


@router.post(
    "/telemetry",
    response_model=TelemetryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Ingest Sensor Telemetry",
    description="Stores sensor reading (voltage, current, power, temperature, kWh) from IoT gateways.",
)
def ingest_telemetry(
    payload: TelemetryCreate,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> TelemetryResponse:
    """Ingest sensor reading."""
    reading = MonitoringService.ingest_telemetry(db, payload)
    return TelemetryResponse.model_validate(reading)


@router.get(
    "/{equipment_id}",
    response_model=Optional[TelemetryResponse],
    summary="Get Latest Inverter Reading",
    description="Returns the most recent telemetry sensor point for an inverter.",
)
def get_latest_telemetry(
    equipment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> Optional[TelemetryResponse]:
    """Get latest reading."""
    reading = MonitoringService.get_latest_reading(db, equipment_id)
    return TelemetryResponse.model_validate(reading) if reading else None


@router.get(
    "/{equipment_id}/history",
    response_model=EquipmentTelemetryHistory,
    summary="Get Telemetry History Stream",
    description="Returns time-series telemetry readings for charts and operational monitoring.",
)
def get_telemetry_history(
    equipment_id: uuid.UUID,
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> EquipmentTelemetryHistory:
    """Get telemetry stream."""
    readings = MonitoringService.get_telemetry_history(db, equipment_id, limit=limit)
    return EquipmentTelemetryHistory(
        equipment_id=equipment_id,
        total_readings=len(readings),
        readings=[TelemetryResponse.model_validate(r) for r in readings],
    )
