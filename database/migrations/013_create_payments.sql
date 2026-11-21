-- ==============================================================================
-- Migration: 013_create_payments.sql
-- Description: Create payments table for milestone transactions and customer payments
-- Database: PostgreSQL 15+ / Supabase
-- ==============================================================================

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
    quotation_id UUID REFERENCES quotations(id) ON DELETE SET NULL,
    amount NUMERIC(14, 2) NOT NULL,
    payment_method VARCHAR(40) NOT NULL,
    transaction_reference VARCHAR(150) NOT NULL,
    payment_status VARCHAR(30) NOT NULL DEFAULT 'pending',
    payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_payments_amount CHECK (amount > 0),
    CONSTRAINT chk_payments_status CHECK (
        payment_status IN ('pending', 'completed', 'failed', 'refunded')
    ),
    CONSTRAINT chk_payments_method CHECK (
        payment_method IN (
            'neft',
            'rtgs',
            'upi',
            'cheque',
            'net_banking',
            'cash',
            'bank_transfer',
            'credit_line'
        )
    )
);

COMMENT ON TABLE payments IS 'Customer milestone and partial payment transaction records (PCI-DSS compliant: no card data stored)';
COMMENT ON COLUMN payments.transaction_reference IS 'Bank UTR, UPI reference ID, or cheque clearance number';
