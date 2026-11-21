-- ==============================================================================
-- Migration: 011_create_recommendations.sql
-- Description: Create solar_recommendations table for system sizing and financial models
-- Database: PostgreSQL 15+ / Supabase
-- ==============================================================================

CREATE TABLE IF NOT EXISTS solar_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES property_assessments(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    system_capacity_kw NUMERIC(10, 2) NOT NULL,
    estimated_generation_kwh NUMERIC(12, 2) NOT NULL,
    estimated_monthly_savings NUMERIC(12, 2) NOT NULL,
    estimated_payback_years NUMERIC(8, 2) NOT NULL,
    recommendation_source VARCHAR(30) NOT NULL DEFAULT 'engineering',
    assumptions JSONB DEFAULT '{}'::jsonb,
    warnings JSONB DEFAULT '[]'::jsonb,
    configuration JSONB DEFAULT '{}'::jsonb,
    bom JSONB DEFAULT '[]'::jsonb,
    approval_status VARCHAR(30) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_recommendations_capacity CHECK (system_capacity_kw >= 0),
    CONSTRAINT chk_recommendations_generation CHECK (estimated_generation_kwh >= 0),
    CONSTRAINT chk_recommendations_savings CHECK (estimated_monthly_savings >= 0),
    CONSTRAINT chk_recommendations_payback CHECK (estimated_payback_years >= 0),
    CONSTRAINT chk_recommendations_source CHECK (
        recommendation_source IN ('engineering', 'ai_model', 'hybrid', 'customer_custom')
    ),
    CONSTRAINT chk_recommendations_approval CHECK (
        approval_status IN ('draft', 'accepted', 'rejected', 'superseded')
    )
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_solar_recommendations_updated_at ON solar_recommendations;
CREATE TRIGGER trg_solar_recommendations_updated_at
    BEFORE UPDATE ON solar_recommendations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE solar_recommendations IS 'Calculated solar sizing, estimated generation, financial payback and proposed BOM';
COMMENT ON COLUMN solar_recommendations.recommendation_source IS 'Source attribution: engineering calculations or future AI optimization model';
