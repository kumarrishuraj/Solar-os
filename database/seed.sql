-- ==============================================================================
-- SolarOS Realistic Fictional Indian Business Seed Dataset
-- Platform: Supabase / PostgreSQL 15+
-- Purpose: Complete, idempotent seed fixtures for local development & demonstration
-- All data is entirely fictional and representative of Indian solar operations.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. USERS & STAFF ROSTER (12 staff members across all SolarOS operational roles)
-- ------------------------------------------------------------------------------
INSERT INTO users (id, auth_user_id, full_name, email, phone, role, is_active)
VALUES
    -- Executive & Leadership
    ('00000000-0000-0000-0001-000000000001', 'a0000001-0000-0000-0000-000000000001', 'Rajesh Kumar', 'admin@solaros.in', '+91-98140-11001', 'admin', TRUE),
    ('00000000-0000-0000-0001-000000000002', 'a0000001-0000-0000-0000-000000000002', 'Sunita Deshmukh', 'director@solaros.in', '+91-98140-11002', 'director', TRUE),
    
    -- Sales Team
    ('00000000-0000-0000-0001-000000000003', 'a0000001-0000-0000-0000-000000000003', 'Amit Patel', 'amit.sales@solaros.in', '+91-98140-11003', 'sales', TRUE),
    ('00000000-0000-0000-0001-000000000004', 'a0000001-0000-0000-0000-000000000004', 'Karan Malhotra', 'karan.sales@solaros.in', '+91-98140-11004', 'sales', TRUE),
    
    -- Surveyors (Field Site Engineers)
    ('00000000-0000-0000-0001-000000000005', 'a0000001-0000-0000-0000-000000000005', 'Harpreet Singh', 'harpreet.survey@solaros.in', '+91-98140-11005', 'surveyor', TRUE),
    ('00000000-0000-0000-0001-000000000006', 'a0000001-0000-0000-0000-000000000006', 'Manpreet Kaur', 'manpreet.survey@solaros.in', '+91-98140-11006', 'surveyor', TRUE),
    
    -- Design & Electrical Engineer
    ('00000000-0000-0000-0001-000000000007', 'a0000001-0000-0000-0000-000000000007', 'Deepa Raman', 'deepa.eng@solaros.in', '+91-98140-11007', 'engineer', TRUE),
    
    -- Finance & Commercial
    ('00000000-0000-0000-0001-000000000008', 'a0000001-0000-0000-0000-000000000008', 'Sanjay Singhania', 'sanjay.finance@solaros.in', '+91-98140-11008', 'finance', TRUE),
    
    -- Warehouse & Logistics Manager
    ('00000000-0000-0000-0001-000000000009', 'a0000001-0000-0000-0000-000000000009', 'Gurinder Dhillon', 'gurinder.warehouse@solaros.in', '+91-98140-11009', 'warehouse', TRUE),
    
    -- Field Technicians & Electricians
    ('00000000-0000-0000-0001-000000000010', 'a0000001-0000-0000-0000-000000000010', 'Vikram Rawat', 'vikram.tech@solaros.in', '+91-98140-11010', 'technician', TRUE),
    ('00000000-0000-0000-0001-000000000011', 'a0000001-0000-0000-0000-000000000011', 'Balwinder Singh', 'balwinder.tech@solaros.in', '+91-98140-11011', 'technician', TRUE),
    
    -- Customer Support & Service Dispatch
    ('00000000-0000-0000-0001-000000000012', 'a0000001-0000-0000-0000-000000000012', 'Pooja Sharma', 'pooja.service@solaros.in', '+91-98140-11012', 'service_agent', TRUE)
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role;

-- ------------------------------------------------------------------------------
-- 2. CUSTOMERS (5 Indian Property Owners across specified cities)
-- ------------------------------------------------------------------------------
INSERT INTO customers (id, full_name, email, phone, alternate_phone, property_address, city, state, postal_code, latitude, longitude, property_type, notes)
VALUES
    (
        '00000000-0000-0000-0002-000000000001',
        'Aarav Sharma',
        'aarav.sharma@example.in',
        '+91-98765-43210',
        '+91-98765-43211',
        'Plot 45, Model Town Extension, Near Krishna Mandir',
        'Ludhiana',
        'Punjab',
        '141002',
        30.9010000,
        75.8573000,
        'residential',
        'Three-story independent kothi with accessible flat RCC roof. Interested in on-grid system with net metering.'
    ),
    (
        '00000000-0000-0000-0002-000000000002',
        'Priya Verma',
        'priya.verma@example.in',
        '+91-98234-56789',
        NULL,
        'House No. 128, Defence Colony, Cantt Road',
        'Jalandhar',
        'Punjab',
        '144005',
        31.3260000,
        75.5762000,
        'residential',
        'Two-story villa. High summer AC consumption. Wants hybrid solar setup with battery backup.'
    ),
    (
        '00000000-0000-0000-0002-000000000003',
        'Rahul Mehta',
        'rahul.mehta@example.in',
        '+91-97112-34567',
        '+91-97112-34568',
        'SCO 84-85, Sector 17-C, Commercial Plaza',
        'Chandigarh',
        'Chandigarh',
        '160017',
        30.7333000,
        76.7794000,
        'commercial',
        'Commercial office premises. Interested in high-efficiency bi-facial panels for rooftop deck.'
    ),
    (
        '00000000-0000-0000-0002-000000000004',
        'Neha Gupta',
        'neha.gupta@example.in',
        '+91-98555-12345',
        NULL,
        'B-14, Green Avenue, Near Medical College',
        'Amritsar',
        'Punjab',
        '143001',
        31.6340000,
        74.8723000,
        'residential',
        'Doctor residence and clinic. Requires uninterrupted day supply. Looking for 8 kW on-grid system.'
    ),
    (
        '00000000-0000-0000-0002-000000000005',
        'Vikram Singh',
        'vikram.singh@example.in',
        '+91-94140-98765',
        '+91-94140-98766',
        'Plot 12, Industrial Area, Sitapura Extension Phase II',
        'Jaipur',
        'Rajasthan',
        '302022',
        26.8289000,
        75.8056000,
        'industrial',
        'Garment export manufacturing warehouse. Large industrial tin-shed roof structure.'
    )
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    property_address = EXCLUDED.property_address;

