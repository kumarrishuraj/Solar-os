-- ==============================================================================
-- Migration: 004_create_leads.sql
-- Description: Create leads table for customer solar enquiries and intake pipeline
-- Database: PostgreSQL 15+ / Supabase
-- ==============================================================================

CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    source VARCHAR(50) DEFAULT 'website',
    monthly_electricity_bill NUMERIC(12, 2),
    monthly_consumption_kwh NUMERIC(12, 2),
    estimated_system_capacity_kw NUMERIC(10, 2),
    status VARCHAR(40) NOT NULL DEFAULT 'new',
    assigned_salesperson_id UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_leads_status CHECK (
        status IN (
            'new',
            'contacted',
            'qualified',
            'survey_scheduled',
            'quotation_sent',
            'converted',
            'lost'
        )
    ),
    CONSTRAINT chk_leads_monthly_bill CHECK (
        monthly_electricity_bill IS NULL OR monthly_electricity_bill >= 0
    ),
    CONSTRAINT chk_leads_consumption CHECK (
        monthly_consumption_kwh IS NULL OR monthly_consumption_kwh >= 0
    ),
    CONSTRAINT chk_leads_capacity CHECK (
        estimated_system_capacity_kw IS NULL OR estimated_system_capacity_kw >= 0
    )
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_leads_updated_at ON leads;
CREATE TRIGGER trg_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE leads IS 'Customer inquiries and commercial opportunities';
COMMENT ON COLUMN leads.lead_number IS 'Human-readable unique lead identifier (e.g. LEAD-2026-0001)';
