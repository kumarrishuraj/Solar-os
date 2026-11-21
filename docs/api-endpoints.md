# SolarOS — REST API Endpoints Specification

This document provides the definitive specification of all REST API endpoints implemented in the SolarOS FastAPI backend service.

- **Base URL**: `http://localhost:8000`
- **API Prefix**: `/api/v1`
- **Interactive Documentation**: Swagger UI at `/docs`, ReDoc at `/redoc`, OpenAPI JSON at `/openapi.json`
- **Architecture**: Modular Monolithic FastAPI with SQLAlchemy 2.0 ORM, Pydantic V2 validation, and Decimal financial precision.

---

## Role-Based Access Control (RBAC) Matrix

| User Role | Permissions & Scope |
| :--- | :--- |
| `admin` | Full operational access across all modules, analytics, and staff audit logs. |
| `director` | Full read access to business intelligence, financials, audit trails, and approvals. |
| `sales` | Manage customer enquiries, create and update leads, initiate property assessments. |
| `surveyor` | View assigned site surveys, record structural/electrical field measurements, submit findings. |
| `engineer` | Review & approve/reject site surveys, configure engineering solar recommendations, review proposals. |
| `finance` | Issue commercial quotations, approve discounts, record milestone payments (Advance, Delivery, Handover). |
| `warehouse` | Maintain stock on hand, execute atomic material reservations/releases, track serial dispatch. |
| `technician` | Execute field installation, sign off 9-step SOP checklist items, capture site photos, commission plant. |
| `service_agent` | Manage post-installation warranty claims, monitor IoT telemetry, triage maintenance tickets. |

---

## 1. System Health & Metadata

### `GET /`
- **Summary**: Application root metadata.
- **Auth**: Public.
- **Response**: `200 OK`
  ```json
  {
    "name": "SolarOS API",
    "version": "1.0.0",
    "status": "online",
    "docs_url": "/docs"
  }
  ```

