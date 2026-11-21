# SolarOS Database Schema Specification

Platform: **PostgreSQL 15+ / Supabase**  
Primary Key Strategy: **UUID v4 (`gen_random_uuid()`)**  
Timestamp Standard: **UTC `TIMESTAMPTZ` with microsecond precision**  
Currency / Monetary Values: **`NUMERIC(14, 2)`**  
Coordinate Precision: **`NUMERIC(10, 7)` (WGS84)**

---

## 1. Schema Overview

SolarOS operates on a normalized relational architecture engineered to manage the entire lifecycle of distributed and utility-scale solar installations:

```
Customer Enquiry → Lead Intake → Property Assessment → Rooftop Imaging
  → AI Computer Vision Analysis → Solar Engineering Recommendation
  → Physical Site Survey → Quotation & Pricing → Milestone Payment
  → Warehouse Inventory Reservation → Equipment Serial Dispatch
  → Field Installation Execution → Quality Checklist Signoff
  → Warranty Activation → IoT Telemetry Ingestion → Service Ticketing & Maintenance
```

---

## 2. Table Specifications

### 2.1. `users` (Platform Staff & Field Engineers)
Internal operators, engineers, sales reps, technicians, and administrators. Passwords are never stored here (delegated to Supabase Auth).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique internal user identifier |
| `auth_user_id` | `UUID` | `UNIQUE` | Maps to Supabase `auth.users(id)` |
| `full_name` | `VARCHAR(150)` | `NOT NULL` | Employee full legal name |
| `email` | `VARCHAR(255)` | `UNIQUE NOT NULL` | Work email address (regex validated) |
| `phone` | `VARCHAR(20)` | `NULLABLE` | Contact telephone number |
| `role` | `VARCHAR(30)` | `NOT NULL, CHECK (role IN (...))` | Operational RBAC role |
| `is_active` | `BOOLEAN` | `NOT NULL DEFAULT TRUE` | Active employment / account status |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Record update timestamp |

**Allowed Roles**: `admin`, `director`, `sales`, `surveyor`, `engineer`, `finance`, `warehouse`, `technician`, `service_agent`.

---

### 2.2. `customers` (Property Owners & Commercial Entities)
Master profile for prospective or contracted solar buyers.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Customer primary key |
| `full_name` | `VARCHAR(150)` | `NOT NULL` | Customer individual / corporate name |
| `email` | `VARCHAR(255)` | `NULLABLE` | Contact email address |
| `phone` | `VARCHAR(20)` | `NOT NULL` | Primary mobile contact number |
| `alternate_phone` | `VARCHAR(20)` | `NULLABLE` | Secondary / emergency phone |
| `property_address` | `TEXT` | `NOT NULL` | Detailed street address |
| `city` | `VARCHAR(100)` | `NOT NULL` | Installation city |
| `state` | `VARCHAR(100)` | `NOT NULL` | Province / State |
| `postal_code` | `VARCHAR(10)` | `NOT NULL` | PIN / Postal code |
| `latitude` | `NUMERIC(10, 7)`| `CHECK (latitude BETWEEN -90 AND 90)` | WGS84 decimal latitude |
| `longitude` | `NUMERIC(10, 7)`| `CHECK (longitude BETWEEN -180 AND 180)` | WGS84 decimal longitude |
| `property_type` | `VARCHAR(50)` | `CHECK IN ('residential', 'commercial', ...)` | Classification |
| `notes` | `TEXT` | `NULLABLE` | Special site instructions |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Record update timestamp |

---

