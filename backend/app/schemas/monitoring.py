"""Pydantic schemas for IoT telemetry and sensor monitoring."""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class TelemetryCreate(BaseModel):
    """Inverter sensor reading ingestion payload."""

    equipment_id: uuid.UUID
    timestamp: Optional[datetime] = None
    voltage: Optional[Decimal] = None
    current: Optional[Decimal] = None
    power: Optional[Decimal] = None
    temperature: Optional[Decimal] = None
    energy_generated_kwh: Optional[Decimal] = None
    source: Optional[str] = "iot_gateway"


class TelemetryResponse(BaseModel):
    """Inverter sensor reading response."""

    id: uuid.UUID
    equipment_id: uuid.UUID
    timestamp: datetime
    voltage: Optional[Decimal] = None
    current: Optional[Decimal] = None
    power: Optional[Decimal] = None
    temperature: Optional[Decimal] = None
    energy_generated_kwh: Optional[Decimal] = None
    source: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class EquipmentTelemetryHistory(BaseModel):
    """Telemetry stream history for an equipment unit."""

    equipment_id: uuid.UUID
    total_readings: int
    readings: List[TelemetryResponse] = []
