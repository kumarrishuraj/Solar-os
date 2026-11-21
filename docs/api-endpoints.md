# SolarOS — REST API Endpoints Specification

This document defines the REST API routes exposed by the SolarOS FastAPI backend service.

Base URL: `http://localhost:8000` (or `http://localhost:8000/api/v1`)

---

## 1. System & Health Endpoints

### `GET /`
Returns root application metadata.

- **Response `200 OK`**:
  ```json
  {
    "name": "SolarOS API",
    "version": "0.1.0",
    "description": "AI-Powered Solar Installation Management Platform API",
    "status": "online",
    "docs_url": "/docs"
  }
  ```

### `GET /health`
Returns system health status for monitoring and uptime probes.

- **Response `200 OK`**:
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-11-21T06:30:00Z",
    "database": "connected",
    "environment": "development"
  }
  ```

---

## 2. Planned API Routes by Module

### 2.1 Rooftop Analysis & Vision (`/api/v1/surveys`)
- `POST /api/v1/surveys/analyze-roof`: Upload aerial or drone image; returns detected roof boundaries, obstacles (HVAC, chimney, vents), and net usable surface area.
- `GET /api/v1/surveys/{id}`: Retrieve detailed survey analysis results and obstacle coordinates.

### 2.2 Solar Sizing & Recommendations (`/api/v1/recommendations`)
- `POST /api/v1/recommendations/estimate`: Provide usable roof area, location coordinates, and monthly electricity consumption; returns recommended kWp capacity, panel count, annual generation (kWh), and estimated savings.

### 2.3 CRM & Leads (`/api/v1/leads`)
- `GET /api/v1/leads`: List prospective customers with search and pagination.
- `POST /api/v1/leads`: Register new lead with customer information and address.
- `GET /api/v1/leads/{id}`: Detailed lead profile with linked survey and quote history.
- `PATCH /api/v1/leads/{id}/status`: Advance lead stage (`lead`, `survey_scheduled`, `quote_sent`, `contract_signed`).

### 2.4 Quotations & Proposals (`/api/v1/quotations`)
- `POST /api/v1/quotations`: Generate custom quotation with itemized bill of materials (BOM), financing options, and incentive deductions.
- `GET /api/v1/quotations/{id}/pdf`: Download formal customer proposal PDF.

### 2.5 Inventory & Equipment (`/api/v1/inventory`)
- `GET /api/v1/inventory`: List warehouse stock (panels, inverters, mounting rails, batteries).
- `POST /api/v1/inventory`: Log new stock intake.
- `POST /api/v1/inventory/reserve`: Reserve stock for a confirmed installation project.

### 2.6 Installations & Project Management (`/api/v1/installations`)
- `GET /api/v1/installations`: List active installations by status (`scheduled`, `permitting`, `in_progress`, `inspection`, `commissioned`).
- `PATCH /api/v1/installations/{id}`: Update installation milestones and crew assignments.

### 2.7 Inverter Telemetry & Predictive Maintenance (`/api/v1/service`)
- `POST /api/v1/service/telemetry`: Ingest inverter readings (voltage, amperage, kW output, temperature).
- `POST /api/v1/service/detect-anomalies`: Run Isolation Forest algorithm on recent telemetry stream to identify potential faults or degradation.
- `GET /api/v1/service/tickets`: List active maintenance tickets.

### 2.8 AI Assistant & Warranty Intelligence (`/api/v1/ai-assistant`)
- `POST /api/v1/ai-assistant/query`: Chatbot endpoint accepting conversational queries about installation status, equipment warranties, and business KPIs.
- `POST /api/v1/ai-assistant/warranty-lookup`: RAG lookup for warranty policies and datasheet specifications.
