-- ==============================================================================
-- Migration: 022_create_security_policies.sql
-- Description: Implement Row Level Security (RLS) and access policies for Supabase
-- Database: PostgreSQL 15+ / Supabase
-- ==============================================================================

-- 1. Enable Row Level Security across all core domain tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE solar_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE installation_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranties ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 2. Helper Security Functions
-- ------------------------------------------------------------------------------

-- Returns current user's role from users table based on auth.uid()
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS VARCHAR AS $$
DECLARE
    user_role VARCHAR;
BEGIN
    -- If running in local non-auth or superuser context, default to admin
    IF auth.uid() IS NULL THEN
        RETURN 'admin';
    END IF;

    SELECT role INTO user_role
    FROM users
    WHERE auth_user_id = auth.uid() AND is_active = TRUE;

    RETURN COALESCE(user_role, 'anonymous');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Checks if the authenticated user is an administrator or executive director
CREATE OR REPLACE FUNCTION is_admin_or_director()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_current_user_role() IN ('admin', 'director');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ------------------------------------------------------------------------------
-- 3. Service Role Bypass Policies (For FastAPI backend using service_role key)
-- ------------------------------------------------------------------------------
-- Supabase automatically bypasses RLS for requests using the `service_role` key.
-- For local or direct connections, grant full access if current_user matches postgres or service_role:

CREATE POLICY "Service role full access on users" ON users
    FOR ALL USING (auth.role() = 'service_role' OR is_admin_or_director());

CREATE POLICY "Service role full access on customers" ON customers
    FOR ALL USING (auth.role() = 'service_role' OR is_admin_or_director());

CREATE POLICY "Service role full access on leads" ON leads
    FOR ALL USING (auth.role() = 'service_role' OR is_admin_or_director());

CREATE POLICY "Service role full access on projects" ON projects
    FOR ALL USING (auth.role() = 'service_role' OR is_admin_or_director());

CREATE POLICY "Service role full access on property_assessments" ON property_assessments
    FOR ALL USING (auth.role() = 'service_role' OR is_admin_or_director());

CREATE POLICY "Service role full access on assessment_images" ON assessment_images
    FOR ALL USING (auth.role() = 'service_role' OR is_admin_or_director());

CREATE POLICY "Service role full access on ai_analysis_results" ON ai_analysis_results
    FOR ALL USING (auth.role() = 'service_role' OR is_admin_or_director());

CREATE POLICY "Service role full access on site_surveys" ON site_surveys
    FOR ALL USING (auth.role() = 'service_role' OR is_admin_or_director());

CREATE POLICY "Service role full access on products" ON products
    FOR ALL USING (auth.role() = 'service_role' OR is_admin_or_director());

CREATE POLICY "Service role full access on solar_recommendations" ON solar_recommendations
    FOR ALL USING (auth.role() = 'service_role' OR is_admin_or_director());

CREATE POLICY "Service role full access on quotations" ON quotations
    FOR ALL USING (auth.role() = 'service_role' OR is_admin_or_director());

CREATE POLICY "Service role full access on quotation_items" ON quotation_items
    FOR ALL USING (auth.role() = 'service_role' OR is_admin_or_director());

CREATE POLICY "Service role full access on payments" ON payments
    FOR ALL USING (auth.role() = 'service_role' OR is_admin_or_director());

CREATE POLICY "Service role full access on inventory" ON inventory
    FOR ALL USING (auth.role() = 'service_role' OR is_admin_or_director());

CREATE POLICY "Service role full access on inventory_movements" ON inventory_movements
    FOR ALL USING (auth.role() = 'service_role' OR is_admin_or_director());

CREATE POLICY "Service role full access on equipment" ON equipment
    FOR ALL USING (auth.role() = 'service_role' OR is_admin_or_director());

CREATE POLICY "Service role full access on installations" ON installations
    FOR ALL USING (auth.role() = 'service_role' OR is_admin_or_director());

CREATE POLICY "Service role full access on installation_checklist" ON installation_checklist
    FOR ALL USING (auth.role() = 'service_role' OR is_admin_or_director());