### 2.3. `leads` (Enquiry & Intake Pipeline)
Inbound commercial inquiries prior to formal project contracting.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Lead primary key |
| `lead_number` | `VARCHAR(50)` | `UNIQUE NOT NULL` | Human-readable lead code (`LEAD-2026-XXXX`) |
| `customer_id` | `UUID` | `NOT NULL REFERENCES customers(id) ON DELETE RESTRICT` | Associated customer |
| `source` | `VARCHAR(50)` | `DEFAULT 'website'` | Attribution channel |
| `monthly_electricity_bill`| `NUMERIC(12, 2)`| `CHECK (>= 0)` | Average monthly utility bill (INR) |
| `monthly_consumption_kwh` | `NUMERIC(12, 2)`| `CHECK (>= 0)` | Monthly energy consumption (kWh) |
| `estimated_system_capacity_kw` | `NUMERIC(10, 2)`| `CHECK (>= 0)` | Preliminary sizing estimate (kW) |
| `status` | `VARCHAR(40)` | `NOT NULL DEFAULT 'new'` | Status in sales funnel |
| `assigned_salesperson_id` | `UUID` | `REFERENCES users(id) ON DELETE SET NULL` | Assigned sales agent |
| `notes` | `TEXT` | `NULLABLE` | Sales notes & qualifying details |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Intake timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Stage change timestamp |

**Allowed Statuses**: `new`, `contacted`, `qualified`, `survey_scheduled`, `quotation_sent`, `converted`, `lost`.

---

### 2.4. `projects` (Solar Installation Lifecycle)
Central contract orchestrating field operations, commercial milestones, and logistics.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Project primary key |
| `project_number` | `VARCHAR(50)` | `UNIQUE NOT NULL` | Unique project identifier (`PRJ-2026-XXXX`) |
| `customer_id` | `UUID` | `NOT NULL REFERENCES customers(id) ON DELETE RESTRICT` | Project client owner |
| `lead_id` | `UUID` | `REFERENCES leads(id) ON DELETE SET NULL` | Source lead reference |
| `project_name` | `VARCHAR(200)` | `NOT NULL` | Project descriptive title |
| `proposed_capacity_kw` | `NUMERIC(10, 2)`| `CHECK (>= 0)` | Initial engineering proposal size (kW) |
| `approved_capacity_kw` | `NUMERIC(10, 2)`| `CHECK (>= 0)` | Final sanctioned capacity (kW) |
| `project_status` | `VARCHAR(50)` | `NOT NULL DEFAULT 'enquiry'` | Current milestone stage |
| `estimated_cost` | `NUMERIC(14, 2)`| `CHECK (>= 0)` | Pre-survey estimated price (INR) |
| `final_cost` | `NUMERIC(14, 2)`| `CHECK (>= 0)` | Final invoiced price (INR) |
| `expected_completion_date` | `DATE` | `NULLABLE` | Target commissioning date |
| `actual_completion_date` | `DATE` | `NULLABLE` | Official grid sync date |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Update timestamp |

**Allowed Statuses**: `enquiry`, `assessment`, `survey_pending`, `survey_approved`, `design_approved`, `quotation_pending`, `quotation_approved`, `payment_pending`, `ready_for_dispatch`, `installation_scheduled`, `installation_in_progress`, `completed`, `cancelled`.

---

