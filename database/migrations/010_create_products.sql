-- ==============================================================================
-- Migration: 010_create_products.sql
-- Description: Create products catalog table for solar equipment and components
-- Database: PostgreSQL 15+ / Supabase
-- ==============================================================================

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(80) UNIQUE NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    category VARCHAR(60) NOT NULL,
    rated_power_w NUMERIC(10, 2),
    voltage NUMERIC(10, 2),
    current NUMERIC(10, 2),
    technical_specifications JSONB DEFAULT '{}'::jsonb,
    purchase_price NUMERIC(14, 2) NOT NULL,
    selling_price NUMERIC(14, 2) NOT NULL,
    warranty_months INTEGER NOT NULL DEFAULT 60,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_products_category CHECK (
        category IN (
            'solar_panel',
            'inverter',
            'battery',
            'charge_controller',
            'mounting_structure',
            'cable',
            'protection_device',
            'accessory'
        )
    ),
    CONSTRAINT chk_products_purchase_price CHECK (purchase_price >= 0),
    CONSTRAINT chk_products_selling_price CHECK (selling_price >= 0),
    CONSTRAINT chk_products_warranty_months CHECK (warranty_months >= 0),
    CONSTRAINT chk_products_rated_power CHECK (rated_power_w IS NULL OR rated_power_w >= 0),
    CONSTRAINT chk_products_voltage CHECK (voltage IS NULL OR voltage >= 0),
    CONSTRAINT chk_products_current CHECK (current IS NULL OR current >= 0)
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE products IS 'Master equipment catalog for PV panels, inverters, batteries, BOS';
COMMENT ON COLUMN products.sku IS 'Stock Keeping Unit unique barcode/item code';
