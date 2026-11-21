-- ==============================================================================
-- Migration: 015_create_equipment.sql
-- Description: Create equipment table for serialized hardware unit tracking
-- Database: PostgreSQL 15+ / Supabase
-- ==============================================================================

CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    serial_number VARCHAR(150) UNIQUE NOT NULL,
    supplier VARCHAR(150) NOT NULL,
    purchase_date DATE NOT NULL,
    warranty_start_date DATE,
    warranty_end_date DATE,
    equipment_status VARCHAR(40) NOT NULL DEFAULT 'in_stock',
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    installation_id UUID, -- Foreign key constraint will be added in migration 016 after installations table is created
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_equipment_status CHECK (
        equipment_status IN (
            'in_stock',
            'reserved',
            'dispatched',
            'installed',
            'under_service',
            'decommissioned'
        )
    ),
    CONSTRAINT chk_equipment_warranty_dates CHECK (
        warranty_end_date IS NULL OR warranty_start_date IS NULL OR warranty_end_date >= warranty_start_date
    )
);

-- Trigger for updated_at on equipment
DROP TRIGGER IF EXISTS trg_equipment_updated_at ON equipment;
CREATE TRIGGER trg_equipment_updated_at
    BEFORE UPDATE ON equipment
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE equipment IS 'Individual serialized hardware units (e.g. inverter serial, panel batch/serial)';
COMMENT ON COLUMN equipment.serial_number IS 'Manufacturer unique serial number';