### 2.5. `property_assessments` (Rooftop & Consumption Data)
Stores customer and surveyor self-service rooftop dimensions and energy usage.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Assessment primary key |
| `customer_id` | `UUID` | `NOT NULL REFERENCES customers(id) ON DELETE RESTRICT` | Property owner |
| `lead_id` | `UUID` | `REFERENCES leads(id) ON DELETE SET NULL` | Linked lead |
| `project_id` | `UUID` | `REFERENCES projects(id) ON DELETE SET NULL` | Linked project |
| `property_address`| `TEXT` | `NOT NULL` | Site address |
| `city` | `VARCHAR(100)` | `NOT NULL` | Site city |
| `state` | `VARCHAR(100)` | `NOT NULL` | Site state |
| `postal_code` | `VARCHAR(10)` | `NOT NULL` | PIN code |
| `latitude` | `NUMERIC(10, 7)`| `CHECK (BETWEEN -90 AND 90)` | Latitude |
| `longitude` | `NUMERIC(10, 7)`| `CHECK (BETWEEN -180 AND 180)`| Longitude |
| `roof_length` | `NUMERIC(10, 2)`| `CHECK (>= 0), NULLABLE` | Maximum length |
| `roof_width` | `NUMERIC(10, 2)`| `CHECK (>= 0), NULLABLE` | Maximum width |
| `roof_area` | `NUMERIC(12, 2)`| `CHECK (>= 0), NULLABLE` | Gross roof surface area |
| `usable_roof_area`| `NUMERIC(12, 2)`| `CHECK (<= roof_area), NULLABLE` | Unobstructed solar mounting area |
| `measurement_unit`| `VARCHAR(20)`| `DEFAULT 'sq_meters'` | `sq_meters`, `sq_feet`, `sq_yards` |
| `roof_type` | `VARCHAR(50)` | `NULLABLE` | `flat_concrete`, `tin_shed`, `tiled`, etc. |
| `roof_orientation`| `VARCHAR(30)` | `NULLABLE` | `south`, `south_west`, etc. |
| `roof_tilt` | `NUMERIC(6, 2)` | `CHECK (BETWEEN 0 AND 90), NULLABLE` | Pitch in degrees |
| `number_of_roof_sections` | `INTEGER` | `CHECK (>= 1) DEFAULT 1` | Distinct roof planes |
| `grid_availability` | `BOOLEAN` | `DEFAULT TRUE` | Stable grid connectivity |
| `monthly_bill` | `NUMERIC(12, 2)`| `CHECK (>= 0)` | Monthly utility bill (INR) |
| `monthly_consumption_kwh`| `NUMERIC(12, 2)`| `CHECK (>= 0)` | Monthly energy usage |
| `connection_phase`| `VARCHAR(30)` | `CHECK IN ('single_phase', 'three_phase')` | Electrical phase |
| `preferred_solar_type` | `VARCHAR(30)` | `CHECK IN ('on_grid', 'off_grid', 'hybrid')` | Desired topology |
| `budget` | `NUMERIC(14, 2)`| `CHECK (>= 0)` | Customer target expenditure |
| `assessment_status` | `VARCHAR(40)` | `NOT NULL DEFAULT 'draft'` | Assessment workflow status |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Update timestamp |

---