CREATE POLICY "Service role full access on warranties" ON warranties
    FOR ALL USING (auth.role() = 'service_role' OR is_admin_or_director());

CREATE POLICY "Service role full access on telemetry" ON telemetry
    FOR ALL USING (auth.role() = 'service_role' OR is_admin_or_director());

CREATE POLICY "Service role full access on service_tickets" ON service_tickets
    FOR ALL USING (auth.role() = 'service_role' OR is_admin_or_director());

CREATE POLICY "Service role full access on audit_logs" ON audit_logs
    FOR ALL USING (auth.role() = 'service_role' OR is_admin_or_director());

-- ------------------------------------------------------------------------------
-- 4. Role-Specific Direct Policies (For Supabase Client / GraphQL / PostgREST)
-- ------------------------------------------------------------------------------

-- Products: Viewable by all active authenticated staff and customers
CREATE POLICY "Active products readable by all authenticated" ON products
    FOR SELECT USING (auth.role() = 'authenticated' AND is_active = TRUE);

-- Sales Representatives: Read/write permissions for Leads, Customers, Assessments, Quotations
CREATE POLICY "Sales can manage leads" ON leads
    FOR ALL USING (
        get_current_user_role() = 'sales' OR
        assigned_salesperson_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
    );

CREATE POLICY "Sales can view and edit customers" ON customers
    FOR ALL USING (get_current_user_role() = 'sales');

CREATE POLICY "Sales can manage property assessments" ON property_assessments
    FOR ALL USING (get_current_user_role() = 'sales');

CREATE POLICY "Sales can manage quotations" ON quotations
    FOR ALL USING (get_current_user_role() = 'sales');

CREATE POLICY "Sales can manage quotation items" ON quotation_items
    FOR ALL USING (get_current_user_role() = 'sales');

-- Surveyors: Access assigned surveys, linked assessments, and projects
CREATE POLICY "Surveyors can manage assigned site surveys" ON site_surveys
    FOR ALL USING (
        get_current_user_role() = 'surveyor' AND
        surveyor_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
    );

CREATE POLICY "Surveyors can read assessments" ON property_assessments
    FOR SELECT USING (get_current_user_role() = 'surveyor');

-- Technicians: Access assigned installations and tickets
CREATE POLICY "Technicians manage assigned installations" ON installations
    FOR ALL USING (
        get_current_user_role() = 'technician' AND
        assigned_technician_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
    );

CREATE POLICY "Technicians manage checklist" ON installation_checklist
    FOR ALL USING (get_current_user_role() = 'technician');

CREATE POLICY "Technicians manage assigned service tickets" ON service_tickets
    FOR ALL USING (
        get_current_user_role() = 'technician' AND
        assigned_technician_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
    );

-- Warehouse: Access inventory, equipment, movements
CREATE POLICY "Warehouse staff manage inventory" ON inventory
    FOR ALL USING (get_current_user_role() = 'warehouse');

CREATE POLICY "Warehouse staff manage inventory movements" ON inventory_movements
    FOR ALL USING (get_current_user_role() = 'warehouse');

CREATE POLICY "Warehouse staff manage equipment" ON equipment
    FOR ALL USING (get_current_user_role() = 'warehouse');

-- Finance: Manage payments and quotations
CREATE POLICY "Finance staff manage payments" ON payments
    FOR ALL USING (get_current_user_role() = 'finance');

CREATE POLICY "Finance staff view quotations" ON quotations
    FOR SELECT USING (get_current_user_role() = 'finance');

-- Service Agents: Manage tickets and view equipment/warranties
CREATE POLICY "Service agents manage service tickets" ON service_tickets
    FOR ALL USING (get_current_user_role() = 'service_agent');

CREATE POLICY "Service agents read warranties" ON warranties
    FOR SELECT USING (get_current_user_role() = 'service_agent');

CREATE POLICY "Service agents read telemetry" ON telemetry
    FOR SELECT USING (get_current_user_role() = 'service_agent');
