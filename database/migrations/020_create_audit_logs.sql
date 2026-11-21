-- ==============================================================================
-- Migration: 020_create_audit_logs.sql
-- Description: Create audit_logs table for tracking critical business transactions & changes
-- Database: PostgreSQL 15+ / Supabase
-- ==============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE audit_logs IS 'Append-only immutable operational audit trail for compliance and tracking';
COMMENT ON COLUMN audit_logs.action IS 'Action performed (e.g. quotation_approved, inventory_dispatched, status_changed)';
