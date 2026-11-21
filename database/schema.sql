-- ==============================================================================
-- Migration: 001_create_extensions.sql
-- Description: Enable essential PostgreSQL extensions for SolarOS
-- Database: PostgreSQL 15+ / Supabase
-- ==============================================================================

-- Enable UUID extension for generating v4 UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for cryptographic hashing functions (if needed)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable pgvector for future AI RAG / document embeddings
CREATE EXTENSION IF NOT EXISTS "vector";

-- Helper trigger function to automatically update `updated_at` timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
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
-- ==============================================================================
-- Migration: 003_create_customers.sql
-- Description: Create customers table for property owners and client entities
-- Database: PostgreSQL 15+ / Supabase
-- ==============================================================================

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20),
    property_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    property_type VARCHAR(50) DEFAULT 'residential',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_customers_latitude CHECK (
        latitude IS NULL OR (latitude >= -90.0 AND latitude <= 90.0)
    ),
    CONSTRAINT chk_customers_longitude CHECK (
        longitude IS NULL OR (longitude >= -180.0 AND longitude <= 180.0)
    ),
    CONSTRAINT chk_customers_property_type CHECK (
        property_type IN ('residential', 'commercial', 'industrial', 'agricultural', 'institutional', 'other')
    )
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_customers_updated_at ON customers;
CREATE TRIGGER trg_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE customers IS 'Customer and property owner accounts';
COMMENT ON COLUMN customers.property_address IS 'Base property/site location address';
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
-- ==============================================================================
-- Migration: 005_create_projects.sql
-- Description: Create projects table tracking full solar project lifecycle
-- Database: PostgreSQL 15+ / Supabase
-- ==============================================================================

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    project_name VARCHAR(200) NOT NULL,
    proposed_capacity_kw NUMERIC(10, 2),
    approved_capacity_kw NUMERIC(10, 2),
    project_status VARCHAR(50) NOT NULL DEFAULT 'enquiry',
    estimated_cost NUMERIC(14, 2),
    final_cost NUMERIC(14, 2),
    expected_completion_date DATE,
    actual_completion_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_projects_status CHECK (
        project_status IN (
            'enquiry',
            'assessment',
            'survey_pending',
            'survey_approved',
            'design_approved',
            'quotation_pending',
            'quotation_approved',
            'payment_pending',
            'ready_for_dispatch',
            'installation_scheduled',
            'installation_in_progress',
            'completed',
            'cancelled'
        )
    ),
    CONSTRAINT chk_projects_proposed_capacity CHECK (
        proposed_capacity_kw IS NULL OR proposed_capacity_kw >= 0
    ),
    CONSTRAINT chk_projects_approved_capacity CHECK (
        approved_capacity_kw IS NULL OR approved_capacity_kw >= 0
    ),
    CONSTRAINT chk_projects_estimated_cost CHECK (
        estimated_cost IS NULL OR estimated_cost >= 0
    ),
    CONSTRAINT chk_projects_final_cost CHECK (
        final_cost IS NULL OR final_cost >= 0
    )
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_projects_updated_at ON projects;
CREATE TRIGGER trg_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE projects IS 'Core lifecycle entity for solar installation projects';
COMMENT ON COLUMN projects.project_number IS 'Human-readable unique project identifier (e.g. PRJ-2026-0001)';
-- ==============================================================================
-- Migration: 006_create_assessments.sql
-- Description: Create property_assessments table for customer rooftop & consumption data
-- Database: PostgreSQL 15+ / Supabase
-- ==============================================================================

