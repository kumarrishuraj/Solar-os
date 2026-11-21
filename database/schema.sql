-- ==============================================================================
-- SolarOS Database Schema Definition
-- Platform: Supabase / PostgreSQL (15+)
-- Purpose: Schema definition for solar installation management platform.
-- Note: This is an initial starter schema for development and prototyping.
-- ==============================================================================

-- Enable UUID generation extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgvector extension for future AI RAG / document embeddings
CREATE EXTENSION IF NOT EXISTS "vector";

-- ------------------------------------------------------------------------------
-- 1. Users & Roles Table
-- Stores platform operators, site engineers, sales representatives, and customers.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'sales_rep', -- 'admin', 'surveyor', 'engineer', 'sales_rep', 'customer'
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. Leads Table
-- Ingestion point for prospective solar customers (residential & commercial).
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    monthly_bill_avg NUMERIC(10, 2), -- Average monthly utility bill
    annual_kwh_consumption NUMERIC(10, 2), -- Estimated yearly electricity consumption
    status VARCHAR(50) DEFAULT 'new', -- 'new', 'survey_scheduled', 'quote_ready', 'contract_signed', 'lost'
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. Rooftop Surveys Table
-- Stores rooftop imagery, vision-based obstacle detection results, and surface areas.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rooftop_surveys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    aerial_image_url TEXT,
    total_roof_area_sqm NUMERIC(10, 2),
    usable_roof_area_sqm NUMERIC(10, 2),
    detected_obstacles JSONB DEFAULT '[]'::jsonb, -- e.g. [{"type": "chimney", "bbox": [x1, y1, x2, y2], "area": 3.2}]
    roof_pitch_deg NUMERIC(5, 2), -- Roof slope in degrees
    azimuth_deg NUMERIC(5, 2),    -- Orientation (180 = South)
    shading_factor NUMERIC(4, 3) DEFAULT 0.05, -- 0.00 to 1.00 estimated shading loss
    surveyor_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. Equipment Catalog & Inventory Table
-- Master catalog for solar panels, inverters, racking systems, and storage batteries.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(50) NOT NULL, -- 'panel', 'inverter', 'battery', 'racking', 'bos'
    manufacturer VARCHAR(100) NOT NULL,
    model_name VARCHAR(150) NOT NULL,
    rated_capacity_watts NUMERIC(10, 2), -- e.g. 450W for panels, 5000W for inverter
    efficiency_pct NUMERIC(5, 2),
    unit_cost NUMERIC(10, 2) NOT NULL,
    quantity_on_hand INTEGER DEFAULT 0,
    warranty_years INTEGER DEFAULT 10,
    specifications JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. Quotations Table
-- Stores generated proposals, financial payback calculations, and system specs.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    survey_id UUID REFERENCES rooftop_surveys(id) ON DELETE SET NULL,
    system_capacity_kw NUMERIC(8, 2) NOT NULL,
    estimated_annual_kwh NUMERIC(10, 2) NOT NULL,
    total_cost NUMERIC(12, 2) NOT NULL,
    tax_credits_amount NUMERIC(12, 2) DEFAULT 0.00,
    net_cost NUMERIC(12, 2) NOT NULL,
    estimated_payback_years NUMERIC(5, 2),
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'presented', 'accepted', 'rejected'
    bom_breakdown JSONB DEFAULT '[]'::jsonb, -- itemized equipment bill of materials
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. Installations Table
-- Tracks installation execution, permitting, crew schedules, and commissioning.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS installations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE RESTRICT,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    scheduled_date DATE,
    completion_date DATE,
    status VARCHAR(50) DEFAULT 'permitting', -- 'permitting', 'scheduled', 'in_progress', 'inspected', 'commissioned'
    lead_technician_id UUID REFERENCES users(id) ON DELETE SET NULL,
    commissioning_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. Telemetry & Anomaly Logs Table
-- Ingests inverter metrics to power Isolation Forest anomaly detection & maintenance.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS equipment_telemetry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    installation_id UUID NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
    inverter_id VARCHAR(100) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    power_output_watts NUMERIC(10, 2),
    dc_voltage NUMERIC(8, 2),
    dc_current NUMERIC(8, 2),
    inverter_temp_celsius NUMERIC(6, 2),
    is_anomaly BOOLEAN DEFAULT FALSE,
    anomaly_score NUMERIC(6, 4), -- Isolation Forest anomaly score
    anomaly_details JSONB DEFAULT '{}'::jsonb
);

-- ------------------------------------------------------------------------------
-- 8. Indexes for High-Traffic Queries
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_surveys_lead_id ON rooftop_surveys(lead_id);
CREATE INDEX IF NOT EXISTS idx_quotations_lead_id ON quotations(lead_id);
CREATE INDEX IF NOT EXISTS idx_installations_status ON installations(status);
CREATE INDEX IF NOT EXISTS idx_telemetry_installation ON equipment_telemetry(installation_id, recorded_at DESC);