-- ------------------------------------------------------------------------------
-- 3. PRODUCT CATALOG (Solar Panels, Inverters, Batteries, Cables & BOS)
-- ------------------------------------------------------------------------------
INSERT INTO products (id, sku, product_name, brand, model, category, rated_power_w, voltage, current, technical_specifications, purchase_price, selling_price, warranty_months, is_active)
VALUES
    -- Solar Panels
    (
        '00000000-0000-0000-0003-000000000001',
        'SP-500W-MONO-WAA',
        'Waaree 500W Mono PERC Half-Cut Module',
        'Waaree Energies',
        'WS-500',
        'solar_panel',
        500.00,
        42.50,
        11.77,
        '{"cell_type": "Mono PERC 144 Cells", "efficiency_pct": 21.2, "temp_coeff": "-0.35%/C", "dimensions_mm": "2094x1038x35", "weight_kg": 24.5}'::jsonb,
        10500.00,
        13200.00,
        300, -- 25 Years
        TRUE
    ),
    (
        '00000000-0000-0000-0003-000000000002',
        'SP-550W-BIFAC-ADA',
        'Adani 550W TOPCon Bi-facial High-Efficiency Solar Panel',
        'Adani Solar',
        'AS-550-BIFAC',
        'solar_panel',
        550.00,
        43.10,
        12.77,
        '{"cell_type": "N-Type TOPCon Bifacial", "bifaciality": "80%", "efficiency_pct": 22.3, "dimensions_mm": "2278x1134x30", "weight_kg": 28.0}'::jsonb,
        12100.00,
        15400.00,
        360, -- 30 Years
        TRUE
    ),

    -- Solar Inverters
    (
        '00000000-0000-0000-0003-000000000003',
        'INV-3KW-1PH-HVL',
        'Havells Enviro 3kW Single-Phase On-Grid Solar Inverter',
        'Havells',
        'ENVIRO-GT-3.0',
        'inverter',
        3000.00,
        230.00,
        13.04,
        '{"type": "String Inverter", "mppt_count": 1, "max_efficiency": "97.6%", "protection_rating": "IP65", "communication": "RS485/WiFi"}'::jsonb,
        28500.00,
        36000.00,
        120, -- 10 Years
        TRUE
    ),
    (
        '00000000-0000-0000-0003-000000000004',
        'INV-5KW-3PH-SNG',
        'Sungrow 5kW Three-Phase Multi-MPPT Grid-Tied Inverter',
        'Sungrow',
        'SG5.0RT',
        'inverter',
        5000.00,
        415.00,
        7.60,
        '{"type": "Three Phase String", "mppt_count": 2, "max_efficiency": "98.4%", "dc_disconnect": "Integrated", "protection_rating": "IP65"}'::jsonb,
        42000.00,
        54000.00,
        120, -- 10 Years
        TRUE
    ),

    -- Energy Storage Batteries
    (
        '00000000-0000-0000-0003-000000000005',
        'BAT-10KWH-LFP-EXD',
        'Exide Sunday 10kWh LiFePO4 Solar Wall Storage Battery',
        'Exide',
        'SUN-10KWH-LFP',
        'battery',
        5000.00,
        51.20,
        100.00,
        '{"chemistry": "LiFePO4", "usable_capacity_kwh": 9.6, "cycle_life": 6000, "bms_included": true, "depth_of_discharge": "90%"}'::jsonb,
        185000.00,
        225000.00,
        84, -- 7 Years
        TRUE
    ),

    -- Balance of System (Mounting Structure, Cables, Protection)
    (
        '00000000-0000-0000-0003-000000000006',
        'MNT-ALUM-ELEV-STRUCT',
        'HDG Elevated Aluminum Rooftop Mounting Structure Kit (1 kW)',
        'SolarMount Tech',
        'SM-AL-ELEV-1KW',
        'mounting_structure',
        NULL,
        NULL,
        NULL,
        '{"material": "Anodized Aluminum 6063-T6 & SS304 Hardware", "wind_rating_kmph": 170, "tilt_angle": "20-25 deg"}'::jsonb,
        3800.00,
        5200.00,
        120,
        TRUE
    ),
    (
        '00000000-0000-0000-0003-000000000007',
        'CBL-DC-4SQMM-100M',
        'Polycab 4 sq mm Cross-linked Polyolefin UV DC Solar Cable (100m Roll)',
        'Polycab',
        'SOLAR-DC-4MM',
        'cable',
        NULL,
        1500.00,
        40.00,
        '{"core": "Tinned Copper Flexible Class 5", "insulation": "XLPO UV Halogen-Free", "voltage_grade_v": 1500}'::jsonb,
        4200.00,
        5500.00,
        60,
        TRUE
    ),
    (
        '00000000-0000-0000-0003-000000000008',
        'CBL-AC-6SQMM-50M',
        'Havells 6 sq mm 4-Core Armored Copper AC Sub-Mains Cable (50m Roll)',
        'Havells',
        'AC-ARM-6SQMM',
        'cable',
        NULL,
        1100.00,
        45.00,
        '{"core": "Electrolytic Copper", "sheath": "Heavy Duty PVC Galvanized Steel Armored"}'::jsonb,
        5800.00,
        7400.00,
        60,
        TRUE
    ),
    (
        '00000000-0000-0000-0003-000000000009',
        'PRT-AJB-DCDB-2IN2OUT',
        'Array Junction Box DCDB 2-In 2-Out (1000V DC SPD + 16A DC Fuses)',
        'Schneider Electric',
        'DCDB-2IN-1KV',
        'protection_device',
        NULL,
        1000.00,
        32.00,
        '{"enclosure": "Polycarbonate IP65", "spd": "Type II 1000V DC", "fuse_type": "gPV 1000V 16A"}'::jsonb,
        3200.00,
        4500.00,
        36,
        TRUE
    ),
    (
        '00000000-0000-0000-0003-000000000010',
        'PRT-ACDB-3PH-32A',
        'AC Distribution Box 3-Phase (415V AC 32A MCB + Type II AC SPD)',
        'L&T Electrical',
        'ACDB-3PH-32A',
        'protection_device',
        NULL,
        415.00,
        32.00,
        '{"enclosure": "CRCA Sheet IP65 Powder Coated", "mcb": "32A 4P C-Curve 10kA", "spd": "Class C 40kA"}'::jsonb,
        4100.00,
        5600.00,
        36,
        TRUE
    )
