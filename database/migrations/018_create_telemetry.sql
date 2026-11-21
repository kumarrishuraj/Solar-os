-- ==============================================================================
-- Migration: 018_create_telemetry.sql
-- Description: Create telemetry table for IoT inverter time-series readings and health monitoring
-- Database: PostgreSQL 15+ / Supabase
-- ==============================================================================

CREATE TABLE IF NOT EXISTS telemetry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    voltage NUMERIC(12, 3),
    current NUMERIC(12, 3),
    power NUMERIC(12, 3),
    temperature NUMERIC(8, 2),
    energy_generated_kwh NUMERIC(12, 3),
    source VARCHAR(50) DEFAULT 'iot_gateway',

    -- Constraints
    CONSTRAINT chk_telemetry_voltage CHECK (voltage IS NULL OR voltage >= 0),
    CONSTRAINT chk_telemetry_current CHECK (current IS NULL OR current >= 0),
    CONSTRAINT chk_telemetry_power CHECK (power IS NULL OR power >= 0),
    CONSTRAINT chk_telemetry_energy CHECK (energy_generated_kwh IS NULL OR energy_generated_kwh >= 0)
);

COMMENT ON TABLE telemetry IS 'Time-series sensor telemetry data from solar inverters and energy meters';
COMMENT ON COLUMN telemetry.power IS 'Active power output in Watts (W)';
