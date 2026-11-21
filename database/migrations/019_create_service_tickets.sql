-- ==============================================================================
-- Migration: 019_create_service_tickets.sql
-- Description: Create service_tickets table for post-commissioning maintenance & support
-- Database: PostgreSQL 15+ / Supabase
-- ==============================================================================

CREATE TABLE IF NOT EXISTS service_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    equipment_id UUID REFERENCES equipment(id) ON DELETE SET NULL,
    issue_description TEXT NOT NULL,
    issue_category VARCHAR(50) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    assigned_technician_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ticket_status VARCHAR(40) NOT NULL DEFAULT 'open',
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT chk_service_tickets_category CHECK (
        issue_category IN (
            'inverter_fault',
            'panel_damage',
            'generation_drop',
            'wiring_issue',
            'physical_damage',
            'routine_maintenance',
            'other'
        )
    ),
    CONSTRAINT chk_service_tickets_priority CHECK (
        priority IN ('low', 'medium', 'high', 'critical')
    ),
    CONSTRAINT chk_service_tickets_status CHECK (
        ticket_status IN ('open', 'assigned', 'in_progress', 'pending_parts', 'resolved', 'closed')
    ),
    CONSTRAINT chk_service_tickets_resolution CHECK (
        resolved_at IS NULL OR resolved_at >= created_at
    )
);

COMMENT ON TABLE service_tickets IS 'Customer issues, automated IoT fault alarms, and on-site maintenance service tickets';
COMMENT ON COLUMN service_tickets.ticket_number IS 'Human-readable ticket code (e.g. TKT-2026-0001)';