### 2.6. `assessment_images` (Rooftop & Document Photographs)
Stores references to images hosted in Supabase Storage. Binaries are never stored in PostgreSQL.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Image record primary key |
| `assessment_id` | `UUID` | `NOT NULL REFERENCES property_assessments(id) ON DELETE CASCADE` | Parent assessment |
| `file_path` | `TEXT` | `NOT NULL` | Supabase Storage bucket path |
| `file_name` | `VARCHAR(255)` | `NOT NULL` | Original filename |
| `mime_type` | `VARCHAR(100)` | `NOT NULL` | `image/jpeg`, `image/png`, `application/pdf` |
| `file_size_bytes` | `BIGINT` | `CHECK (> 0)` | Payload size in bytes |
| `image_type` | `VARCHAR(50)` | `CHECK IN (...)` | Visual classification |
| `uploaded_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Upload timestamp |

**Allowed Image Types**: `rooftop_full_view`, `rooftop_angle`, `obstacles`, `shaded_area`, `electricity_bill`, `switchboard_meter`, `other`.

---

### 2.7. `ai_analysis_results` (Future AI/ML Vision Inference Storage)
Structured JSONB storage for CV rooftop segmentation models developed by the AI/ML developer.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | AI inference primary key |
| `assessment_id` | `UUID` | `NOT NULL REFERENCES property_assessments(id) ON DELETE CASCADE` | Evaluated assessment |
| `model_name` | `VARCHAR(100)` | `NOT NULL` | Model architecture (e.g. `YOLOv8-Rooftop-Seg`) |
| `model_version` | `VARCHAR(100)` | `NOT NULL` | SemVer model release |
| `analysis_status` | `VARCHAR(40)` | `NOT NULL DEFAULT 'completed'` | `pending`, `processing`, `completed`, `failed` |
| `detected_obstacles` | `JSONB` | `DEFAULT '[]'::jsonb` | Obstacle bounding boxes, masks, areas |
| `detected_shading_regions` | `JSONB`| `DEFAULT '[]'::jsonb` | Polygon coordinates of shaded zones |
| `estimated_usable_area` | `NUMERIC(12, 2)`| `CHECK (>= 0)` | ML calculated shade-free area ($m^2$) |
| `proposed_panel_layout` | `JSONB`| `DEFAULT '{}'::jsonb` | Recommended panel coordinates & count |
| `confidence` | `NUMERIC(5, 4)` | `CHECK (BETWEEN 0.0000 AND 1.0000)` | Normalized inference score |
| `missing_information` | `JSONB`| `DEFAULT '[]'::jsonb` | Identified data gaps |
| `raw_result_json` | `JSONB`| `DEFAULT '{}'::jsonb` | Full model payload |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Inference run timestamp |

---

### 2.8. `site_surveys` (Physical On-Site Technical Audit)
Field engineer site measurements, structural load checks, and cable route audits.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Survey primary key |
| `project_id` | `UUID` | `NOT NULL REFERENCES projects(id) ON DELETE RESTRICT` | Target project |
| `assessment_id` | `UUID` | `REFERENCES property_assessments(id) ON DELETE SET NULL` | Baseline assessment |
| `surveyor_id` | `UUID` | `NOT NULL REFERENCES users(id) ON DELETE RESTRICT` | Assigned field engineer |
| `scheduled_date` | `TIMESTAMPTZ` | `NOT NULL` | Planned audit timestamp |
| `actual_survey_date` | `TIMESTAMPTZ` | `NULLABLE` | Actual execution timestamp |
| `verified_roof_area` | `NUMERIC(12, 2)`| `CHECK (>= 0)` | Laser-verified area ($m^2$) |
| `verified_roof_orientation` | `VARCHAR(30)`| `NULLABLE` | Compass azimuth verified |
| `verified_roof_tilt` | `NUMERIC(6, 2)` | `CHECK (BETWEEN 0 AND 90)` | Inclinometer tilt degrees |
| `structural_observations` | `TEXT` | `NULLABLE` | Slab thickness, integrity notes |
| `shading_observations` | `TEXT` | `NULLABLE` | Parapet, tree, chimney shadows |
| `cable_distance` | `NUMERIC(10, 2)`| `CHECK (>= 0)` | DC cable length to inverter (m) |
| `electrical_observations` | `TEXT` | `NULLABLE` | Sanctioned load, earthing condition |
| `safety_observations` | `TEXT` | `NULLABLE` | Fall protection, ladder access |
| `approval_status` | `VARCHAR(30)` | `NOT NULL DEFAULT 'pending'` | `pending`, `approved`, `rejected`, `revision_required` |
| `rejection_reason` | `TEXT` | `NULLABLE` | Detail if survey rejected |
| `approved_by` | `UUID` | `REFERENCES users(id) ON DELETE SET NULL` | Reviewing senior engineer |
| `approved_at` | `TIMESTAMPTZ` | `NULLABLE` | Engineering signoff timestamp |
| `remarks` | `TEXT` | `NULLABLE` | General survey remarks |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Update timestamp |

---

### 2.9. `products` (Master Hardware Catalog)
Panels, inverters, batteries, BOS, mounting kits, and balance of system items.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Product primary key |
| `sku` | `VARCHAR(80)` | `UNIQUE NOT NULL` | Stock Keeping Unit code |
| `product_name` | `VARCHAR(200)` | `NOT NULL` | Commercial product name |
| `brand` | `VARCHAR(100)` | `NOT NULL` | Manufacturer brand name |
| `model` | `VARCHAR(100)` | `NOT NULL` | Factory model number |
| `category` | `VARCHAR(60)` | `NOT NULL, CHECK (category IN (...))` | Equipment category |
| `rated_power_w` | `NUMERIC(10, 2)`| `CHECK (>= 0), NULLABLE` | Nominal power rating (W) |
| `voltage` | `NUMERIC(10, 2)`| `CHECK (>= 0), NULLABLE` | Nominal voltage (V) |
| `current` | `NUMERIC(10, 2)`| `CHECK (>= 0), NULLABLE` | Nominal current (A) |
| `technical_specifications` | `JSONB`| `DEFAULT '{}'::jsonb` | Efficiency, dimensions, cell type |
| `purchase_price` | `NUMERIC(14, 2)`| `NOT NULL, CHECK (>= 0)` | Procurement cost (INR) |
| `selling_price` | `NUMERIC(14, 2)`| `NOT NULL, CHECK (>= 0)` | Catalog sale price (INR) |
| `warranty_months` | `INTEGER` | `NOT NULL DEFAULT 60, CHECK (>= 0)` | Standard manufacturer warranty |
| `is_active` | `BOOLEAN` | `NOT NULL DEFAULT TRUE` | Available for quotation |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Catalog creation date |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Catalog update date |

**Allowed Categories**: `solar_panel`, `inverter`, `battery`, `charge_controller`, `mounting_structure`, `cable`, `protection_device`, `accessory`.

---

### 2.10. `solar_recommendations` (System Sizing & ROI Financial Model)
Electrical system configuration, estimated annual yield, and payback period.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Recommendation primary key |
| `assessment_id` | `UUID` | `NOT NULL REFERENCES property_assessments(id) ON DELETE CASCADE` | Source assessment |
| `project_id` | `UUID` | `REFERENCES projects(id) ON DELETE SET NULL` | Linked project |
| `system_capacity_kw` | `NUMERIC(10, 2)`| `NOT NULL, CHECK (>= 0)` | Sized DC capacity (kW) |
| `estimated_generation_kwh`| `NUMERIC(12, 2)`| `NOT NULL, CHECK (>= 0)` | Annual energy output (kWh) |
| `estimated_monthly_savings`| `NUMERIC(12, 2)`| `NOT NULL, CHECK (>= 0)` | Monthly financial savings (INR) |
| `estimated_payback_years` | `NUMERIC(8, 2)` | `NOT NULL, CHECK (>= 0)` | ROI breakeven timeframe (Years) |
| `recommendation_source` | `VARCHAR(30)` | `NOT NULL DEFAULT 'engineering'` | `engineering`, `ai_model`, `hybrid` |
| `assumptions` | `JSONB` | `DEFAULT '{}'::jsonb` | Tariff, degradation rate, sun hours |
| `warnings` | `JSONB` | `DEFAULT '[]'::jsonb` | Sizing or physical constraints |
| `configuration` | `JSONB` | `DEFAULT '{}'::jsonb` | String sizing and topology |
| `bom` | `JSONB` | `DEFAULT '[]'::jsonb` | Proposed itemized equipment list |
| `approval_status` | `VARCHAR(30)` | `NOT NULL DEFAULT 'draft'` | `draft`, `accepted`, `rejected`, `superseded` |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Calculation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Revision timestamp |

---

### 2.11. `quotations` & `quotation_items` (Commercial Proposals)
Legally binding price proposals and itemized equipment bills of material.

#### `quotations`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Quotation primary key |
| `quotation_number` | `VARCHAR(50)` | `UNIQUE NOT NULL` | Number (`QT-2026-XXXX`) |
| `project_id` | `UUID` | `NOT NULL REFERENCES projects(id) ON DELETE RESTRICT` | Target project |
| `customer_id` | `UUID` | `NOT NULL REFERENCES customers(id) ON DELETE RESTRICT` | Customer billed |
| `system_capacity_kw` | `NUMERIC(10, 2)`| `NOT NULL, CHECK (>= 0)` | Quoted DC size |
| `subtotal` | `NUMERIC(14, 2)`| `NOT NULL, CHECK (>= 0)` | Hardware subtotal |
| `discount` | `NUMERIC(14, 2)`| `NOT NULL DEFAULT 0.00, CHECK (discount <= subtotal)` | Commercial discount |
| `gst_amount` | `NUMERIC(14, 2)`| `NOT NULL DEFAULT 0.00, CHECK (>= 0)` | GST tax amount |
| `installation_charges`| `NUMERIC(14, 2)`| `NOT NULL DEFAULT 0.00, CHECK (>= 0)` | Labor and EPC charges |
| `total_amount` | `NUMERIC(14, 2)`| `NOT NULL, CHECK (>= 0)` | Final net invoice amount |
| `quotation_status` | `VARCHAR(30)` | `NOT NULL DEFAULT 'draft'` | `draft`, `sent`, `approved`, `rejected`, `expired` |
| `valid_until` | `DATE` | `NOT NULL` | Quotation expiry date |
| `approved_at` | `TIMESTAMPTZ` | `NULLABLE` | Customer signoff timestamp |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Modification timestamp |

#### `quotation_items`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Item primary key |
| `quotation_id` | `UUID` | `NOT NULL REFERENCES quotations(id) ON DELETE CASCADE` | Parent quotation |
| `product_id` | `UUID` | `NOT NULL REFERENCES products(id) ON DELETE RESTRICT` | Hardware product |
| `description` | `TEXT` | `NOT NULL` | Line item description |
| `quantity` | `NUMERIC(12, 2)`| `NOT NULL, CHECK (> 0)` | Quantity ordered |
| `unit_price` | `NUMERIC(14, 2)`| `NOT NULL, CHECK (>= 0)` | Unit sale price |
| `total_price` | `NUMERIC(14, 2)`| `NOT NULL, CHECK (>= 0)` | Line total (`qty * unit_price`) |

---

### 2.12. `payments` (Milestones & Inbound Transactions)
Records customer advances, milestone tranches, and bank remittances (PCI-DSS compliant: no credit card numbers stored).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Payment primary key |
| `project_id` | `UUID` | `NOT NULL REFERENCES projects(id) ON DELETE RESTRICT` | Associated project |
| `quotation_id` | `UUID` | `REFERENCES quotations(id) ON DELETE SET NULL` | Associated quotation |
| `amount` | `NUMERIC(14, 2)`| `NOT NULL, CHECK (> 0)` | Payment amount received (INR) |
| `payment_method` | `VARCHAR(40)` | `NOT NULL, CHECK IN ('neft', 'rtgs', 'upi', ...)` | Payment rail |
| `transaction_reference` | `VARCHAR(150)`| `NOT NULL` | Bank UTR / UPI Ref ID / Cheque # |
| `payment_status` | `VARCHAR(30)` | `NOT NULL DEFAULT 'pending'` | `pending`, `completed`, `failed`, `refunded` |
| `payment_date` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Remittance date |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Ledger entry timestamp |

---

### 2.13. `inventory` & `inventory_movements` (Warehouse Logistics)
Real-time physical stock counts, reservations, and immutable movement ledger.

#### `inventory`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Inventory primary key |
| `product_id` | `UUID` | `NOT NULL REFERENCES products(id) ON DELETE RESTRICT` | Hardware product |
| `warehouse_name` | `VARCHAR(150)` | `NOT NULL` | Facility name (e.g. Ludhiana Main) |
| `quantity_on_hand` | `NUMERIC(12, 2)`| `NOT NULL DEFAULT 0.00, CHECK (>= 0)` | Physical quantity in warehouse |
| `quantity_reserved`| `NUMERIC(12, 2)`| `NOT NULL DEFAULT 0.00, CHECK (<= quantity_on_hand)` | Allocated to approved projects |
| `reorder_level` | `NUMERIC(12, 2)`| `NOT NULL DEFAULT 5.00, CHECK (>= 0)` | Automatic reorder threshold |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Stock adjustment timestamp |

*Available Stock Calculation*: `available_stock = quantity_on_hand - quantity_reserved`  
*Unique Constraint*: `UNIQUE (product_id, warehouse_name)`

#### `inventory_movements`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Movement ledger primary key |
| `product_id` | `UUID` | `NOT NULL REFERENCES products(id) ON DELETE RESTRICT` | Hardware product |
| `inventory_id` | `UUID` | `NOT NULL REFERENCES inventory(id) ON DELETE RESTRICT` | Warehouse inventory record |
| `movement_type` | `VARCHAR(30)` | `NOT NULL, CHECK IN (...)` | `purchase`, `reservation`, `release`, `dispatch`, `return`, `adjustment` |
| `quantity` | `NUMERIC(12, 2)`| `NOT NULL, CHECK (> 0)` | Quantity moved |
| `reference_type` | `VARCHAR(50)` | `NULLABLE` | `project`, `purchase_order`, etc. |
| `reference_id` | `UUID` | `NULLABLE` | UUID of linked entity |
| `performed_by` | `UUID` | `REFERENCES users(id) ON DELETE SET NULL` | Warehouse staff user |
| `notes` | `TEXT` | `NULLABLE` | Dispatch / receipt explanation |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Ledger timestamp |

---

### 2.14. `equipment` (Serialized Hardware Units)
Tracks individual physical panels, inverters, and batteries by unique manufacturer serial number.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Equipment unit primary key |
| `product_id` | `UUID` | `NOT NULL REFERENCES products(id) ON DELETE RESTRICT` | Master catalog product |
| `serial_number` | `VARCHAR(150)`| `UNIQUE NOT NULL` | Factory serial barcode / QR code |
| `supplier` | `VARCHAR(150)`| `NOT NULL` | Vendor entity |
| `purchase_date` | `DATE` | `NOT NULL` | Factory invoice date |
| `warranty_start_date` | `DATE` | `NULLABLE` | Warranty activation date |
| `warranty_end_date` | `DATE` | `NULLABLE, CHECK (warranty_end_date >= warranty_start_date)` | Expiry date |
| `equipment_status` | `VARCHAR(40)` | `NOT NULL DEFAULT 'in_stock'` | `in_stock`, `reserved`, `dispatched`, `installed`, `under_service`, `decommissioned` |
| `project_id` | `UUID` | `REFERENCES projects(id) ON DELETE SET NULL` | Assigned project |
| `installation_id` | `UUID` | `REFERENCES installations(id) ON DELETE SET NULL` | Target field installation |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Unit creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Unit status update timestamp |

---

### 2.15. `installations` & `installation_checklist` (Field Execution & QA)
Field installation execution, crew scheduling, commissioning tests, and SOP checklists.

#### `installations`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Installation primary key |
| `project_id` | `UUID` | `NOT NULL REFERENCES projects(id) ON DELETE RESTRICT` | Target project |
| `installation_number`| `VARCHAR(50)` | `UNIQUE NOT NULL` | Number (`INST-2026-XXXX`) |
| `assigned_technician_id`| `UUID` | `REFERENCES users(id) ON DELETE SET NULL` | Lead technician |
| `scheduled_date` | `TIMESTAMPTZ` | `NOT NULL` | Scheduled site start time |
| `start_time` | `TIMESTAMPTZ` | `NULLABLE` | Actual physical work start |
| `completion_time`| `TIMESTAMPTZ` | `NULLABLE, CHECK (completion_time >= start_time)` | Testing completion time |
| `installation_status`| `VARCHAR(40)` | `NOT NULL DEFAULT 'scheduled'` | `scheduled`, `in_progress`, `testing`, `completed`, `on_hold`, `cancelled` |
| `progress_percentage`| `NUMERIC(5, 2)`| `NOT NULL DEFAULT 0.00, CHECK (BETWEEN 0 AND 100)` | Work completion % |
| `system_capacity_kw` | `NUMERIC(10, 2)`| `NOT NULL, CHECK (>= 0)` | Installed DC capacity |
| `testing_results` | `JSONB` | `DEFAULT '{}'::jsonb` | Voc, Isc, Earth resistance test values |
| `customer_confirmation`| `BOOLEAN` | `DEFAULT FALSE` | Customer signoff approval |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Status update timestamp |

#### `installation_checklist`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Checklist task primary key |
| `installation_id` | `UUID` | `NOT NULL REFERENCES installations(id) ON DELETE CASCADE` | Parent installation |
| `task_name` | `VARCHAR(200)` | `NOT NULL` | SOP task description |
| `is_completed` | `BOOLEAN` | `NOT NULL DEFAULT FALSE` | Completion checkbox |
| `completed_by` | `UUID` | `REFERENCES users(id) ON DELETE SET NULL` | Electrician / technician user |
| `completed_at` | `TIMESTAMPTZ` | `NULLABLE` | Completion timestamp |
| `remarks` | `TEXT` | `NULLABLE` | Technical observations |

---

### 2.16. `warranties` (Active Certificates & Guarantees)
Guarantees and warranties linked to specific customer accounts and serialized equipment.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Warranty record primary key |
| `equipment_id` | `UUID` | `NOT NULL REFERENCES equipment(id) ON DELETE RESTRICT` | Covered equipment |
| `customer_id` | `UUID` | `NOT NULL REFERENCES customers(id) ON DELETE RESTRICT` | Beneficiary customer |
| `warranty_start_date` | `DATE` | `NOT NULL` | Effective start date |
| `warranty_end_date` | `DATE` | `NOT NULL, CHECK (warranty_end_date >= warranty_start_date)` | Expiry date |
| `warranty_status` | `VARCHAR(30)` | `NOT NULL DEFAULT 'active'` | `active`, `expired`, `claimed`, `void` |
| `warranty_document_path`| `TEXT` | `NULLABLE` | Supabase Storage PDF path |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Creation timestamp |

---

### 2.17. `telemetry` (IoT Inverter Readings)
High-frequency time-series inverter output metrics to support operational dashboards and future anomaly detection models.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Telemetry primary key |
| `equipment_id` | `UUID` | `NOT NULL REFERENCES equipment(id) ON DELETE CASCADE` | Inverter unit |
| `timestamp` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Measurement timestamp |
| `voltage` | `NUMERIC(12, 3)`| `CHECK (>= 0), NULLABLE` | AC output voltage (V) |
| `current` | `NUMERIC(12, 3)`| `CHECK (>= 0), NULLABLE` | AC output current (A) |
| `power` | `NUMERIC(12, 3)`| `CHECK (>= 0), NULLABLE` | Instantaneous active power (W) |
| `temperature` | `NUMERIC(8, 2)` | `NULLABLE` | Inverter heatsink temperature (°C) |
| `energy_generated_kwh` | `NUMERIC(12, 3)`| `CHECK (>= 0), NULLABLE` | Cumulative daily yield (kWh) |
| `source` | `VARCHAR(50)` | `DEFAULT 'iot_gateway'` | Data source |

---

### 2.18. `service_tickets` (Support & Post-Commissioning Maintenance)
Corrective and preventive maintenance tickets, customer complaints, and IoT fault alarms.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Ticket primary key |
| `ticket_number` | `VARCHAR(50)` | `UNIQUE NOT NULL` | Human-readable ticket number (`TKT-2026-XXXX`) |
| `customer_id` | `UUID` | `NOT NULL REFERENCES customers(id) ON DELETE RESTRICT` | Customer reporting issue |
| `project_id` | `UUID` | `REFERENCES projects(id) ON DELETE SET NULL` | Linked solar plant |
| `equipment_id` | `UUID` | `REFERENCES equipment(id) ON DELETE SET NULL` | Faulty equipment |
| `issue_description` | `TEXT` | `NOT NULL` | Problem description |
| `issue_category` | `VARCHAR(50)` | `NOT NULL, CHECK IN (...)` | Classification |
| `priority` | `VARCHAR(20)` | `NOT NULL DEFAULT 'medium', CHECK IN (...)` | `low`, `medium`, `high`, `critical` |
| `assigned_technician_id`| `UUID` | `REFERENCES users(id) ON DELETE SET NULL` | Assigned technician |
| `ticket_status` | `VARCHAR(40)` | `NOT NULL DEFAULT 'open', CHECK IN (...)` | `open`, `assigned`, `in_progress`, `pending_parts`, `resolved`, `closed` |
| `resolution_notes` | `TEXT` | `NULLABLE` | Technician corrective action notes |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Creation timestamp |
| `resolved_at` | `TIMESTAMPTZ` | `NULLABLE, CHECK (resolved_at >= created_at)` | Closure timestamp |

**Allowed Categories**: `inverter_fault`, `panel_damage`, `generation_drop`, `wiring_issue`, `physical_damage`, `routine_maintenance`, `other`.

---

### 2.19. `audit_logs` (Immutable Operational Ledger)
Security and compliance audit trail of critical operational actions.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Audit log primary key |
| `user_id` | `UUID` | `REFERENCES users(id) ON DELETE SET NULL` | Acting staff member |
| `action` | `VARCHAR(100)` | `NOT NULL` | Action code (e.g. `quotation_approved`) |
| `entity_type` | `VARCHAR(100)` | `NOT NULL` | Table affected (e.g. `quotations`) |
| `entity_id` | `UUID` | `NOT NULL` | Primary key of affected row |
| `metadata` | `JSONB` | `DEFAULT '{}'::jsonb` | Contextual diff / state snapshot |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Event timestamp |