### `GET /health` & `GET /api/v1/health`
- **Summary**: Readiness probe for Render, container orchestrators, and uptime monitors.
- **Auth**: Public.
- **Response**: `200 OK`
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-11-21T18:40:00Z",
    "database": "connected",
    "environment": "development",
    "version": "1.0.0"
  }
  ```

---

## 2. Authentication & Staff Operations (`/api/v1/auth`)

### `POST /api/v1/auth/login`
- **Summary**: Staff authentication via email and password.
- **Auth**: Public.
- **Payload**:
  ```json
  {
    "email": "director@solaros.io",
    "password": "Password123!"
  }
  ```
- **Response**: `200 OK` — JWT Access Token, expiration timestamp, and staff profile.

### `POST /api/v1/auth/demo-token`
- **Summary**: Issue pre-signed demonstration JWT token for rapid prototyping and automated testing.
- **Auth**: Public.
- **Query Params**: `role` (`admin`, `sales`, `surveyor`, `engineer`, `finance`, `warehouse`, `technician`, `service_agent`).

### `GET /api/v1/auth/me`
- **Summary**: Return authenticated user's profile and granted role.
- **Auth**: Bearer JWT.

### `GET /api/v1/auth/staff`
- **Summary**: Retrieve internal staff directory for task delegation and technician assignment.
- **Auth**: Authenticated staff.
- **Query Params**: `role` (optional filter).

---

## 3. Customer & Lead Intake Management (`/api/v1/leads` & `/api/v1/customers`)

### `POST /api/v1/leads/enquiry`
- **Summary**: Public customer onboarding portal. Atomically identifies or creates customer profile, registers CRM lead, and provisions property assessment when technical parameters are provided.
- **Auth**: Public / Web Hook.
- **Response**: `201 Created` — Returns `{ "customer_id", "lead_id", "lead_number", "assessment_id" }`.

### `POST /api/v1/leads`
- **Summary**: Register lead manually.
- **Auth**: `sales`, `admin`, `director`.

### `GET /api/v1/leads`
- **Summary**: List CRM leads with pagination and multifaceted filters.
- **Auth**: Authenticated staff.
- **Query Params**: `status`, `city`, `lead_source`, `assigned_sales_rep_id`, `search`, `page`, `limit`.

### `GET /api/v1/leads/{id}`
- **Summary**: Fetch detailed lead profile.
- **Auth**: Authenticated staff.

### `PUT /api/v1/leads/{id}`
- **Summary**: Update lead record details.
- **Auth**: `sales`, `admin`, `director`.

### `PATCH /api/v1/leads/{id}/status`
- **Summary**: Transition lead lifecycle stage (`new` -> `contacted` -> `qualified` -> `converted` -> `lost`).
- **Auth**: `sales`, `admin`, `director`.

### `GET /api/v1/customers`
- **Summary**: List customer database with search and pagination.
- **Auth**: Authenticated staff.

### `GET /api/v1/customers/{id}`
- **Summary**: Fetch single customer record by UUID.
- **Auth**: Authenticated staff.

### `PUT /api/v1/customers/{id}`
- **Summary**: Update customer contact and property records.
- **Auth**: `sales`, `admin`, `director`.

---

## 4. Property Assessments & Image Management (`/api/v1/assessments`)

### `POST /api/v1/assessments`
- **Summary**: Record rooftop engineering assessment (supports unknown roof dimensions without inventing values). Enforces `usable_area_sqft <= gross_area_sqft`.
- **Auth**: `sales`, `surveyor`, `engineer`, `admin`.

### `GET /api/v1/assessments`
- **Summary**: List rooftop assessments filtered by customer or project.
- **Auth**: Authenticated staff.

### `GET /api/v1/assessments/{id}`
- **Summary**: Retrieve assessment profile with associated rooftop images.
- **Auth**: Authenticated staff.

### `PUT /api/v1/assessments/{id}`
- **Summary**: Update assessment sizing, shading, and DISCOM electrical specs.
- **Auth**: `surveyor`, `engineer`, `admin`.

### `POST /api/v1/assessments/{id}/images`
- **Summary**: Upload aerial, drone, or satellite rooftop survey imagery to Supabase Storage. Enforces MIME validation (`image/jpeg`, `image/png`, `image/webp`) and size limits (< 15MB).
- **Auth**: `sales`, `surveyor`, `engineer`, `admin`.

### `GET /api/v1/assessments/{id}/images`
- **Summary**: List authorized image CDN references and dimensions for an assessment.
- **Auth**: Authenticated staff.

### `DELETE /api/v1/assessments/{id}/images/{image_id}`
- **Summary**: Remove uploaded survey photograph from storage and database.
- **Auth**: `surveyor`, `engineer`, `admin`.

---

## 5. Solar Recommendation Data Management (`/api/v1/recommendations`)

### `POST /api/v1/recommendations`
- **Summary**: Store proposed solar plant engineering configuration (BOM, panel count, capacity, generation, savings).
- **Auth**: `engineer`, `admin`.

### `GET /api/v1/recommendations/{id}`
- **Summary**: Fetch technical recommendation proposal by UUID.
- **Auth**: Authenticated staff.

### `GET /api/v1/assessments/{id}/recommendations`
- **Summary**: List all recommendation proposals linked to a property assessment.
- **Auth**: Authenticated staff.

### `PATCH /api/v1/recommendations/{id}`
- **Summary**: Update technical parameters or mark recommendation as approved/rejected.
- **Auth**: `engineer`, `admin`.

---

## 6. Site Survey Management (`/api/v1/surveys`)

### `POST /api/v1/surveys`
- **Summary**: Schedule structural and electrical site survey with surveyor assignment.
- **Auth**: `engineer`, `sales`, `admin`.

### `GET /api/v1/surveys`
- **Summary**: List surveys filtered by project, surveyor, or approval status.
- **Auth**: Authenticated staff.

### `GET /api/v1/surveys/{id}`
- **Summary**: Retrieve survey report with verified physical dimensions.
- **Auth**: Authenticated staff.

### `PUT /api/v1/surveys/{id}`
- **Summary**: Record on-site verified measurements (tilt, orientation, cable distance, obstacles).
- **Auth**: `surveyor`, `engineer`, `admin`.

### `PATCH /api/v1/surveys/{id}/submit`
- **Summary**: Surveyor marks field inspection complete and submits for engineering review.
- **Auth**: `surveyor`, `admin`.

### `PATCH /api/v1/surveys/{id}/approve`
- **Summary**: Solar Engineer reviews and approves survey, progressing project to `survey_approved`.
- **Auth**: `engineer`, `admin`.

### `PATCH /api/v1/surveys/{id}/reject`
- **Summary**: Reject site survey. Enforces mandatory `rejection_reason` in payload.
- **Auth**: `engineer`, `admin`.

---

## 7. Project Lifecycle State Machine (`/api/v1/projects`)

### `POST /api/v1/projects`
- **Summary**: Initialize solar installation project for an onboarded customer.
- **Auth**: `sales`, `admin`.

### `GET /api/v1/projects`
- **Summary**: List solar projects with status, customer, and search filters.
- **Auth**: Authenticated staff.

### `GET /api/v1/projects/{id}`
- **Summary**: Fetch complete project dossier.
- **Auth**: Authenticated staff.

### `PUT /api/v1/projects/{id}`
- **Summary**: Update project administrative details.
- **Auth**: `engineer`, `admin`.

### `PATCH /api/v1/projects/{id}/status`
- **Summary**: Validate and execute state transition across the 13-stage lifecycle:
  `enquiry` -> `assessment` -> `survey_pending` -> `survey_approved` -> `design_approved` -> `quotation_pending` -> `quotation_approved` -> `payment_pending` -> `ready_for_dispatch` -> `installation_scheduled` -> `installation_in_progress` -> `completed` (or `cancelled`).
- **Auth**: `engineer`, `admin`, `director`.

---

## 8. Commercial Quotation Management (`/api/v1/quotations`)

### `POST /api/v1/quotations`
- **Summary**: Create itemized commercial proposal with Decimal financial precision (subtotal, line discounts, 18% GST, installation charges, net total). Enforces project survey readiness.
- **Auth**: `finance`, `admin`.

### `GET /api/v1/quotations`
- **Summary**: List quotations filtered by project, customer, or quotation status.
- **Auth**: Authenticated staff.

### `GET /api/v1/quotations/{id}`
- **Summary**: Retrieve detailed quotation with BOM line items.
- **Auth**: Authenticated staff.

### `PATCH /api/v1/quotations/{id}/approve`
- **Summary**: Formally approve quotation and advance project to `quotation_approved`.
- **Auth**: `finance`, `admin`, `director`.

### `PATCH /api/v1/quotations/{id}/reject`
- **Summary**: Reject quotation proposal with reason.
- **Auth**: `finance`, `admin`.

### `POST /api/v1/quotations/{id}/pdf`
- **Summary**: Dynamically generate and stream binary PDF 1.4 commercial proposal with typography, terms, and payment schedules.
- **Auth**: Authenticated staff.

---

## 9. Milestone Payments (`/api/v1/payments`)

### `POST /api/v1/payments`
- **Summary**: Record customer milestone payment (Advance, Delivery, Handover) with transaction reference.
- **Auth**: `finance`, `admin`.

### `GET /api/v1/payments`
- **Summary**: List received payments across projects.
- **Auth**: `finance`, `admin`, `director`.

### `GET /api/v1/payments/{id}`
- **Summary**: Fetch single payment receipt details.
- **Auth**: `finance`, `admin`.

### `GET /api/v1/projects/{id}/payments`
- **Summary**: Summarize project payment ledger, calculating `total_quoted`, `total_paid`, and `outstanding_balance`.
- **Auth**: Authenticated staff.

---

## 10. Warehouse Inventory & Stock Ledger (`/api/v1/inventory`)

### `POST /api/v1/inventory/products`
- **Summary**: Register new hardware SKU in product catalog.
- **Auth**: `warehouse`, `admin`.

### `GET /api/v1/inventory/products`
- **Summary**: List catalog products with active status filters.
- **Auth**: Authenticated staff.

### `GET /api/v1/inventory/stock`
- **Summary**: View warehouse stock on hand, reserved stock, and available stock (`quantity_on_hand - quantity_reserved`). Identifies low-stock SKUs.
- **Auth**: `warehouse`, `engineer`, `admin`.

### `PATCH /api/v1/inventory/stock/{product_id}`
- **Summary**: Perform physical count inventory adjustment with immutable audit trail.
- **Auth**: `warehouse`, `admin`.

### `POST /api/v1/inventory/reserve`
- **Summary**: Atomically reserve warehouse stock for project BOM. Prevents overselling using row-locking database transactions.
- **Auth**: `warehouse`, `admin`.

### `POST /api/v1/inventory/release`
- **Summary**: Release reserved inventory on project scope adjustments or cancellation.
- **Auth**: `warehouse`, `admin`.

### `GET /api/v1/inventory/movements`
- **Summary**: Audit immutable inventory movements (`intake`, `adjustment`, `dispatch`, `reservation`).
- **Auth**: `warehouse`, `admin`, `director`.

---

## 11. Serialized Hardware Units (`/api/v1/equipment`)

### `POST /api/v1/equipment`
- **Summary**: Register serial-numbered equipment (inverter, panel, battery). Enforces strict uniqueness on `serial_number`.
- **Auth**: `warehouse`, `admin`.

### `GET /api/v1/equipment`
- **Summary**: List serialized equipment units.
- **Auth**: Authenticated staff.

### `GET /api/v1/equipment/{id}`
- **Summary**: Fetch equipment unit details by UUID.
- **Auth**: Authenticated staff.

### `GET /api/v1/equipment/serial/{serial_number}`
- **Summary**: Rapid barcode/QR lookup for physical hardware unit.
- **Auth**: Authenticated staff.

### `POST /api/v1/equipment/dispatch`
- **Summary**: Dispatch serialized units to project installation site.
- **Auth**: `warehouse`, `admin`.

---

## 12. Field Installations & SOP Checklists (`/api/v1/installations`)

### `POST /api/v1/installations`
- **Summary**: Schedule field installation and automatically seed 9-step standard SOP checklist tasks.
- **Auth**: `engineer`, `admin`.

### `GET /api/v1/installations`
- **Summary**: List installations with progress percentages and SOP checklist items.
- **Auth**: Authenticated staff.

### `GET /api/v1/installations/{id}`
- **Summary**: Fetch installation record with live checklist item status.
- **Auth**: Authenticated staff.

### `PATCH /api/v1/installations/{id}/status`
- **Summary**: Update field installation progress and execution status.
- **Auth**: `technician`, `engineer`, `admin`.

### `POST /api/v1/installations/{id}/checklist`
- **Summary**: Technician batch signoff for SOP checklist items. Automatically recalculates `progress_percentage`.
- **Auth**: `technician`, `engineer`, `admin`.

### `POST /api/v1/installations/{id}/photos`
- **Summary**: Upload site execution proof photos (structure, inverter, earthing pit, meter).
- **Auth**: `technician`, `admin`.

### `POST /api/v1/installations/{id}/complete`
- **Summary**: Commission plant and execute customer handover. Validates 100% SOP checklist completion and automatically activates equipment warranties.
- **Auth**: `technician`, `engineer`, `admin`.

---

## 13. Warranty Management (`/api/v1/warranties`)

### `POST /api/v1/warranties`
- **Summary**: Issue custom warranty certificate.
- **Auth**: `engineer`, `service_agent`, `admin`.

### `GET /api/v1/warranties`
- **Summary**: List registered warranties with status (`active`, `expired`, `void`).
- **Auth**: Authenticated staff.

### `GET /api/v1/warranties/{id}`
- **Summary**: Fetch single warranty certificate.
- **Auth**: Authenticated staff.

### `GET /api/v1/installations/{id}/warranties`
- **Summary**: List all active warranties associated with a completed installation.
- **Auth**: Authenticated staff.

### `GET /api/v1/projects/{id}/warranties`
- **Summary**: List warranty coverage for an entire solar plant project.
- **Auth**: Authenticated staff.

---

## 14. IoT Monitoring & Telemetry (`/api/v1/monitoring`)

### `POST /api/v1/monitoring/telemetry`
- **Summary**: High-throughput telemetry ingestion endpoint for smart solar inverters and energy loggers.
- **Auth**: IoT Device Token / Authenticated staff.

### `GET /api/v1/monitoring/telemetry/{installation_id}`
- **Summary**: Historical time-series telemetry data (power output kW, energy yield kWh, temperature, grid voltage).
- **Auth**: Authenticated staff.

### `GET /api/v1/monitoring/live/{installation_id}`
- **Summary**: Instantaneous live telemetry readings.
- **Auth**: Authenticated staff.

---

## 15. Customer Service & Maintenance Tickets (`/api/v1/service-tickets`)

### `POST /api/v1/service-tickets`
- **Summary**: File customer maintenance or warranty ticket.
- **Auth**: `service_agent`, `sales`, `admin`.

### `GET /api/v1/service-tickets`
- **Summary**: List support tickets with priority and resolution status filters.
- **Auth**: Authenticated staff.

### `GET /api/v1/service-tickets/{id}`
- **Summary**: Fetch ticket case history and resolution notes.
- **Auth**: Authenticated staff.

### `PATCH /api/v1/service-tickets/{id}/status`
- **Summary**: Update ticket triage status (`open`, `in_progress`, `resolved`, `closed`).
- **Auth**: `service_agent`, `admin`.

---

## 16. Business Intelligence & Analytics (`/api/v1/analytics`)

*All metrics are calculated via live SQL aggregation over production database tables.*

### `GET /api/v1/analytics/dashboard`
- **Summary**: Operational overview KPIs: total active projects, installed solar capacity (kW), monthly revenue, active service tickets, low stock alert count.
- **Auth**: `admin`, `director`.

### `GET /api/v1/analytics/revenue`
- **Summary**: Financial revenue breakdown: total collected payments, outstanding invoice balance, completed project revenue.
- **Auth**: `admin`, `director`, `finance`.

### `GET /api/v1/analytics/projects`
- **Summary**: Slicing of solar projects grouped by lifecycle status and pipeline velocity.
- **Auth**: `admin`, `director`.

---

## 17. Security & Operational Audit Trail (`/api/v1/audit-logs`)

### `GET /api/v1/audit-logs`
- **Summary**: Append-only security audit trail recording all entity modifications, status progressions, and financial authorizations.
- **Auth**: `admin`, `director`.