ON CONFLICT (id) DO UPDATE SET
    selling_price = EXCLUDED.selling_price,
    purchase_price = EXCLUDED.purchase_price;

-- ------------------------------------------------------------------------------
-- 4. LEADS (Enquiry Pipeline)
-- ------------------------------------------------------------------------------
INSERT INTO leads (id, lead_number, customer_id, source, monthly_electricity_bill, monthly_consumption_kwh, estimated_system_capacity_kw, status, assigned_salesperson_id, notes)
VALUES
    (
        '00000000-0000-0000-0004-000000000001',
        'LEAD-2026-0001',
        '00000000-0000-0000-0002-000000000001', -- Aarav Sharma (Ludhiana)
        'website',
        6800.00,
        780.00,
        6.00,
        'converted',
        '00000000-0000-0000-0001-000000000003', -- Amit Patel
        'Customer submitted online enquiry with PSPCL electricity bill. Wants 6 kW grid-connected setup.'
    ),
    (
        '00000000-0000-0000-0004-000000000002',
        'LEAD-2026-0002',
        '00000000-0000-0000-0002-000000000002', -- Priya Verma (Jalandhar)
        'referral',
        5200.00,
        600.00,
        5.00,
        'quotation_sent',
        '00000000-0000-0000-0001-000000000003', -- Amit Patel
        'Referred by existing client. High demand for battery storage due to occasional local outages.'
    ),
    (
        '00000000-0000-0000-0004-000000000003',
        'LEAD-2026-0003',
        '00000000-0000-0000-0002-000000000003', -- Rahul Mehta (Chandigarh)
        'google_ads',
        18500.00,
        2100.00,
        15.00,
        'survey_scheduled',
        '00000000-0000-0000-0001-000000000004', -- Karan Malhotra
        'Commercial building top floor. Ready for technical audit and structural check.'
    ),
    (
        '00000000-0000-0000-0004-000000000004',
        'LEAD-2026-0004',
        '00000000-0000-0000-0002-000000000004', -- Neha Gupta (Amritsar)
        'exhibition',
        9200.00,
        1050.00,
        8.00,
        'qualified',
        '00000000-0000-0000-0001-000000000003', -- Amit Patel
        'Met at Punjab Clean Tech Expo. Clinic has 3 air conditioners running 8 hours daily.'
    ),
    (
        '00000000-0000-0000-0004-000000000005',
        'LEAD-2026-0005',
        '00000000-0000-0000-0002-000000000005', -- Vikram Singh (Jaipur)
        'direct_walkin',
        42000.00,
        5500.00,
        40.00,
        'converted',
        '00000000-0000-0000-0001-000000000004', -- Karan Malhotra
        'Industrial factory client. Ready for 40 kW Phase-1 installation with net metering.'
    )
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    notes = EXCLUDED.notes;

-- ------------------------------------------------------------------------------
-- 5. PROJECTS (Solar Lifecycle Tracking)
-- ------------------------------------------------------------------------------
INSERT INTO projects (id, project_number, customer_id, lead_id, project_name, proposed_capacity_kw, approved_capacity_kw, project_status, estimated_cost, final_cost, expected_completion_date, actual_completion_date)
VALUES
    (
        '00000000-0000-0000-0005-000000000001',
        'PRJ-2026-0001',
        '00000000-0000-0000-0002-000000000001', -- Aarav Sharma
        '00000000-0000-0000-0004-000000000001',
        'Aarav Sharma - 6kW Ludhiana Rooftop Solar',
        6.00,
        6.00,
        'completed',
        360000.00,
        354000.00,
        '2026-10-15',
        '2026-10-14'
    ),
    (
        '00000000-0000-0000-0002-000000000002',
        'PRJ-2026-0002',
        '00000000-0000-0000-0002-000000000002', -- Priya Verma
        '00000000-0000-0000-0004-000000000002',
        'Priya Verma - 5kW Hybrid Jalandhar System',
        5.00,
        5.00,
        'quotation_approved',
        425000.00,
        NULL,
        '2026-12-05',
        NULL
    ),
    (
        '00000000-0000-0000-0005-000000000003',
        'PRJ-2026-0003',
        '00000000-0000-0000-0002-000000000003', -- Rahul Mehta
        '00000000-0000-0000-0004-000000000003',
        'Rahul Mehta - 15kW Commercial Chandigarh Rooftop',
        15.00,
        NULL,
        'survey_approved',
        880000.00,
        NULL,
        '2026-12-20',
        NULL
    ),
    (
        '00000000-0000-0000-0005-000000000005',
        'PRJ-2026-0004',
        '00000000-0000-0000-0002-000000000005', -- Vikram Singh
        '00000000-0000-0000-0004-000000000005',
        'Vikram Singh - 40kW Industrial Sitapura Plant',
        40.00,
        40.00,
        'installation_in_progress',
        2200000.00,
        2150000.00,
        '2026-11-30',
        NULL
    )
ON CONFLICT (id) DO UPDATE SET
    project_status = EXCLUDED.project_status;

