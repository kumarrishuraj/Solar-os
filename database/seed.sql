-- ==============================================================================
-- SolarOS Sample Development Seed Data
-- Platform: Supabase / PostgreSQL
-- Purpose: Provides initial test fixtures for local development and demonstration.
-- ==============================================================================

-- 1. Insert Sample Operators & Engineers
INSERT INTO users (id, email, full_name, role, phone)
VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@solaros.io', 'Alex Rivera', 'admin', '+1-555-0100'),
    ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'sarah.engineer@solaros.io', 'Sarah Chen', 'engineer', '+1-555-0101'),
    ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'mark.sales@solaros.io', 'Mark Patel', 'sales_rep', '+1-555-0102')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Sample Equipment Catalog
INSERT INTO equipment (id, category, manufacturer, model_name, rated_capacity_watts, efficiency_pct, unit_cost, quantity_on_hand, warranty_years, specifications)
VALUES
    (
        'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
        'panel',
        'SunPeak Energy',
        'Helios Pro 450W Monocrystalline',
        450.00,
        21.80,
        185.00,
        150,
        25,
        '{"cell_type": "Monocrystalline PERC", "dimensions_mm": "2094x1038x35", "weight_kg": 24.5}'::jsonb
    ),
    (
        'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
        'inverter',
        'VoltWave Tech',
        'SolarWave 7.6kW Hybrid Inverter',
        7600.00,
        97.50,
        1450.00,
        25,
        12,
        '{"max_efficiency": "98.2%", "mppt_channels": 2, "nominal_ac_voltage": 240}'::jsonb
    ),
    (
        'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
        'battery',
        'TerraVault',
        'HomeVault 10kWh LFP',
        5000.00,
        92.00,
        5800.00,
        10,
        10,
        '{"chemistry": "LiFePO4", "usable_capacity_kwh": 9.6, "round_trip_efficiency": 90}'::jsonb
    )
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Sample Customer Leads
INSERT INTO leads (id, full_name, email, phone, address, city, state, postal_code, latitude, longitude, monthly_bill_avg, annual_kwh_consumption, status, assigned_to)
VALUES
    (
        '10eebc99-9c0b-4ef8-bb6d-6bb9bd380b01',
        'David Miller',
        'david.miller@example.com',
        '+1-555-0201',
        '742 Evergreen Terrace',
        'Springfield',
        'OR',
        '97477',
        44.0462,
        -123.0220,
        240.50,
        11500.00,
        'survey_scheduled',
        'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33'
    ),
    (
        '20eebc99-9c0b-4ef8-bb6d-6bb9bd380b02',
        'Elena Rostova',
        'elena.rostova@example.com',
        '+1-555-0202',
        '1204 Pine Ridge Road',
        'Boulder',
        'CO',
        '80302',
        40.0150,
        -105.2705,
        195.00,
        9200.00,
        'new',
        'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33'
    )
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Sample Rooftop Survey
INSERT INTO rooftop_surveys (id, lead_id, aerial_image_url, total_roof_area_sqm, usable_roof_area_sqm, detected_obstacles, roof_pitch_deg, azimuth_deg, shading_factor)
VALUES
    (
        '30eebc99-9c0b-4ef8-bb6d-6bb9bd380c01',
        '10eebc99-9c0b-4ef8-bb6d-6bb9bd380b01',
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
        140.00,
        96.50,
        '[{"type": "chimney", "x": 120, "y": 80, "area_sqm": 2.5}, {"type": "skylight", "x": 240, "y": 150, "area_sqm": 4.0}]'::jsonb,
        22.50,
        185.00,
        0.04
    )
ON CONFLICT (id) DO NOTHING;
