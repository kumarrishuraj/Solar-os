"""SQLAlchemy model for telemetry table.

IoT inverter sensor readings time-series data.
"""

import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional
from sqlalchemy import (
    String,
    Numeric,
    DateTime,
    ForeignKey,
    Index,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class TelemetryModel(Base):
    """Telemetry time-series entity mapped to PostgreSQL telemetry table."""

    __tablename__ = "telemetry"
    __table_args__ = (
        Index("idx_telemetry_equipment_time", "equipment_id", "timestamp"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    equipment_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("equipment.id", ondelete="CASCADE"), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    voltage: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 3), nullable=True)
    current: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 3), nullable=True)
    power: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 3), nullable=True)
    temperature: Mapped[Optional[Decimal]] = mapped_column(Numeric(8, 2), nullable=True)
    energy_generated_kwh: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 3), nullable=True)
    source: Mapped[Optional[str]] = mapped_column(String(50), default="iot_gateway", nullable=True)

    # Relationships
    equipment = relationship("EquipmentModel", back_populates="telemetry_readings")
