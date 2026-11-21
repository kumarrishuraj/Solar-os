-- ==============================================================================
-- Migration: 007_create_assessment_images.sql
-- Description: Create assessment_images table for storing metadata and Supabase Storage paths
-- Database: PostgreSQL 15+ / Supabase
-- ==============================================================================

CREATE TABLE IF NOT EXISTS assessment_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES property_assessments(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    image_type VARCHAR(50) NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_assessment_images_file_size CHECK (file_size_bytes > 0),
    CONSTRAINT chk_assessment_images_type CHECK (
        image_type IN (
            'rooftop_full_view',
            'rooftop_angle',
            'obstacles',
            'shaded_area',
            'electricity_bill',
            'switchboard_meter',
            'other'
        )
    )
);

COMMENT ON TABLE assessment_images IS 'Metadata and object paths referencing rooftop and bill images in Supabase Storage';
COMMENT ON COLUMN assessment_images.file_path IS 'Storage bucket relative path (e.g. rooftop-images/uuid/filename.jpg)';
