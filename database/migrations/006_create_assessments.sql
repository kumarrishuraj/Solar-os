-- ==============================================================================
-- Migration: 006_create_assessments.sql
-- Description: Create property_assessments table for customer rooftop & consumption data
-- Database: PostgreSQL 15+ / Supabase
-- ==============================================================================

CREATE TABLE IF NOT EXISTS property_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    property_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    roof_length NUMERIC(10, 2),
    roof_width NUMERIC(10, 2),
    roof_area NUMERIC(12, 2),
    usable_roof_area NUMERIC(12, 2),
    measurement_unit VARCHAR(20) DEFAULT 'sq_meters',
    roof_type VARCHAR(50),
    roof_orientation VARCHAR(30),
    roof_tilt NUMERIC(6, 2),
    number_of_roof_sections INTEGER DEFAULT 1,
    grid_availability BOOLEAN DEFAULT TRUE,
    monthly_bill NUMERIC(12, 2),
    monthly_consumption_kwh NUMERIC(12, 2),
    connection_phase VARCHAR(30),
    preferred_solar_type VARCHAR(30),
    budget NUMERIC(14, 2),
    assessment_status VARCHAR(40) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_assessment_status CHECK (
        assessment_status IN ('draft', 'submitted', 'ai_analyzed', 'verified', 'superseded')
    ),
    CONSTRAINT chk_assessment_latitude CHECK (
        latitude IS NULL OR (latitude >= -90.0 AND latitude <= 90.0)
    ),
    CONSTRAINT chk_assessment_longitude CHECK (
        longitude IS NULL OR (longitude >= -180.0 AND longitude <= 180.0)
    ),
    CONSTRAINT chk_assessment_roof_length CHECK (
        roof_length IS NULL OR roof_length >= 0
    ),
    CONSTRAINT chk_assessment_roof_width CHECK (
        roof_width IS NULL OR roof_width >= 0
    ),
    CONSTRAINT chk_assessment_roof_area CHECK (
        roof_area IS NULL OR roof_area >= 0
    ),
    CONSTRAINT chk_assessment_usable_roof_area CHECK (
        usable_roof_area IS NULL OR (usable_roof_area >= 0 AND (roof_area IS NULL OR usable_roof_area <= roof_area))
    ),
    CONSTRAINT chk_assessment_roof_tilt CHECK (
        roof_tilt IS NULL OR (roof_tilt >= 0 AND roof_tilt <= 90)
    ),
    CONSTRAINT chk_assessment_sections CHECK (
        number_of_roof_sections IS NULL OR number_of_roof_sections >= 1
    ),
    CONSTRAINT chk_assessment_monthly_bill CHECK (
        monthly_bill IS NULL OR monthly_bill >= 0
    ),
    CONSTRAINT chk_assessment_monthly_kwh CHECK (
        monthly_consumption_kwh IS NULL OR monthly_consumption_kwh >= 0
    ),
    CONSTRAINT chk_assessment_budget CHECK (
        budget IS NULL OR budget >= 0
    ),
    CONSTRAINT chk_assessment_measurement_unit CHECK (
        measurement_unit IN ('sq_meters', 'sq_feet', 'sq_yards')
    ),
    CONSTRAINT chk_assessment_connection_phase CHECK (
        connection_phase IS NULL OR connection_phase IN ('single_phase', 'three_phase')
    ),
    CONSTRAINT chk_assessment_solar_type CHECK (
        preferred_solar_type IS NULL OR preferred_solar_type IN ('on_grid', 'off_grid', 'hybrid')
    )
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_property_assessments_updated_at ON property_assessments;
CREATE TRIGGER trg_property_assessments_updated_at
    BEFORE UPDATE ON property_assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE property_assessments IS 'Customer-provided rooftop dimensions, location, and utility consumption details';
COMMENT ON COLUMN property_assessments.usable_roof_area IS 'Calculated or reported shade-free usable area for solar mounting';
