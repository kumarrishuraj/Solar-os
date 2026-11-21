-- ==============================================================================
-- Migration: 002_create_users.sql
-- Description: Create users table for internal operators, staff, and technicians
-- Database: PostgreSQL 15+ / Supabase
-- ==============================================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE, -- Maps to Supabase auth.users(id)
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(30) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_users_role CHECK (
        role IN (
            'admin',
            'director',
            'sales',
            'surveyor',
            'engineer',
            'finance',
            'warehouse',
            'technician',
            'service_agent'
        )
    ),
    CONSTRAINT chk_users_email_format CHECK (
        email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    )
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE users IS 'Internal staff, engineers, sales reps, technicians, and administrators';
COMMENT ON COLUMN users.auth_user_id IS 'Foreign UUID link to Supabase auth.users table';
COMMENT ON COLUMN users.role IS 'Role-based access control tier';
