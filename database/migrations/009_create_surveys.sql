-- ==============================================================================
-- Migration: 009_create_surveys.sql
-- Description: Create site_surveys table for on-site physical engineering audits
-- Database: PostgreSQL 15+ / Supabase
-- ==============================================================================

CREATE TABLE IF NOT EXISTS site_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
    assessment_id UUID REFERENCES property_assessments(id) ON DELETE SET NULL,
    surveyor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    scheduled_date TIMESTAMPTZ NOT NULL,
    actual_survey_date TIMESTAMPTZ,
    verified_roof_area NUMERIC(12, 2),
    verified_roof_orientation VARCHAR(30),
    verified_roof_tilt NUMERIC(6, 2),
    structural_observations TEXT,
    shading_observations TEXT,
    cable_distance NUMERIC(10, 2),
    electrical_observations TEXT,
    safety_observations TEXT,
    approval_status VARCHAR(30) NOT NULL DEFAULT 'pending',
    rejection_reason TEXT,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_site_surveys_approval_status CHECK (
        approval_status IN ('pending', 'approved', 'rejected', 'revision_required')
    ),
    CONSTRAINT chk_site_surveys_verified_area CHECK (
        verified_roof_area IS NULL OR verified_roof_area >= 0
    ),
    CONSTRAINT chk_site_surveys_verified_tilt CHECK (
        verified_roof_tilt IS NULL OR (verified_roof_tilt >= 0 AND verified_roof_tilt <= 90)
    ),
    CONSTRAINT chk_site_surveys_cable_distance CHECK (
        cable_distance IS NULL OR cable_distance >= 0
    )
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_site_surveys_updated_at ON site_surveys;
CREATE TRIGGER trg_site_surveys_updated_at
    BEFORE UPDATE ON site_surveys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE site_surveys IS 'On-site technical physical audit by field surveyors';
COMMENT ON COLUMN site_surveys.cable_distance IS 'Estimated DC cable run distance from roof array to inverter in meters';