-- ------------------------------------------------------------------------------
-- 6. PROPERTY ASSESSMENTS (Rooftop dimensions & technical criteria)
-- ------------------------------------------------------------------------------
INSERT INTO property_assessments (
    id, customer_id, lead_id, project_id, property_address, city, state, postal_code,
    latitude, longitude, roof_length, roof_width, roof_area, usable_roof_area,
    measurement_unit, roof_type, roof_orientation, roof_tilt, number_of_roof_sections,
    grid_availability, monthly_bill, monthly_consumption_kwh, connection_phase,
    preferred_solar_type, budget, assessment_status
)
VALUES
    (
        '00000000-0000-0000-0006-000000000001',
        '00000000-0000-0000-0002-000000000001', -- Aarav Sharma
        '00000000-0000-0000-0004-000000000001',
        '00000000-0000-0000-0005-000000000001',
        'Plot 45, Model Town Extension, Near Krishna Mandir',
        'Ludhiana', 'Punjab', '141002',
        30.9010000, 75.8573000,
        14.50, 9.20, 133.40, 92.50,
        'sq_meters', 'flat_concrete', 'south', 18.00, 1,
        TRUE, 6800.00, 780.00, 'three_phase',
        'on_grid', 380000.00, 'verified'
    ),
    (
        '00000000-0000-0000-0006-000000000002',
        '00000000-0000-0000-0002-000000000002', -- Priya Verma
        '00000000-0000-0000-0004-000000000002',
        '00000000-0000-0000-0002-000000000002',
        'House No. 128, Defence Colony, Cantt Road',
        'Jalandhar', 'Punjab', '144005',
        31.3260000, 75.5762000,
        11.00, 8.50, 93.50, 68.00,
        'sq_meters', 'flat_concrete', 'south_west', 22.00, 2,
        TRUE, 5200.00, 600.00, 'single_phase',
        'hybrid', 450000.00, 'submitted'
    ),
    (
        '00000000-0000-0000-0006-000000000003',
        '00000000-0000-0000-0002-000000000003', -- Rahul Mehta
        '00000000-0000-0000-0004-000000000003',
        '00000000-0000-0000-0005-000000000003',
        'SCO 84-85, Sector 17-C, Commercial Plaza',
        'Chandigarh', 'Chandigarh', '160017',
        30.7333000, 76.7794000,
        22.00, 12.00, 264.00, 185.00,
        'sq_meters', 'flat_concrete', 'south', 15.00, 1,
        TRUE, 18500.00, 2100.00, 'three_phase',
        'on_grid', 900000.00, 'verified'
    ),
    (
        '00000000-0000-0000-0006-000000000005',
        '00000000-0000-0000-0002-000000000005', -- Vikram Singh
        '00000000-0000-0000-0004-000000000005',
        '00000000-0000-0000-0005-000000000005',
        'Plot 12, Industrial Area, Sitapura Extension Phase II',
        'Jaipur', 'Rajasthan', '302022',
        26.8289000, 75.8056000,
        45.00, 20.00, 900.00, 720.00,
        'sq_meters', 'tin_shed', 'south', 12.00, 2,
        TRUE, 42000.00, 5500.00, 'three_phase',
        'on_grid', 2300000.00, 'verified'
    )
ON CONFLICT (id) DO UPDATE SET
    usable_roof_area = EXCLUDED.usable_roof_area,
    assessment_status = EXCLUDED.assessment_status;

-- ------------------------------------------------------------------------------
-- 7. ASSESSMENT IMAGES (Supabase Storage Reference Metadata)
-- ------------------------------------------------------------------------------
INSERT INTO assessment_images (id, assessment_id, file_path, file_name, mime_type, file_size_bytes, image_type)
VALUES
    (
        '00000000-0000-0000-0007-000000000001',
        '00000000-0000-0000-0006-000000000001',
        'rooftop-images/00000000-0000-0000-0006-000000000001/ludhiana_kothi_drone_top.jpg',
        'ludhiana_kothi_drone_top.jpg',
        'image/jpeg',
        2845920,
        'rooftop_full_view'
    ),
    (
        '00000000-0000-0000-0007-000000000002',
        '00000000-0000-0000-0006-000000000001',
        'rooftop-images/00000000-0000-0000-0006-000000000001/water_tank_parapet_obstacles.jpg',
        'water_tank_parapet_obstacles.jpg',
        'image/jpeg',
        1924500,
        'obstacles'
    ),
    (
        '00000000-0000-0000-0007-000000000003',
        '00000000-0000-0000-0006-000000000001',
        'electricity-bills/00000000-0000-0000-0006-000000000001/pspcl_bill_aug2026.pdf',
        'pspcl_bill_aug2026.pdf',
        'application/pdf',
        521000,
        'electricity_bill'
    ),
    (
        '00000000-0000-0000-0007-000000000004',
        '00000000-0000-0000-0006-000000000002',
        'rooftop-images/00000000-0000-0000-0006-000000000002/jalandhar_terrace_angle.jpg',
        'jalandhar_terrace_angle.jpg',
        'image/jpeg',
        3120040,
        'rooftop_angle'
    )
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 8. AI ANALYSIS RESULTS (DEMO / MOCK DATA FOR FRONTEND TEST ONLY)
-- ------------------------------------------------------------------------------
INSERT INTO ai_analysis_results (
    id, assessment_id, model_name, model_version, analysis_status,
    detected_obstacles, detected_shading_regions, estimated_usable_area,
    proposed_panel_layout, confidence, missing_information, raw_result_json
)
VALUES
    (
        '00000000-0000-0000-0008-000000000001',
        '00000000-0000-0000-0006-000000000001',
        'SolarVision-YOLOv8-Rooftop-Demo',
        'v1.2.0-rc',
        'completed',
        '[
            {"class": "water_tank", "bbox": [120, 45, 210, 130], "height_meters": 1.8, "shading_zone_sqm": 8.5},
            {"class": "parapet_wall", "bbox": [10, 10, 800, 25], "height_meters": 0.9, "shading_zone_sqm": 3.2},
            {"class": "staircase_room", "bbox": [450, 320, 620, 510], "height_meters": 2.6, "shading_zone_sqm": 14.2}
        ]'::jsonb,
        '[{"azimuth_deg": 240, "impact": "minor_evening_shadow", "area_sqm": 6.8}]'::jsonb,
        92.50,
        '{
            "panel_model_sku": "SP-500W-MONO-WAA",
            "total_modules": 12,
            "system_capacity_kw": 6.00,
            "rows": 2,
            "tilt_deg": 18,
            "orientation": "180_South"
        }'::jsonb,
        0.9420,
        '[]'::jsonb,
        '{"demo_sample_record": true, "note": "Pre-computed mock output for frontend visualization test"}'::jsonb
    )
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 9. SITE SURVEYS (Physical Engineering Audits)
-- ------------------------------------------------------------------------------
INSERT INTO site_surveys (
    id, project_id, assessment_id, surveyor_id, scheduled_date, actual_survey_date,
    verified_roof_area, verified_roof_orientation, verified_roof_tilt,
    structural_observations, shading_observations, cable_distance,
    electrical_observations, safety_observations, approval_status,
    approved_by, approved_at, remarks
)
VALUES
    (
        '00000000-0000-0000-0009-000000000001',
        '00000000-0000-0000-0005-000000000001',
        '00000000-0000-0000-0006-000000000001',
        '00000000-0000-0000-0001-000000000005',
        '2026-09-12 10:30:00+05:30',
        '2026-09-12 12:15:00+05:30',
        132.80,
        'south',
        18.00,
        'Strong RCC roof slab, thickness 150mm. No water seepage or structural cracking detected.',
        'Minor shadow from overhead water tank between 07:30 to 08:45 AM. Clears completely by 09:00 AM.',
        22.50,
        'Connected load 10 kW 3-Phase PSPCL supply. Main distribution board in ground floor utility room.',
        'Standard parapet wall height 3 ft. Lifeline anchoring points available.',
        'approved',
        '00000000-0000-0000-0001-000000000007',
        '2026-09-13 14:00:00+05:30',
        'Site verified and approved for 6 kW on-grid installation with 12x 500W modules.'
    ),
    (
        '00000000-0000-0000-0009-000000000002',
        '00000000-0000-0000-0005-000000000003',
        '00000000-0000-0000-0006-000000000003',
        '00000000-0000-0000-0001-000000000006',
        '2026-10-02 11:00:00+05:30',
        '2026-10-02 13:30:00+05:30',
        260.00,
        'south',
        15.00,
        'Commercial building terrace. Elevator machine room located towards north, zero shadow on solar array.',
        '100% shade-free rooftop between 9:00 AM and 5:00 PM.',
        35.00,
        'Three-phase 25 kW sanction load. Existing 4-pole MCB box ready for solar meter integration.',
        'Parapet wall 4.5 ft. Full ladder and cage safety access installed.',
        'approved',
        '00000000-0000-0000-0001-000000000007',
        '2026-10-03 16:30:00+05:30',
        'Approved for 15 kW commercial array.'
    )
