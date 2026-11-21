-- ==============================================================================
-- Migration: 005_create_projects.sql
-- Description: Create projects table tracking full solar project lifecycle
-- Database: PostgreSQL 15+ / Supabase
-- ==============================================================================

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    project_name VARCHAR(200) NOT NULL,
    proposed_capacity_kw NUMERIC(10, 2),
    approved_capacity_kw NUMERIC(10, 2),
    project_status VARCHAR(50) NOT NULL DEFAULT 'enquiry',
    estimated_cost NUMERIC(14, 2),
    final_cost NUMERIC(14, 2),
    expected_completion_date DATE,
    actual_completion_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_projects_status CHECK (
        project_status IN (
            'enquiry',
            'assessment',
            'survey_pending',
            'survey_approved',
            'design_approved',
            'quotation_pending',
            'quotation_approved',
            'payment_pending',
            'ready_for_dispatch',
            'installation_scheduled',
            'installation_in_progress',
            'completed',
            'cancelled'
        )
    ),
    CONSTRAINT chk_projects_proposed_capacity CHECK (
        proposed_capacity_kw IS NULL OR proposed_capacity_kw >= 0
    ),
    CONSTRAINT chk_projects_approved_capacity CHECK (
        approved_capacity_kw IS NULL OR approved_capacity_kw >= 0
    ),
    CONSTRAINT chk_projects_estimated_cost CHECK (
        estimated_cost IS NULL OR estimated_cost >= 0
    ),
    CONSTRAINT chk_projects_final_cost CHECK (
        final_cost IS NULL OR final_cost >= 0
    )
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_projects_updated_at ON projects;
CREATE TRIGGER trg_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE projects IS 'Core lifecycle entity for solar installation projects';
COMMENT ON COLUMN projects.project_number IS 'Human-readable unique project identifier (e.g. PRJ-2026-0001)';
