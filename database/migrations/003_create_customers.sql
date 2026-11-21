-- ==============================================================================
-- Migration: 003_create_customers.sql
-- Description: Create customers table for property owners and client entities
-- Database: PostgreSQL 15+ / Supabase
-- ==============================================================================

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20),
    property_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    property_type VARCHAR(50) DEFAULT 'residential',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_customers_latitude CHECK (
        latitude IS NULL OR (latitude >= -90.0 AND latitude <= 90.0)
    ),
    CONSTRAINT chk_customers_longitude CHECK (
        longitude IS NULL OR (longitude >= -180.0 AND longitude <= 180.0)
    ),
    CONSTRAINT chk_customers_property_type CHECK (
        property_type IN ('residential', 'commercial', 'industrial', 'agricultural', 'institutional', 'other')
    )
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_customers_updated_at ON customers;
CREATE TRIGGER trg_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE customers IS 'Customer and property owner accounts';
COMMENT ON COLUMN customers.property_address IS 'Base property/site location address';