CREATE TABLE IF NOT EXISTS property_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    property_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    roof_length NUMERIC(10, 2),
    roof_width NUMERIC(10, 2),
    roof_area NUMERIC(12, 2),
    usable_roof_area NUMERIC(12, 2),
    measurement_unit VARCHAR(20) DEFAULT 'sq_meters',
    roof_type VARCHAR(50),
    roof_orientation VARCHAR(30),
    roof_tilt NUMERIC(6, 2),
    number_of_roof_sections INTEGER DEFAULT 1,
    grid_availability BOOLEAN DEFAULT TRUE,
    monthly_bill NUMERIC(12, 2),
    monthly_consumption_kwh NUMERIC(12, 2),
    connection_phase VARCHAR(30),
    preferred_solar_type VARCHAR(30),
    budget NUMERIC(14, 2),
    assessment_status VARCHAR(40) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_assessment_status CHECK (
        assessment_status IN ('draft', 'submitted', 'ai_analyzed', 'verified', 'superseded')
    ),
    CONSTRAINT chk_assessment_latitude CHECK (
        latitude IS NULL OR (latitude >= -90.0 AND latitude <= 90.0)
    ),
    CONSTRAINT chk_assessment_longitude CHECK (
        longitude IS NULL OR (longitude >= -180.0 AND longitude <= 180.0)
    ),
    CONSTRAINT chk_assessment_roof_length CHECK (
        roof_length IS NULL OR roof_length >= 0
    ),
    CONSTRAINT chk_assessment_roof_width CHECK (
        roof_width IS NULL OR roof_width >= 0
    ),
    CONSTRAINT chk_assessment_roof_area CHECK (
        roof_area IS NULL OR roof_area >= 0
    ),
    CONSTRAINT chk_assessment_usable_roof_area CHECK (
        usable_roof_area IS NULL OR (usable_roof_area >= 0 AND (roof_area IS NULL OR usable_roof_area <= roof_area))
    ),
    CONSTRAINT chk_assessment_roof_tilt CHECK (
        roof_tilt IS NULL OR (roof_tilt >= 0 AND roof_tilt <= 90)
    ),
    CONSTRAINT chk_assessment_sections CHECK (
        number_of_roof_sections IS NULL OR number_of_roof_sections >= 1
    ),
    CONSTRAINT chk_assessment_monthly_bill CHECK (
        monthly_bill IS NULL OR monthly_bill >= 0
    ),
    CONSTRAINT chk_assessment_monthly_kwh CHECK (
        monthly_consumption_kwh IS NULL OR monthly_consumption_kwh >= 0
    ),
    CONSTRAINT chk_assessment_budget CHECK (
        budget IS NULL OR budget >= 0
    ),
    CONSTRAINT chk_assessment_measurement_unit CHECK (
        measurement_unit IN ('sq_meters', 'sq_feet', 'sq_yards')
    ),
    CONSTRAINT chk_assessment_connection_phase CHECK (
        connection_phase IS NULL OR connection_phase IN ('single_phase', 'three_phase')
    ),
    CONSTRAINT chk_assessment_solar_type CHECK (
        preferred_solar_type IS NULL OR preferred_solar_type IN ('on_grid', 'off_grid', 'hybrid')
    )
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_property_assessments_updated_at ON property_assessments;
CREATE TRIGGER trg_property_assessments_updated_at
    BEFORE UPDATE ON property_assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE property_assessments IS 'Customer-provided rooftop dimensions, location, and utility consumption details';
COMMENT ON COLUMN property_assessments.usable_roof_area IS 'Calculated or reported shade-free usable area for solar mounting';
-- ==============================================================================
-- Migration: 007_create_assessment_images.sql
-- Description: Create assessment_images table for storing metadata and Supabase Storage paths
-- Database: PostgreSQL 15+ / Supabase
-- ==============================================================================

CREATE TABLE IF NOT EXISTS assessment_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES property_assessments(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    image_type VARCHAR(50) NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_assessment_images_file_size CHECK (file_size_bytes > 0),
    CONSTRAINT chk_assessment_images_type CHECK (
        image_type IN (
            'rooftop_full_view',
            'rooftop_angle',
            'obstacles',
            'shaded_area',
            'electricity_bill',
            'switchboard_meter',
            'other'
        )
    )
);

COMMENT ON TABLE assessment_images IS 'Metadata and object paths referencing rooftop and bill images in Supabase Storage';
COMMENT ON COLUMN assessment_images.file_path IS 'Storage bucket relative path (e.g. rooftop-images/uuid/filename.jpg)';
-- ==============================================================================
-- Migration: 008_create_ai_analysis_results.sql
-- Description: Create ai_analysis_results table for ML model inference outputs
-- Database: PostgreSQL 15+ / Supabase
-- ==============================================================================

CREATE TABLE IF NOT EXISTS ai_analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES property_assessments(id) ON DELETE CASCADE,
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(100) NOT NULL,
    analysis_status VARCHAR(40) NOT NULL DEFAULT 'completed',
    detected_obstacles JSONB DEFAULT '[]'::jsonb,
    detected_shading_regions JSONB DEFAULT '[]'::jsonb,
    estimated_usable_area NUMERIC(12, 2),
    proposed_panel_layout JSONB DEFAULT '{}'::jsonb,
    confidence NUMERIC(5, 4),
    missing_information JSONB DEFAULT '[]'::jsonb,
    raw_result_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_ai_analysis_status CHECK (
        analysis_status IN ('pending', 'processing', 'completed', 'failed')
    ),
    CONSTRAINT chk_ai_analysis_confidence CHECK (
        confidence IS NULL OR (confidence >= 0.0000 AND confidence <= 1.0000)
    ),
    CONSTRAINT chk_ai_analysis_usable_area CHECK (
        estimated_usable_area IS NULL OR estimated_usable_area >= 0
    )
);

