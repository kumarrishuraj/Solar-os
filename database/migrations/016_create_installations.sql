-- ==============================================================================
-- Migration: 016_create_installations.sql
-- Description: Create installations, checklist tables, and resolve equipment FK
-- Database: PostgreSQL 15+ / Supabase
-- ==============================================================================

CREATE TABLE IF NOT EXISTS installations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
    installation_number VARCHAR(50) UNIQUE NOT NULL,
    assigned_technician_id UUID REFERENCES users(id) ON DELETE SET NULL,
    scheduled_date TIMESTAMPTZ NOT NULL,
    start_time TIMESTAMPTZ,
    completion_time TIMESTAMPTZ,
    installation_status VARCHAR(40) NOT NULL DEFAULT 'scheduled',
    progress_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    system_capacity_kw NUMERIC(10, 2) NOT NULL,
    testing_results JSONB DEFAULT '{}'::jsonb,
    customer_confirmation BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_installations_status CHECK (
        installation_status IN (
            'scheduled',
            'in_progress',
            'testing',
            'completed',
            'on_hold',
            'cancelled'
        )
    ),
    CONSTRAINT chk_installations_progress CHECK (
        progress_percentage >= 0.00 AND progress_percentage <= 100.00
    ),
    CONSTRAINT chk_installations_capacity CHECK (system_capacity_kw >= 0),
    CONSTRAINT chk_installations_times CHECK (
        completion_time IS NULL OR start_time IS NULL OR completion_time >= start_time
    )
);

-- Trigger for updated_at on installations
DROP TRIGGER IF EXISTS trg_installations_updated_at ON installations;
CREATE TRIGGER trg_installations_updated_at
    BEFORE UPDATE ON installations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Installation Verification Checklist
CREATE TABLE IF NOT EXISTS installation_checklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    installation_id UUID NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
    task_name VARCHAR(200) NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    completed_at TIMESTAMPTZ,
    remarks TEXT
);

-- Safely resolve circular relation between equipment and installations
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_equipment_installation'
    ) THEN
        ALTER TABLE equipment
            ADD CONSTRAINT fk_equipment_installation
            FOREIGN KEY (installation_id)
            REFERENCES installations(id)
            ON DELETE SET NULL;
    END IF;
END $$;

COMMENT ON TABLE installations IS 'Field physical installation operations, milestones, and testing';
COMMENT ON TABLE installation_checklist IS 'Standard operating procedure (SOP) sign-off tasks per installation';
