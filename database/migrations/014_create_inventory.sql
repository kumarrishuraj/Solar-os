-- ==============================================================================
-- Migration: 014_create_inventory.sql
-- Description: Create inventory and inventory_movements tables for warehouse management
-- Database: PostgreSQL 15+ / Supabase
-- ==============================================================================

CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    warehouse_name VARCHAR(150) NOT NULL,
    quantity_on_hand NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    quantity_reserved NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    reorder_level NUMERIC(12, 2) NOT NULL DEFAULT 5.00,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT uq_inventory_product_warehouse UNIQUE (product_id, warehouse_name),
    CONSTRAINT chk_inventory_on_hand CHECK (quantity_on_hand >= 0),
    CONSTRAINT chk_inventory_reserved CHECK (quantity_reserved >= 0),
    CONSTRAINT chk_inventory_reorder CHECK (reorder_level >= 0),
    CONSTRAINT chk_inventory_reserved_limit CHECK (quantity_reserved <= quantity_on_hand)
);

-- Trigger for updated_at on inventory
DROP TRIGGER IF EXISTS trg_inventory_updated_at ON inventory;
CREATE TRIGGER trg_inventory_updated_at
    BEFORE UPDATE ON inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Inventory Movements Audit Table
CREATE TABLE IF NOT EXISTS inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE RESTRICT,
    movement_type VARCHAR(30) NOT NULL,
    quantity NUMERIC(12, 2) NOT NULL,
    reference_type VARCHAR(50),
    reference_id UUID,
    performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_inventory_movements_qty CHECK (quantity > 0),
    CONSTRAINT chk_inventory_movements_type CHECK (
        movement_type IN (
            'purchase',
            'reservation',
            'release',
            'dispatch',
            'return',
            'adjustment'
        )
    )
);

COMMENT ON TABLE inventory IS 'Stock levels per warehouse. available_stock = quantity_on_hand - quantity_reserved';
COMMENT ON TABLE inventory_movements IS 'Audit ledger of all physical and reserved stock transactions';
