-- ==============================================================================
-- SolarOS Database Schema & Seed Verification Test Script
-- Platform: Supabase / PostgreSQL 15+
-- Purpose: Validates that all 22 tables, indexes, constraints, and seed records
--          are correctly configured and operational.
-- ==============================================================================

BEGIN;

-- 1. Verify Extension Availability
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM pg_extension WHERE extname IN ('uuid-ossp', 'pgcrypto')) >= 1,
        'Required UUID / Crypto extensions are missing!';
    RAISE NOTICE 'SUCCESS: Required PostgreSQL extensions verified.';
END $$;

-- 2. Verify All 22 Tables Exist in Public Schema
DO $$
DECLARE
    expected_tables TEXT[] := ARRAY[
        'users',
        'customers',
        'leads',
        'projects',
        'property_assessments',
        'assessment_images',
        'ai_analysis_results',
        'site_surveys',
        'products',
        'solar_recommendations',
        'quotations',
        'quotation_items',
        'payments',
        'inventory',
        'inventory_movements',
        'equipment',
        'installations',
        'installation_checklist',
        'warranties',
        'telemetry',
        'service_tickets',
        'audit_logs'
    ];
    tbl TEXT;
    table_count INT;
BEGIN
    FOREACH tbl IN ARRAY expected_tables LOOP
        SELECT COUNT(*) INTO table_count
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = tbl;

        IF table_count = 0 THEN
            RAISE EXCEPTION 'Table % does not exist in public schema!', tbl;
        END IF;
    END LOOP;

    RAISE NOTICE 'SUCCESS: All 22 SolarOS core tables are present.';
END $$;

-- 3. Verify Row Level Security is Enabled on All 22 Tables
DO $$
DECLARE
    unprotected_count INT;
BEGIN
    SELECT COUNT(*) INTO unprotected_count
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename IN (
        'users', 'customers', 'leads', 'projects', 'property_assessments',
        'assessment_images', 'ai_analysis_results', 'site_surveys', 'products',
        'solar_recommendations', 'quotations', 'quotation_items', 'payments',
        'inventory', 'inventory_movements', 'equipment', 'installations',
        'installation_checklist', 'warranties', 'telemetry', 'service_tickets',
        'audit_logs'
      )
      AND rowsecurity = FALSE;

    IF unprotected_count > 0 THEN
        RAISE EXCEPTION 'Found % tables with Row Level Security disabled!', unprotected_count;
    END IF;

    RAISE NOTICE 'SUCCESS: Row Level Security is enabled on all 22 tables.';
END $$;

-- 4. Verify Core Foreign Keys Exist
DO $$
DECLARE
    fk_count INT;
BEGIN
    SELECT COUNT(*) INTO fk_count
    FROM information_schema.table_constraints
    WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public';

    IF fk_count < 30 THEN
        RAISE EXCEPTION 'Expected at least 30 foreign key relationships, found %', fk_count;
    END IF;

    RAISE NOTICE 'SUCCESS: Foreign key constraints verified (found % constraints).', fk_count;
END $$;

-- 5. Verify Check Constraints Integrity
DO $$
BEGIN
    -- Test negative budget rejection on property_assessments
    BEGIN
        INSERT INTO property_assessments (
            customer_id, property_address, city, state, postal_code, budget
        ) VALUES (
            '00000000-0000-0000-0002-000000000001',
            'Test Address', 'City', 'State', '141001', -500.00
        );
        RAISE EXCEPTION 'Check constraint failed: Negative budget was accepted!';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'SUCCESS: Check constraint correctly rejected negative budget.';
    END;

    -- Test invalid latitude rejection on customers
    BEGIN
        INSERT INTO customers (
            full_name, phone, property_address, city, state, postal_code, latitude
        ) VALUES (
            'Invalid Lat User', '+91-99999-00000', 'Address', 'City', 'State', '141001', 95.00
        );
        RAISE EXCEPTION 'Check constraint failed: Latitude > 90 was accepted!';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'SUCCESS: Check constraint correctly rejected invalid latitude.';
    END;

    -- Test inventory reservation limit: quantity_reserved cannot exceed quantity_on_hand
    BEGIN
        INSERT INTO inventory (
            product_id, warehouse_name, quantity_on_hand, quantity_reserved
        ) VALUES (
            '00000000-0000-0000-0003-000000000001',
            'Over-reservation Test Warehouse', 10.00, 25.00
        );
        RAISE EXCEPTION 'Check constraint failed: Reserved stock exceeding on-hand was accepted!';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'SUCCESS: Check constraint correctly rejected over-reservation.';
    END;
END $$;

-- 6. Verify Seed Fixture Population Counts
DO $$
DECLARE
    users_n INT;
    customers_n INT;
    products_n INT;
    projects_n INT;
BEGIN
    SELECT COUNT(*) INTO users_n FROM users;
    SELECT COUNT(*) INTO customers_n FROM customers;
    SELECT COUNT(*) INTO products_n FROM products;
    SELECT COUNT(*) INTO projects_n FROM projects;

    IF users_n < 10 THEN
        RAISE EXCEPTION 'Seed verification failed: users count (%) is less than expected', users_n;
    END IF;
    IF customers_n < 5 THEN
        RAISE EXCEPTION 'Seed verification failed: customers count (%) is less than expected', customers_n;
    END IF;
    IF products_n < 8 THEN
        RAISE EXCEPTION 'Seed verification failed: products count (%) is less than expected', products_n;
    END IF;
    IF projects_n < 3 THEN
        RAISE EXCEPTION 'Seed verification failed: projects count (%) is less than expected', projects_n;
    END IF;

    RAISE NOTICE 'SUCCESS: Seed data verified (% users, % customers, % products, % projects).',
        users_n, customers_n, products_n, projects_n;
END $$;

-- 7. Verification Summary Display
SELECT
    'SolarOS Schema & Seed Validation Passed Successfully' AS validation_result,
    NOW() AS verified_at;

ROLLBACK; -- Rollback test transactions to keep database clean
