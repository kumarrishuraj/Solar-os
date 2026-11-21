-- ==============================================================================
-- Migration: 008_create_ai_analysis_results.sql
-- Description: Create ai_analysis_results table for ML model inference outputs
-- Database: PostgreSQL 15+ / Supabase
-- ==============================================================================

CREATE TABLE IF NOT EXISTS ai_analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES property_assessments(id) ON DELETE CASCADE,
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(100) NOT NULL,
    analysis_status VARCHAR(40) NOT NULL DEFAULT 'completed',
    detected_obstacles JSONB DEFAULT '[]'::jsonb,
    detected_shading_regions JSONB DEFAULT '[]'::jsonb,
    estimated_usable_area NUMERIC(12, 2),
    proposed_panel_layout JSONB DEFAULT '{}'::jsonb,
    confidence NUMERIC(5, 4),
    missing_information JSONB DEFAULT '[]'::jsonb,
    raw_result_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_ai_analysis_status CHECK (
        analysis_status IN ('pending', 'processing', 'completed', 'failed')
    ),
    CONSTRAINT chk_ai_analysis_confidence CHECK (
        confidence IS NULL OR (confidence >= 0.0000 AND confidence <= 1.0000)
    ),
    CONSTRAINT chk_ai_analysis_usable_area CHECK (
        estimated_usable_area IS NULL OR estimated_usable_area >= 0
    )
);

COMMENT ON TABLE ai_analysis_results IS 'Future integration target for CV and rooftop obstacle/segmentation models';
COMMENT ON COLUMN ai_analysis_results.detected_obstacles IS 'JSON array of detected obstacles with bounding box coordinates and classification';
COMMENT ON COLUMN ai_analysis_results.confidence IS 'Normalized model confidence score (0.0000 - 1.0000)';
