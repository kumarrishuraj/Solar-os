# SolarOS Granular Table Documentation

This guide provides deep operational context for all 22 database tables in SolarOS: their business purpose, lifecycle placement, access rules, indexing rationale, and transactional behavior.

---

## 1. Core Platform & Identity

### `users`
- **Business Role**: Stores staff identities (executives, sales reps, engineers, field surveyors, warehouse managers, electricians, support agents).
- **Authentication**: Integrates with Supabase Auth via `auth_user_id`. Passwords, salt, and OAuth tokens reside securely inside the `auth.users` schema.
- **Triggers**: Auto-updates `updated_at` on modification.
- **Security**: Strict RLS policies restrict row updates to Admins, Directors, or the user themselves.

### `customers`
- **Business Role**: Accounts for property owners and commercial clients.
- **Lifecycle**: Created when a lead submits their details or during commercial qualification.
- **Data Integrity**: Enforces valid geographical ranges for latitude (-90 to +90) and longitude (-180 to +180).
- **Deletion Safety**: `ON DELETE RESTRICT` ensures customers with active projects, bids, or warranties cannot be accidentally deleted.

---

## 2. Ingestion & Pre-Sales CRM

### `leads`
- **Business Role**: Ingestion point for prospective solar customers.
- **Lifecycle**: `new` -> `contacted` -> `qualified` -> `survey_scheduled` -> `quotation_sent` -> `converted` (or `lost`).
- **Indexes**: Indexed on `status`, `assigned_salesperson_id`, and `created_at DESC` for fast CRM filtering.

### `projects`
- **Business Role**: The central operating entity representing the installation project.
- **Lifecycle**: Progresses through 13 discrete operational milestones from initial enquiry to final grid sync commissioning.
- **Integrity**: Enforces non-negative capacity and cost numbers.

---

## 3. Site Engineering & AI Feasibility

### `property_assessments`
- **Business Role**: Captures self-service or surveyor-gathered rooftop dimensions, tilt, orientation, and discom electricity tariffs.
- **Special Design Rule**: Dimensions may be unknown at early lead stages; all physical dimensions allow `NULL` to avoid inserting fake measurements.
- **Validation**: Enforces `usable_roof_area <= roof_area` when both values are provided.

### `assessment_images`
- **Business Role**: Stores object keys referencing rooftop photographs, drone imagery, and electricity bill PDFs.
- **Storage Strategy**: Actual binaries reside in Supabase Storage (`rooftop-images`, `electricity-bills`). PostgreSQL only stores metadata, MIME types, and relative file paths.

### `ai_analysis_results`
- **Business Role**: Future integration target for the independent AI/ML developer.
- **Schema**: Flexible `JSONB` structures for detected obstacle bounding boxes, shading polygons, and panel layout grids. Normalized confidence score (0.0000 to 1.0000).

### `site_surveys`
- **Business Role**: The legal and physical engineering site audit performed by a field surveyor with a laser distometer and inclinometer.
- **Approval Flow**: `pending` -> `approved` or `rejected` with explicit signoff by a reviewing engineer (`approved_by`, `approved_at`).

---

## 4. Hardware Catalog & System Design

### `products`
- **Business Role**: Master item catalog of PV modules, inverters, batteries, structures, cables, and BOS.
- **Pricing**: Retains both procurement `purchase_price` and catalog `selling_price` for gross margin analysis.
- **Indexes**: Unique index on `sku` and category index.

### `solar_recommendations`
- **Business Role**: Mathematical solar sizing proposal calculating estimated annual generation (kWh), monthly bill savings (INR), and financial payback period (years).
- **Source Attribution**: Tracks whether the recommendation was generated via engineering rules, future AI models, or hybrid algorithms.

---

## 5. Commercial, Contracts & Finance

### `quotations`
- **Business Role**: Legally binding commercial proposal submitted to the customer.
- **Taxation**: Calculates pre-tax subtotal, commercial discounts, GST tax, and EPC installation charges.

### `quotation_items`
- **Business Role**: Itemized hardware bill of materials (BOM) belonging to a quotation.
- **Integrity**: Enforces `quantity > 0` and positive line prices.

### `payments`
- **Business Role**: Records customer milestone deposits and bank remittances.
- **Compliance**: PCI-DSS compliant. Never stores credit card numbers, CVVs, or debit PINs. Uses transaction reference numbers (UTR, UPI IDs).

---

## 6. Supply Chain & Hardware Assets

### `inventory`
- **Business Role**: Real-time stock counts by product and physical warehouse.
- **Calculation**: `available_stock = quantity_on_hand - quantity_reserved`.
- **Constraint**: `CHECK (quantity_reserved <= quantity_on_hand)` prevents overselling inventory.

### `inventory_movements`
- **Business Role**: Immutable transaction ledger for every physical stock movement (purchases, reservations, dispatches, returns).

### `equipment`
- **Business Role**: Tracks each physical hardware unit by its manufacturer serial number.
- **Lifecycle**: `in_stock` -> `reserved` -> `dispatched` -> `installed` -> `under_service` -> `decommissioned`.

---

## 7. Field Installation & Quality Assurance

### `installations`
- **Business Role**: Tracks field operations, technician dispatch, scheduled dates, and grid sync testing.
- **Progress**: Enforces `progress_percentage` between 0.00 and 100.00.

### `installation_checklist`
- **Business Role**: SOP quality tasks (waterproofing, torque testing, earthing resistance < 2 ohms, anti-islanding test).

---

## 8. Monitoring & Post-Commissioning

### `warranties`
- **Business Role**: Active OEM and EPC warranty certificates mapped to serial hardware units.

### `telemetry`
- **Business Role**: Time-series inverter output metrics (voltage, current, power, temperature, kWh).
- **Optimization**: Composite index on `(equipment_id, timestamp DESC)` ensures instant time-window dashboard queries.

### `service_tickets`
- **Business Role**: Corrective and preventive maintenance tickets.
- **Categorization**: Classifies faults (inverter fault, panel damage, generation drop, wiring issue).

### `audit_logs`
- **Business Role**: Immutable security and change ledger recording operational actions across the platform.
