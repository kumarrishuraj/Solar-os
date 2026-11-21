-- ==============================================================================
-- Migration: 012_create_quotations.sql
-- Description: Create quotations and quotation_items tables for commercial bids
-- Database: PostgreSQL 15+ / Supabase
-- ==============================================================================

CREATE TABLE IF NOT EXISTS quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_number VARCHAR(50) UNIQUE NOT NULL,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    system_capacity_kw NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(14, 2) NOT NULL,
    discount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    gst_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    installation_charges NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(14, 2) NOT NULL,
    quotation_status VARCHAR(30) NOT NULL DEFAULT 'draft',
    valid_until DATE NOT NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_quotations_status CHECK (
        quotation_status IN ('draft', 'sent', 'approved', 'rejected', 'expired')
    ),
    CONSTRAINT chk_quotations_capacity CHECK (system_capacity_kw >= 0),
    CONSTRAINT chk_quotations_subtotal CHECK (subtotal >= 0),
    CONSTRAINT chk_quotations_discount CHECK (discount >= 0 AND discount <= subtotal),
    CONSTRAINT chk_quotations_gst CHECK (gst_amount >= 0),
    CONSTRAINT chk_quotations_installation CHECK (installation_charges >= 0),
    CONSTRAINT chk_quotations_total CHECK (total_amount >= 0)
);

-- Trigger for updated_at on quotations
DROP TRIGGER IF EXISTS trg_quotations_updated_at ON quotations;
CREATE TRIGGER trg_quotations_updated_at
    BEFORE UPDATE ON quotations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Quotation line items
CREATE TABLE IF NOT EXISTS quotation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    description TEXT NOT NULL,
    quantity NUMERIC(12, 2) NOT NULL,
    unit_price NUMERIC(14, 2) NOT NULL,
    total_price NUMERIC(14, 2) NOT NULL,

    -- Constraints
    CONSTRAINT chk_quotation_items_quantity CHECK (quantity > 0),
    CONSTRAINT chk_quotation_items_unit_price CHECK (unit_price >= 0),
    CONSTRAINT chk_quotation_items_total_price CHECK (total_price >= 0)
);

COMMENT ON TABLE quotations IS 'Commercial financial proposals and contracts';
COMMENT ON TABLE quotation_items IS 'Line items and equipment pricing breakdown for a quotation';
