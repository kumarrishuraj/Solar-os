-- ==============================================================================
-- SolarOS Database Teardown & Reset Script
-- Platform: Supabase / PostgreSQL 15+
-- Purpose: Safely teardown all SolarOS tables, policies, triggers, and types in reverse dependency order
-- WARNING: This will permanently delete all data in the SolarOS schema!
-- ==============================================================================

BEGIN;

-- 1. Drop Tables in Reverse Dependency Order
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS service_tickets CASCADE;
DROP TABLE IF EXISTS telemetry CASCADE;
DROP TABLE IF EXISTS warranties CASCADE;
DROP TABLE IF EXISTS installation_checklist CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS installations CASCADE;
DROP TABLE IF EXISTS inventory_movements CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS quotation_items CASCADE;
DROP TABLE IF EXISTS quotations CASCADE;
DROP TABLE IF EXISTS solar_recommendations CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS site_surveys CASCADE;
DROP TABLE IF EXISTS ai_analysis_results CASCADE;
DROP TABLE IF EXISTS assessment_images CASCADE;
DROP TABLE IF EXISTS property_assessments CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. Drop Helper Functions
DROP FUNCTION IF EXISTS is_admin_or_director() CASCADE;
DROP FUNCTION IF EXISTS get_current_user_role() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

COMMIT;

-- Informational message
SELECT 'SolarOS database schema has been successfully reset.' AS status;