ON CONFLICT (id) DO UPDATE SET
    approval_status = EXCLUDED.approval_status;

-- ------------------------------------------------------------------------------
-- 10. SOLAR RECOMMENDATIONS (Calculated Proposals)
-- ------------------------------------------------------------------------------
INSERT INTO solar_recommendations (
    id, assessment_id, project_id, system_capacity_kw, estimated_generation_kwh,
    estimated_monthly_savings, estimated_payback_years, recommendation_source,
    assumptions, warnings, configuration, bom, approval_status
)
VALUES
    (
        '00000000-0000-0000-0010-000000000001',
        '00000000-0000-0000-0006-000000000001',
        '00000000-0000-0000-0005-000000000001',
        6.00,
        8760.00,
        5840.00,
        4.10,
        'engineering',
        '{"tariff_inr_per_kwh": 8.0, "degradation_rate_pct": 0.5, "annual_sun_hours": 1550}'::jsonb,
        '["Seasonal fog in Dec-Jan accounts for 15% generation reduction"]'::jsonb,
        '{"inverter_type": "three_phase_string", "panel_type": "mono_perc_500w", "module_count": 12}'::jsonb,
        '[
            {"sku": "SP-500W-MONO-WAA", "qty": 12, "desc": "Waaree 500W Mono PERC Module"},
            {"sku": "INV-5KW-3PH-SNG", "qty": 1, "desc": "Sungrow 5kW 3-Phase Inverter"},
            {"sku": "MNT-ALUM-ELEV-STRUCT", "qty": 6, "desc": "Aluminum Mounting Kit (6 kW)"}
        ]'::jsonb,
        'accepted'
    ),
    (
        '00000000-0000-0000-0010-000000000002',
        '00000000-0000-0000-0006-000000000002',
        '00000000-0000-0000-0002-000000000002',
        5.00,
        7150.00,
        4850.00,
        4.60,
        'engineering',
        '{"battery_autonomy_hours": 4, "tariff_inr_per_kwh": 8.2}'::jsonb,
        '[]'::jsonb,
        '{"inverter_type": "hybrid_single_phase", "battery_kwh": 10.0, "module_count": 10}'::jsonb,
        '[
            {"sku": "SP-500W-MONO-WAA", "qty": 10, "desc": "Waaree 500W Mono PERC Module"},
            {"sku": "BAT-10KWH-LFP-EXD", "qty": 1, "desc": "Exide 10kWh Lithium Battery"}
        ]'::jsonb,
        'accepted'
    )
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 11. QUOTATIONS & QUOTATION ITEMS (Commercial Bids)
-- ------------------------------------------------------------------------------
INSERT INTO quotations (
    id, quotation_number, project_id, customer_id, system_capacity_kw,
    subtotal, discount, gst_amount, installation_charges, total_amount,
    quotation_status, valid_until, approved_at
)
VALUES
    (
        '00000000-0000-0000-0011-000000000001',
        'QT-2026-0001',
        '00000000-0000-0000-0005-000000000001',
        '00000000-0000-0000-0002-000000000001',
        6.00,
        312000.00,
        12000.00,
        34000.00,
        20000.00,
        354000.00,
        'approved',
        '2026-10-31',
        '2026-09-20 11:30:00+05:30'
    ),
    (
        '00000000-0000-0000-0011-000000000002',
        'QT-2026-0002',
        '00000000-0000-0000-0002-000000000002',
        '00000000-0000-0000-0002-000000000002',
        5.00,
        460000.00,
        15000.00,
        55000.00,
        25000.00,
        525000.00,
        'sent',
        '2026-12-15',
        NULL
    )