COMMENT ON TABLE ai_analysis_results IS 'Future integration target for CV and rooftop obstacle/segmentation models';
COMMENT ON COLUMN ai_analysis_results.detected_obstacles IS 'JSON array of detected obstacles with bounding box coordinates and classification';
COMMENT ON COLUMN ai_analysis_results.confidence IS 'Normalized model confidence score (0.0000 - 1.0000)';
-- ==============================================================================
-- Migration: 009_create_surveys.sql
-- Description: Create site_surveys table for on-site physical engineering audits
-- Database: PostgreSQL 15+ / Supabase
-- ==============================================================================

CREATE TABLE IF NOT EXISTS site_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
    assessment_id UUID REFERENCES property_assessments(id) ON DELETE SET NULL,
    surveyor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    scheduled_date TIMESTAMPTZ NOT NULL,
    actual_survey_date TIMESTAMPTZ,
    verified_roof_area NUMERIC(12, 2),
    verified_roof_orientation VARCHAR(30),
    verified_roof_tilt NUMERIC(6, 2),
    structural_observations TEXT,
    shading_observations TEXT,
    cable_distance NUMERIC(10, 2),
    electrical_observations TEXT,
    safety_observations TEXT,
    approval_status VARCHAR(30) NOT NULL DEFAULT 'pending',
    rejection_reason TEXT,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_site_surveys_approval_status CHECK (
        approval_status IN ('pending', 'approved', 'rejected', 'revision_required')
    ),
    CONSTRAINT chk_site_surveys_verified_area CHECK (
        verified_roof_area IS NULL OR verified_roof_area >= 0
    ),
    CONSTRAINT chk_site_surveys_verified_tilt CHECK (
        verified_roof_tilt IS NULL OR (verified_roof_tilt >= 0 AND verified_roof_tilt <= 90)
    ),
    CONSTRAINT chk_site_surveys_cable_distance CHECK (
        cable_distance IS NULL OR cable_distance >= 0
    )
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_site_surveys_updated_at ON site_surveys;
CREATE TRIGGER trg_site_surveys_updated_at
    BEFORE UPDATE ON site_surveys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE site_surveys IS 'On-site technical physical audit by field surveyors';
COMMENT ON COLUMN site_surveys.cable_distance IS 'Estimated DC cable run distance from roof array to inverter in meters';
-- ==============================================================================
-- Migration: 010_create_products.sql
-- Description: Create products catalog table for solar equipment and components
-- Database: PostgreSQL 15+ / Supabase
-- ==============================================================================

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(80) UNIQUE NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    category VARCHAR(60) NOT NULL,
    rated_power_w NUMERIC(10, 2),
    voltage NUMERIC(10, 2),
    current NUMERIC(10, 2),
    technical_specifications JSONB DEFAULT '{}'::jsonb,
    purchase_price NUMERIC(14, 2) NOT NULL,
    selling_price NUMERIC(14, 2) NOT NULL,
    warranty_months INTEGER NOT NULL DEFAULT 60,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_products_category CHECK (
        category IN (
            'solar_panel',
            'inverter',
            'battery',
            'charge_controller',
            'mounting_structure',
            'cable',
            'protection_device',
            'accessory'
        )
    ),
    CONSTRAINT chk_products_purchase_price CHECK (purchase_price >= 0),
    CONSTRAINT chk_products_selling_price CHECK (selling_price >= 0),
    CONSTRAINT chk_products_warranty_months CHECK (warranty_months >= 0),
    CONSTRAINT chk_products_rated_power CHECK (rated_power_w IS NULL OR rated_power_w >= 0),
    CONSTRAINT chk_products_voltage CHECK (voltage IS NULL OR voltage >= 0),
    CONSTRAINT chk_products_current CHECK (current IS NULL OR current >= 0)
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE products IS 'Master equipment catalog for PV panels, inverters, batteries, BOS';
COMMENT ON COLUMN products.sku IS 'Stock Keeping Unit unique barcode/item code';
-- ==============================================================================
-- Migration: 011_create_recommendations.sql
-- Description: Create solar_recommendations table for system sizing and financial models
-- Database: PostgreSQL 15+ / Supabase
-- ==============================================================================

