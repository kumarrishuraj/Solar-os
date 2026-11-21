-- ==============================================================================
-- Migration: 017_create_warranties.sql
-- Description: Create warranties table for equipment and performance guarantee tracking
-- Database: PostgreSQL 15+ / Supabase
-- ==============================================================================

CREATE TABLE IF NOT EXISTS warranties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    warranty_start_date DATE NOT NULL,
    warranty_end_date DATE NOT NULL,
    warranty_status VARCHAR(30) NOT NULL DEFAULT 'active',
    warranty_document_path TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_warranties_status CHECK (
        warranty_status IN ('active', 'expired', 'claimed', 'void')
    ),
    CONSTRAINT chk_warranties_date_order CHECK (
        warranty_end_date >= warranty_start_date
    )
);

COMMENT ON TABLE warranties IS 'Active and historical warranty certificates mapped to serial equipment and customer';
COMMENT ON COLUMN warranties.warranty_document_path IS 'Supabase Storage path for the signed warranty certificate / card';