ON CONFLICT (id) DO UPDATE SET
    quotation_status = EXCLUDED.quotation_status;

-- Quotation Line Items
INSERT INTO quotation_items (id, quotation_id, product_id, description, quantity, unit_price, total_price)
VALUES
    (
        '00000000-0000-0000-0012-000000000001',
        '00000000-0000-0000-0011-000000000001',
        '00000000-0000-0000-0003-000000000001',
        'Waaree 500W Mono PERC Solar Panels (Set of 12)',
        12.00,
        13200.00,
        158400.00
    ),
    (
        '00000000-0000-0000-0012-000000000002',
        '00000000-0000-0000-0011-000000000001',
        '00000000-0000-0000-0003-000000000004',
        'Sungrow 5kW 3-Phase Inverter with integrated WiFi logging',
        1.00,
        54000.00,
        54000.00
    ),
    (
        '00000000-0000-0000-0012-000000000003',
        '00000000-0000-0000-0011-000000000001',
        '00000000-0000-0000-0003-000000000006',
        'Elevated Aluminum Mounting Kit (6 kW Array Structure)',
        6.00,
        5200.00,
        31200.00
    ),
    (
        '00000000-0000-0000-0012-000000000004',
        '00000000-0000-0000-0011-000000000001',
        '00000000-0000-0000-0003-000000000007',
        'Polycab 4 sq mm UV Solar Cable Roll (100m)',
        1.00,
        5500.00,
        5500.00
    ),
    (
        '00000000-0000-0000-0012-000000000005',
        '00000000-0000-0000-0011-000000000001',
        '00000000-0000-0000-0003-000000000009',
        'Array Junction Box DCDB 2-In 2-Out with SPD',
        1.00,
        4500.00,
        4500.00
    )
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 12. PAYMENTS (Milestone Transactions & Customer Advances)
-- ------------------------------------------------------------------------------
INSERT INTO payments (
    id, project_id, quotation_id, amount, payment_method, transaction_reference,
    payment_status, payment_date
)
VALUES
    (
        '00000000-0000-0000-0013-000000000001',
        '00000000-0000-0000-0005-000000000001',
        '00000000-0000-0000-0011-000000000001',
        50000.00,
        'upi',
        'UPI/20260920/AXIS/984128471201',
        'completed',
        '2026-09-20 12:45:00+05:30'
    ),
    (
        '00000000-0000-0000-0013-000000000002',
        '00000000-0000-0000-0005-000000000001',
        '00000000-0000-0000-0011-000000000001',
        200000.00,
        'neft',
        'HDFC20260925N004819284',
        'completed',
        '2026-09-25 15:10:00+05:30'
    ),
    (
        '00000000-0000-0000-0013-000000000003',
        '00000000-0000-0000-0005-000000000001',
        '00000000-0000-0000-0011-000000000001',
        104000.00,
        'rtgs',
        'HDFC20261016R009218274',
        'completed',
        '2026-10-16 11:20:00+05:30'
    )
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 13. INVENTORY (Multi-Warehouse Stock Levels)
-- ------------------------------------------------------------------------------
INSERT INTO inventory (id, product_id, warehouse_name, quantity_on_hand, quantity_reserved, reorder_level)
VALUES
    -- Ludhiana Main Warehouse
    (
        '00000000-0000-0000-0014-000000000001',
        '00000000-0000-0000-0003-000000000001',
        'Ludhiana Main Warehouse',
        180.00,
        12.00,
        25.00
    ),
    (
        '00000000-0000-0000-0014-000000000002',
        '00000000-0000-0000-0003-000000000003',
        'Ludhiana Main Warehouse',
        15.00,
        2.00,
        5.00
    ),
    (
        '00000000-0000-0000-0014-000000000003',
        '00000000-0000-0000-0003-000000000004',
        'Ludhiana Main Warehouse',
        12.00,
        1.00,
        4.00
    ),
    (
        '00000000-0000-0000-0014-000000000004',
        '00000000-0000-0000-0003-000000000005',
        'Ludhiana Main Warehouse',
        6.00,
        1.00,
        2.00
    ),
    (
        '00000000-0000-0000-0014-000000000005',
        '00000000-0000-0000-0003-000000000007',
        'Ludhiana Main Warehouse',
        40.00,
        5.00,
        10.00
    ),

    -- Chandigarh Central Depot
    (
        '00000000-0000-0000-0014-000000000006',
        '00000000-0000-0000-0003-000000000002',
        'Chandigarh Central Depot',
        120.00,
        30.00,
        20.00
    ),
    (
        '00000000-0000-0000-0014-000000000007',
        '00000000-0000-0000-0003-000000000004',
        'Chandigarh Central Depot',
        8.00,
        0.00,
        3.00
    ),

    -- Jaipur Regional Hub
    (
        '00000000-0000-0000-0014-000000000008',
        '00000000-0000-0000-0003-000000000002',
        'Jaipur Regional Hub',
        250.00,
        80.00,
        50.00
    )
ON CONFLICT (product_id, warehouse_name) DO UPDATE SET
    quantity_on_hand = EXCLUDED.quantity_on_hand,
    quantity_reserved = EXCLUDED.quantity_reserved;