CREATE TABLE IF NOT EXISTS solar_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES property_assessments(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    system_capacity_kw NUMERIC(10, 2) NOT NULL,
    estimated_generation_kwh NUMERIC(12, 2) NOT NULL,
    estimated_monthly_savings NUMERIC(12, 2) NOT NULL,
    estimated_payback_years NUMERIC(8, 2) NOT NULL,
    recommendation_source VARCHAR(30) NOT NULL DEFAULT 'engineering',
    assumptions JSONB DEFAULT '{}'::jsonb,
    warnings JSONB DEFAULT '[]'::jsonb,
    configuration JSONB DEFAULT '{}'::jsonb,
    bom JSONB DEFAULT '[]'::jsonb,
    approval_status VARCHAR(30) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_recommendations_capacity CHECK (system_capacity_kw >= 0),
    CONSTRAINT chk_recommendations_generation CHECK (estimated_generation_kwh >= 0),
    CONSTRAINT chk_recommendations_savings CHECK (estimated_monthly_savings >= 0),
    CONSTRAINT chk_recommendations_payback CHECK (estimated_payback_years >= 0),
    CONSTRAINT chk_recommendations_source CHECK (
        recommendation_source IN ('engineering', 'ai_model', 'hybrid', 'customer_custom')
    ),
    CONSTRAINT chk_recommendations_approval CHECK (
        approval_status IN ('draft', 'accepted', 'rejected', 'superseded')
    )
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_solar_recommendations_updated_at ON solar_recommendations;
CREATE TRIGGER trg_solar_recommendations_updated_at
    BEFORE UPDATE ON solar_recommendations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE solar_recommendations IS 'Calculated solar sizing, estimated generation, financial payback and proposed BOM';
COMMENT ON COLUMN solar_recommendations.recommendation_source IS 'Source attribution: engineering calculations or future AI optimization model';
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
-- ==============================================================================
-- Migration: 015_create_equipment.sql
-- Description: Create equipment table for serialized hardware unit tracking
-- Database: PostgreSQL 15+ / Supabase
-- ==============================================================================

CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    serial_number VARCHAR(150) UNIQUE NOT NULL,
    supplier VARCHAR(150) NOT NULL,
    purchase_date DATE NOT NULL,
    warranty_start_date DATE,
    warranty_end_date DATE,
    equipment_status VARCHAR(40) NOT NULL DEFAULT 'in_stock',
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    installation_id UUID, -- Foreign key constraint will be added in migration 016 after installations table is created
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_equipment_status CHECK (
        equipment_status IN (
            'in_stock',
            'reserved',
            'dispatched',
            'installed',
            'under_service',
            'decommissioned'
        )
    ),
    CONSTRAINT chk_equipment_warranty_dates CHECK (
        warranty_end_date IS NULL OR warranty_start_date IS NULL OR warranty_end_date >= warranty_start_date
    )
);

-- Trigger for updated_at on equipment
DROP TRIGGER IF EXISTS trg_equipment_updated_at ON equipment;
CREATE TRIGGER trg_equipment_updated_at
    BEFORE UPDATE ON equipment
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE equipment IS 'Individual serialized hardware units (e.g. inverter serial, panel batch/serial)';
COMMENT ON COLUMN equipment.serial_number IS 'Manufacturer unique serial number';
-- ==============================================================================
-- Migration: 016_create_installations.sql
-- Description: Create installations, checklist tables, and resolve equipment FK
-- Database: PostgreSQL 15+ / Supabase
-- ==============================================================================

CREATE TABLE IF NOT EXISTS installations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
    installation_number VARCHAR(50) UNIQUE NOT NULL,
    assigned_technician_id UUID REFERENCES users(id) ON DELETE SET NULL,
    scheduled_date TIMESTAMPTZ NOT NULL,
    start_time TIMESTAMPTZ,
    completion_time TIMESTAMPTZ,
    installation_status VARCHAR(40) NOT NULL DEFAULT 'scheduled',
    progress_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    system_capacity_kw NUMERIC(10, 2) NOT NULL,
    testing_results JSONB DEFAULT '{}'::jsonb,
    customer_confirmation BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_installations_status CHECK (
        installation_status IN (
            'scheduled',
            'in_progress',
            'testing',
            'completed',
            'on_hold',
            'cancelled'
        )
    ),
    CONSTRAINT chk_installations_progress CHECK (
        progress_percentage >= 0.00 AND progress_percentage <= 100.00
    ),
    CONSTRAINT chk_installations_capacity CHECK (system_capacity_kw >= 0),
    CONSTRAINT chk_installations_times CHECK (
        completion_time IS NULL OR start_time IS NULL OR completion_time >= start_time
    )
);

