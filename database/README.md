# SolarOS Database Infrastructure

**Enterprise PostgreSQL 15+ / Supabase Database Architecture for Solar Installation ERP**

---

## 1. Overview

SolarOS is an enterprise ERP platform designed to manage the full solar installation lifecycle: from inbound customer lead intake, rooftop photography, and AI computer vision analysis, to physical site surveys, quotations, milestone payments, warehouse inventory, serialized equipment tracking, field installations, IoT telemetry monitoring, and post-commissioning maintenance.

This directory contains the complete database infrastructure, SQL migrations, seed datasets, schema definitions, and integration contracts.

---

## 2. Directory Layout

```text
database/
├── migrations/                           # Ordered, incremental migration scripts
│   ├── 001_create_extensions.sql         # PostgreSQL extensions & trigger helpers
│   ├── 002_create_users.sql              # Internal staff & RBAC roles
│   ├── 003_create_customers.sql          # Customer & property owner accounts
│   ├── 004_create_leads.sql              # Inbound customer enquiry pipeline
│   ├── 005_create_projects.sql           # Solar installation project lifecycle
│   ├── 006_create_assessments.sql        # Rooftop dimensions & consumption data
│   ├── 007_create_assessment_images.sql  # Supabase Storage image metadata
│   ├── 008_create_ai_analysis_results.sql# AI model inference result storage
│   ├── 009_create_surveys.sql            # On-site physical engineering audits
│   ├── 010_create_products.sql           # Master hardware & equipment catalog
│   ├── 011_create_recommendations.sql    # Solar sizing & ROI financial models
│   ├── 012_create_quotations.sql         # Commercial bids & quotation items
│   ├── 013_create_payments.sql           # Milestone transactions & bank records
│   ├── 014_create_inventory.sql          # Warehouse stock & movement ledger
│   ├── 015_create_equipment.sql          # Serialized physical hardware units
│   ├── 016_create_installations.sql      # Field installation & SOP checklist
│   ├── 017_create_warranties.sql         # Equipment warranty certificates
│   ├── 018_create_telemetry.sql          # Inverter IoT time-series readings
│   ├── 019_create_service_tickets.sql    # Maintenance & support tickets
│   ├── 020_create_audit_logs.sql         # Immutable operational audit trail
│   ├── 021_create_indexes.sql            # High-traffic query performance indexes
│   └── 022_create_security_policies.sql  # Row Level Security (RLS) policies
│
├── schema.sql                            # Complete consolidated schema (Migrations 001-022)
├── seed.sql                              # Realistic fictional Indian business seed fixtures
├── reset.sql                             # Safe teardown and schema reset script
│
├── docs/                                 # Complete technical documentation suite
│   ├── database-schema.md                # Full table, column, and constraint specifications
│   ├── er-diagram.md                     # Comprehensive Mermaid ER diagram
│   ├── table-documentation.md            # Granular operational guide for every table
│   ├── relationships.md                  # Cardinalities, foreign keys & delete behaviors
│   ├── database-setup.md                 # Supabase setup, storage buckets & deployment
│   ├── api-database-contract.md          # Binding backend & frontend schema contract
│   └── data-dictionary.md                # Field-by-field reference dictionary
│
└── tests/                                # Database validation scripts
    └── verify_schema.sql                 # Integrity and validation test suite
```

---

## 3. Quickstart: Running on Supabase

### Step 1: Connect to Supabase
Retrieve your database connection string from the Supabase Dashboard:
`postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### Step 2: Apply the Schema
Run `database/schema.sql` via `psql` or paste it directly into the Supabase SQL Editor:
```bash
psql "$DATABASE_URL" -f database/schema.sql
```

### Step 3: Populate Seed Data
Execute `database/seed.sql` to load realistic Indian solar operational test fixtures:
```bash
psql "$DATABASE_URL" -f database/seed.sql
```

### Step 4: Configure Storage Buckets
Create the 6 required private storage buckets in Supabase Storage:
- `rooftop-images`
- `survey-images`
- `installation-images`
- `electricity-bills`
- `quotation-documents`
- `warranty-documents`

See [database-setup.md](file:///d:/Solar-os/database/docs/database-setup.md) for detailed bucket policies.

---

## 4. Key Design Principles

1. **UUID Primary Keys**: Every table uses `UUID DEFAULT gen_random_uuid()` to prevent enumeration attacks and support distributed ingestion.
2. **Data Integrity & Physical Constraints**:
   - Rooftop dimensions and areas cannot be negative.
   - `usable_roof_area <= roof_area`.
   - Roof tilt must lie between 0° and 90°.
   - GPS coordinates enforce valid geographic limits (Latitude: -90° to +90°, Longitude: -180° to +180°).
   - Inventory reservation enforces `quantity_reserved <= quantity_on_hand` to prevent negative stock.
3. **Protection of Historical & Financial Records**:
   - `ON DELETE RESTRICT` is strictly applied on `customers`, `projects`, `quotations`, `payments`, `equipment`, and `warranties` to prevent cascading deletions from wiping audit or financial history.
4. **Decoupled Future AI Integration**:
   - The `ai_analysis_results` table provides structured JSONB fields for detected obstacles, shading zones, and panel layout grids, ready for the AI/ML developer to plug in inference models without schema redesign.
5. **Row Level Security (RLS)**:
   - Configured across all 22 tables. Full access is granted to the FastAPI backend via `service_role`, with role-based policies for sales, surveyors, technicians, warehouse staff, finance, and customers.

---

## 5. Team Integration Links

- **Backend Developer (FastAPI)**: Refer to [api-database-contract.md](file:///d:/Solar-os/database/docs/api-database-contract.md) for table names, field types, status enums, and SQLAlchemy ORM patterns.
- **Frontend Developer (Next.js)**: Refer to [api-database-contract.md](file:///d:/Solar-os/database/docs/api-database-contract.md) for complete TypeScript interface definitions.
- **AI/ML Developer**: Refer to [database-schema.md#27-ai_analysis_results](file:///d:/Solar-os/database/docs/database-schema.md) for inference storage specs.