-- ------------------------------------------------------------------------------
-- 14. INVENTORY MOVEMENTS (Stock Audit Ledger)
-- ------------------------------------------------------------------------------
INSERT INTO inventory_movements (
    id, product_id, inventory_id, movement_type, quantity, reference_type,
    reference_id, performed_by, notes
)
VALUES
    (
        '00000000-0000-0000-0015-000000000001',
        '00000000-0000-0000-0003-000000000001',
        '00000000-0000-0000-0014-000000000001',
        'purchase',
        200.00,
        'purchase_order',
        NULL,
        '00000000-0000-0000-0001-000000000009',
        'Received shipment from Waaree Gujarat Factory - Invoice #WR-9821'
    ),
    (
        '00000000-0000-0000-0015-000000000002',
        '00000000-0000-0000-0003-000000000001',
        '00000000-0000-0000-0014-000000000001',
        'reservation',
        12.00,
        'project',
        '00000000-0000-0000-0005-000000000001',
        '00000000-0000-0000-0001-000000000009',
        'Reserved for Aarav Sharma project PRJ-2026-0001'
    ),
    (
        '00000000-0000-0000-0015-000000000003',
        '00000000-0000-0000-0003-000000000001',
        '00000000-0000-0000-0014-000000000001',
        'dispatch',
        12.00,
        'project',
        '00000000-0000-0000-0005-000000000001',
        '00000000-0000-0000-0001-000000000009',
        'Dispatched to site via SolarOS Logistics Van #PB-10-CU-4912'
    )
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 15. EQUIPMENT (Serialized Units)
-- ------------------------------------------------------------------------------
INSERT INTO equipment (
    id, product_id, serial_number, supplier, purchase_date,
    warranty_start_date, warranty_end_date, equipment_status, project_id, installation_id
)
VALUES
    (
        '00000000-0000-0000-0016-000000000001',
        '00000000-0000-0000-0003-000000000004',
        'SNG-5K-2026-LDH-00812',
        'Sungrow India Pvt Ltd',
        '2026-08-10',
        '2026-10-14',
        '2036-10-13',
        'installed',
        '00000000-0000-0000-0005-000000000001',
        NULL
    ),
    (
        '00000000-0000-0000-0016-000000000002',
        '00000000-0000-0000-0003-000000000001',
        'WAR-500W-2026-BATCH4-001',
        'Waaree Energies Ltd',
        '2026-08-15',
        '2026-10-14',
        '2051-10-13',
        'installed',
        '00000000-0000-0000-0005-000000000001',
        NULL
    ),
    (
        '00000000-0000-0000-0016-000000000003',
        '00000000-0000-0000-0003-000000000001',
        'WAR-500W-2026-BATCH4-002',
        'Waaree Energies Ltd',
        '2026-08-15',
        '2026-10-14',
        '2051-10-13',
        'installed',
        '00000000-0000-0000-0005-000000000001',
        NULL
    ),
    (
        '00000000-0000-0000-0016-000000000004',
        '00000000-0000-0000-0003-000000000005',
        'EXD-10KWH-LFP-2026-0094',
        'Exide Industries Ltd',
        '2026-09-01',
        NULL,
        NULL,
        'reserved',
        '00000000-0000-0000-0002-000000000002',
        NULL
    )
ON CONFLICT (id) DO UPDATE SET
    equipment_status = EXCLUDED.equipment_status;

-- ------------------------------------------------------------------------------
-- 16. INSTALLATIONS & CHECKLIST (Field Execution)
-- ------------------------------------------------------------------------------
INSERT INTO installations (
    id, project_id, installation_number, assigned_technician_id, scheduled_date,
    start_time, completion_time, installation_status, progress_percentage,
    system_capacity_kw, testing_results, customer_confirmation
)
VALUES
    (
        '00000000-0000-0000-0017-000000000001',
        '00000000-0000-0000-0005-000000000001',
        'INST-2026-0001',
        '00000000-0000-0000-0001-000000000010',
        '2026-10-12 09:00:00+05:30',
        '2026-10-12 09:30:00+05:30',
        '2026-10-14 17:00:00+05:30',
        'completed',
        100.00,
        6.00,
        '{
            "voc_string_1_v": 510.4,
            "isc_string_1_a": 11.2,
            "insulation_resistance_mohm": 125,
            "earth_resistance_ohm": 1.8,
            "grid_sync_time_sec": 45,
            "commissioning_passed": true
        }'::jsonb,
        TRUE
    ),
    (
        '00000000-0000-0000-0017-000000000002',
        '00000000-0000-0000-0005-000000000005',
        'INST-2026-0002',
        '00000000-0000-0000-0001-000000000011',
        '2026-11-20 08:30:00+05:30',
        '2026-11-20 09:00:00+05:30',
        NULL,
        'in_progress',
        65.00,
        40.00,
        '{"structure_completed": true, "module_mounting_pct": 80, "inverter_mounting": true}'::jsonb,
        FALSE
    )
ON CONFLICT (id) DO UPDATE SET
    installation_status = EXCLUDED.installation_status,
    progress_percentage = EXCLUDED.progress_percentage;

-- Link equipment to completed installation
UPDATE equipment
SET installation_id = '00000000-0000-0000-0017-000000000001'
WHERE id IN ('00000000-0000-0000-0016-000000000001', '00000000-0000-0000-0016-000000000002', '00000000-0000-0000-0016-000000000003');