-- Trigger for updated_at on installations
DROP TRIGGER IF EXISTS trg_installations_updated_at ON installations;
CREATE TRIGGER trg_installations_updated_at
    BEFORE UPDATE ON installations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Installation Verification Checklist
CREATE TABLE IF NOT EXISTS installation_checklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    installation_id UUID NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
    task_name VARCHAR(200) NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    completed_at TIMESTAMPTZ,
    remarks TEXT
);

-- Safely resolve circular relation between equipment and installations
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_equipment_installation'
    ) THEN
        ALTER TABLE equipment
            ADD CONSTRAINT fk_equipment_installation
            FOREIGN KEY (installation_id)
            REFERENCES installations(id)
            ON DELETE SET NULL;
    END IF;
END $$;

COMMENT ON TABLE installations IS 'Field physical installation operations, milestones, and testing';
COMMENT ON TABLE installation_checklist IS 'Standard operating procedure (SOP) sign-off tasks per installation';
-- ==============================================================================
-- Migration: 017_create_warranties.sql
-- Description: Create warranties table for equipment and performance guarantee tracking
-- Database: PostgreSQL 15+ / Supabase
-- ==============================================================================

CREATE TABLE IF NOT EXISTS warranties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    warranty_start_date DATE NOT NULL,
    warranty_end_date DATE NOT NULL,
    warranty_status VARCHAR(30) NOT NULL DEFAULT 'active',
    warranty_document_path TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_warranties_status CHECK (
        warranty_status IN ('active', 'expired', 'claimed', 'void')
    ),
    CONSTRAINT chk_warranties_date_order CHECK (
        warranty_end_date >= warranty_start_date
    )
);

COMMENT ON TABLE warranties IS 'Active and historical warranty certificates mapped to serial equipment and customer';
COMMENT ON COLUMN warranties.warranty_document_path IS 'Supabase Storage path for the signed warranty certificate / card';
-- ==============================================================================
-- Migration: 018_create_telemetry.sql
-- Description: Create telemetry table for IoT inverter time-series readings and health monitoring
-- Database: PostgreSQL 15+ / Supabase
-- ==============================================================================

CREATE TABLE IF NOT EXISTS telemetry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    voltage NUMERIC(12, 3),
    current NUMERIC(12, 3),
    power NUMERIC(12, 3),
    temperature NUMERIC(8, 2),
    energy_generated_kwh NUMERIC(12, 3),
    source VARCHAR(50) DEFAULT 'iot_gateway',

    -- Constraints
    CONSTRAINT chk_telemetry_voltage CHECK (voltage IS NULL OR voltage >= 0),
    CONSTRAINT chk_telemetry_current CHECK (current IS NULL OR current >= 0),
    CONSTRAINT chk_telemetry_power CHECK (power IS NULL OR power >= 0),
    CONSTRAINT chk_telemetry_energy CHECK (energy_generated_kwh IS NULL OR energy_generated_kwh >= 0)
);

COMMENT ON TABLE telemetry IS 'Time-series sensor telemetry data from solar inverters and energy meters';
COMMENT ON COLUMN telemetry.power IS 'Active power output in Watts (W)';
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
-- ==============================================================================
-- Migration: 021_create_indexes.sql
-- Description: Create targeted indexes for high-traffic query performance
-- Database: PostgreSQL 15+ / Supabase
-- ==============================================================================

-- 1. Users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);

-- 2. Customers
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_city_state ON customers(city, state);