-- Installation Checklist SOP
INSERT INTO installation_checklist (id, installation_id, task_name, is_completed, completed_by, completed_at, remarks)
VALUES
    (
        '00000000-0000-0000-0018-000000000001',
        '00000000-0000-0000-0017-000000000001',
        'Verify roof waterproofing and fastener anchorage points',
        TRUE,
        '00000000-0000-0000-0001-000000000010',
        '2026-10-12 12:00:00+05:30',
        'Chemical epoxy anchors inspected and torque tested.'
    ),
    (
        '00000000-0000-0000-0018-000000000002',
        '00000000-0000-0000-0017-000000000001',
        'Mount and clamp 12x Waaree 500W modules with SS mid/end clamps',
        TRUE,
        '00000000-0000-0000-0001-000000000010',
        '2026-10-13 14:00:00+05:30',
        'All mid and end clamps tightened to 12 Nm torque.'
    ),
    (
        '00000000-0000-0000-0018-000000000003',
        '00000000-0000-0000-0017-000000000001',
        'Install chemical earthing electrodes and test pit (Earth resistance < 2 ohms)',
        TRUE,
        '00000000-0000-0000-0001-000000000010',
        '2026-10-13 17:30:00+05:30',
        'Tested earth resistance value 1.8 ohms verified using earth tester.'
    ),
    (
        '00000000-0000-0000-0018-000000000004',
        '00000000-0000-0000-0017-000000000001',
        'Inverter commissioning and PSPCL net meter synchronization',
        TRUE,
        '00000000-0000-0000-0001-000000000010',
        '2026-10-14 16:30:00+05:30',
        'Grid sync stable at 415V, anti-islanding test confirmed.'
    )
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 17. WARRANTIES (Active Certificates)
-- ------------------------------------------------------------------------------
INSERT INTO warranties (
    id, equipment_id, customer_id, warranty_start_date, warranty_end_date,
    warranty_status, warranty_document_path
)
VALUES
    (
        '00000000-0000-0000-0019-000000000001',
        '00000000-0000-0000-0016-000000000001',
        '00000000-0000-0000-0002-000000000001',
        '2026-10-14',
        '2036-10-13',
        'active',
        'warranty-documents/Aarav_Sharma_Sungrow_10Y_Certificate.pdf'
    ),
    (
        '00000000-0000-0000-0019-000000000002',
        '00000000-0000-0000-0016-000000000002',
        '00000000-0000-0000-0002-000000000001',
        '2026-10-14',
        '2051-10-13',
        'active',
        'warranty-documents/Aarav_Sharma_Waaree_25Y_Performance_Warranty.pdf'
    )
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 18. TELEMETRY (Inverter Time-Series Readings)
-- ------------------------------------------------------------------------------
INSERT INTO telemetry (id, equipment_id, timestamp, voltage, current, power, temperature, energy_generated_kwh, source)
VALUES
    (
        '00000000-0000-0000-0020-000000000001',
        '00000000-0000-0000-0016-000000000001',
        '2026-10-20 09:00:00+05:30',
        428.500,
        5.100,
        2185.350,
        34.20,
        3.420,
        'iot_gateway'
    ),
    (
        '00000000-0000-0000-0020-000000000002',
        '00000000-0000-0000-0016-000000000001',
        '2026-10-20 12:00:00+05:30',
        432.100,
        12.800,
        5530.880,
        42.50,
        15.820,
        'iot_gateway'
    ),
    (
        '00000000-0000-0000-0020-000000000003',
        '00000000-0000-0000-0016-000000000001',
        '2026-10-20 15:00:00+05:30',
        430.200,
        9.400,
        4043.880,
        40.10,
        24.650,
        'iot_gateway'
    ),
    (
        '00000000-0000-0000-0020-000000000004',
        '00000000-0000-0000-0016-000000000001',
        '2026-10-20 18:00:00+05:30',
        395.000,
        0.800,
        316.000,
        31.00,
        28.420,
        'iot_gateway'
    )
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 19. SERVICE TICKETS (Post-Commissioning Maintenance)
-- ------------------------------------------------------------------------------
INSERT INTO service_tickets (
    id, ticket_number, customer_id, project_id, equipment_id, issue_description,
    issue_category, priority, assigned_technician_id, ticket_status, resolution_notes,
    created_at, resolved_at
)
VALUES
    (
        '00000000-0000-0000-0021-000000000001',
        'TKT-2026-0001',
        '00000000-0000-0000-0002-000000000001',
        '00000000-0000-0000-0005-000000000001',
        '00000000-0000-0000-0016-000000000001',
        'WiFi telemetry dongle disconnected after customer router password update',
        'wiring_issue',
        'low',
        '00000000-0000-0000-0001-000000000010',
        'resolved',
        'Reconfigured WiFi SSID & password via Sungrow iSolarCloud app. Data streaming re-established.',
        '2026-10-25 10:00:00+05:30',
        '2026-10-25 15:45:00+05:30'
    ),
    (
        '00000000-0000-0000-0021-000000000002',
        'TKT-2026-0002',
        '00000000-0000-0000-0002-000000000001',
        '00000000-0000-0000-0005-000000000001',
        NULL,
        'Quarterly preventive maintenance and solar panel cleaning scheduled',
        'routine_maintenance',
        'low',
        '00000000-0000-0000-0001-000000000010',
        'open',
        NULL,
        '2026-11-15 09:30:00+05:30',
        NULL
    )
ON CONFLICT (id) DO UPDATE SET
    ticket_status = EXCLUDED.ticket_status;

-- ------------------------------------------------------------------------------
-- 20. AUDIT LOGS (Operational History)
-- ------------------------------------------------------------------------------
INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, metadata, created_at)
VALUES
    (
        '00000000-0000-0000-0022-000000000001',
        '00000000-0000-0000-0001-000000000003',
        'lead_converted_to_project',
        'leads',
        '00000000-0000-0000-0004-000000000001',
        '{"lead_number": "LEAD-2026-0001", "created_project_number": "PRJ-2026-0001"}'::jsonb,
        '2026-09-10 16:30:00+05:30'
    ),
    (
        '00000000-0000-0000-0022-000000000002',
        '00000000-0000-0000-0001-000000000007',
        'survey_approved',
        'site_surveys',
        '00000000-0000-0000-0009-000000000001',
        '{"status": "approved", "verified_roof_area_sqm": 132.8}'::jsonb,
        '2026-09-13 14:00:00+05:30'
    ),
    (
        '00000000-0000-0000-0022-000000000003',
        '00000000-0000-0000-0001-000000000008',
        'quotation_approved',
        'quotations',
        '00000000-0000-0000-0011-000000000001',
        '{"quotation_number": "QT-2026-0001", "total_amount_inr": 354000.00}'::jsonb,
        '2026-09-20 11:30:00+05:30'
    ),
    (
        '00000000-0000-0000-0022-000000000004',
        '00000000-0000-0000-0001-000000000010',
        'installation_commissioned',
        'installations',
        '00000000-0000-0000-0017-000000000001',
        '{"installation_number": "INST-2026-0001", "commissioning_passed": true}'::jsonb,
        '2026-10-14 17:00:00+05:30'
    )
ON CONFLICT (id) DO NOTHING;

COMMIT;