-- 3. Leads
CREATE INDEX IF NOT EXISTS idx_leads_lead_number ON leads(lead_number);
CREATE INDEX IF NOT EXISTS idx_leads_customer_id ON leads(customer_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_salesperson ON leads(assigned_salesperson_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- 4. Projects
CREATE INDEX IF NOT EXISTS idx_projects_project_number ON projects(project_number);
CREATE INDEX IF NOT EXISTS idx_projects_customer_id ON projects(customer_id);
CREATE INDEX IF NOT EXISTS idx_projects_lead_id ON projects(lead_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(project_status);

-- 5. Property Assessments
CREATE INDEX IF NOT EXISTS idx_assessments_customer ON property_assessments(customer_id);
CREATE INDEX IF NOT EXISTS idx_assessments_lead ON property_assessments(lead_id);
CREATE INDEX IF NOT EXISTS idx_assessments_project ON property_assessments(project_id);
CREATE INDEX IF NOT EXISTS idx_assessments_location ON property_assessments(city, state, postal_code);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON property_assessments(assessment_status);

-- 6. Assessment Images
CREATE INDEX IF NOT EXISTS idx_assessment_images_assessment ON assessment_images(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_images_type ON assessment_images(image_type);

-- 7. AI Analysis Results
CREATE INDEX IF NOT EXISTS idx_ai_analysis_assessment ON ai_analysis_results(assessment_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_status ON ai_analysis_results(analysis_status);

-- 8. Site Surveys
CREATE INDEX IF NOT EXISTS idx_surveys_project ON site_surveys(project_id);
CREATE INDEX IF NOT EXISTS idx_surveys_surveyor ON site_surveys(surveyor_id);
CREATE INDEX IF NOT EXISTS idx_surveys_approval ON site_surveys(approval_status);

-- 9. Products Catalog
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

-- 10. Solar Recommendations
CREATE INDEX IF NOT EXISTS idx_recommendations_assessment ON solar_recommendations(assessment_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_project ON solar_recommendations(project_id);

-- 11. Quotations & Items
CREATE INDEX IF NOT EXISTS idx_quotations_number ON quotations(quotation_number);
CREATE INDEX IF NOT EXISTS idx_quotations_project ON quotations(project_id);
CREATE INDEX IF NOT EXISTS idx_quotations_customer ON quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(quotation_status);
CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation ON quotation_items(quotation_id);
CREATE INDEX IF NOT EXISTS idx_quotation_items_product ON quotation_items(product_id);

-- 12. Payments
CREATE INDEX IF NOT EXISTS idx_payments_project ON payments(project_id);
CREATE INDEX IF NOT EXISTS idx_payments_quotation ON payments(quotation_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date DESC);

-- 13. Inventory & Movements
CREATE INDEX IF NOT EXISTS idx_inventory_product_warehouse ON inventory(product_id, warehouse_name);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product ON inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_inventory ON inventory_movements(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_type ON inventory_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created ON inventory_movements(created_at DESC);

-- 14. Equipment
CREATE INDEX IF NOT EXISTS idx_equipment_serial ON equipment(serial_number);
CREATE INDEX IF NOT EXISTS idx_equipment_product ON equipment(product_id);
CREATE INDEX IF NOT EXISTS idx_equipment_project ON equipment(project_id);
CREATE INDEX IF NOT EXISTS idx_equipment_installation ON equipment(installation_id);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(equipment_status);

-- 15. Installations & Checklist
CREATE INDEX IF NOT EXISTS idx_installations_number ON installations(installation_number);
CREATE INDEX IF NOT EXISTS idx_installations_project ON installations(project_id);
CREATE INDEX IF NOT EXISTS idx_installations_technician ON installations(assigned_technician_id);
CREATE INDEX IF NOT EXISTS idx_installations_status ON installations(installation_status);
CREATE INDEX IF NOT EXISTS idx_installations_scheduled ON installations(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_checklist_installation ON installation_checklist(installation_id);

-- 16. Warranties
CREATE INDEX IF NOT EXISTS idx_warranties_equipment ON warranties(equipment_id);
CREATE INDEX IF NOT EXISTS idx_warranties_customer ON warranties(customer_id);
CREATE INDEX IF NOT EXISTS idx_warranties_status ON warranties(warranty_status);

-- 17. Telemetry (Time-series composite index)
CREATE INDEX IF NOT EXISTS idx_telemetry_equipment_time ON telemetry(equipment_id, timestamp DESC);

-- 18. Service Tickets
CREATE INDEX IF NOT EXISTS idx_tickets_number ON service_tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_tickets_customer ON service_tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_project ON service_tickets(project_id);
CREATE INDEX IF NOT EXISTS idx_tickets_equipment ON service_tickets(equipment_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON service_tickets(ticket_status);
CREATE INDEX IF NOT EXISTS idx_tickets_technician ON service_tickets(assigned_technician_id);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON service_tickets(priority);

-- 19. Audit Logs
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);
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
