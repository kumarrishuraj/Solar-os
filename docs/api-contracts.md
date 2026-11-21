# SolarOS — REST API Contracts & Frontend Integration Guide

This document defines the exact JSON schema request and response structures between the **Next.js Frontend** and the **FastAPI Backend**.

---

## 1. Authentication (`/api/v1/auth`)

### Staff Login
- **Endpoint**: `POST /api/v1/auth/login`
- **Request Body**:
  ```json
  {
    "email": "director@solaros.io",
    "password": "Password123!"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
    "token_type": "bearer",
    "expires_at": "2026-11-22T18:40:00Z",
    "user": {
      "id": "00000000-0000-0000-0001-000000000002",
      "full_name": "Vikram Malhotra",
      "email": "director@solaros.io",
      "phone": "+91-98111-00002",
      "role": "director",
      "is_active": true,
      "created_at": "2026-11-21T18:40:00Z"
    }
  }
  ```

---

## 2. Customer & Lead Intake (`/api/v1/leads`)

### Public Enquiry Intake (Atomic Multi-Entity Creation)
- **Endpoint**: `POST /api/v1/leads/enquiry`
- **Request Body**:
  ```json
  {
    "full_name": "Rajesh Kumar",
    "email": "rajesh.kumar@example.com",
    "phone": "+91-98765-12345",
    "property_address": "B-42, South City II",
    "city": "Gurugram",
    "state": "Haryana",
    "postal_code": "122018",
    "property_type": "residential",
    "lead_source": "website",
    "monthly_electricity_bill": 14500.0,
    "monthly_consumption_kwh": 1200.0,
    "rooftop_area_sqft": 1800.0,
    "roof_type": "flat_rcc",
    "connection_phase": "three_phase",
    "system_type_preference": "on_grid",
    "budget": 450000.0
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "customer_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "lead_id": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
    "lead_number": "LEAD-2026-0001",
    "assessment_id": "5fa85f64-5717-4562-b3fc-2c963f66afa8"
  }
  ```

---

## 3. Site Surveys & Field Findings (`/api/v1/surveys`)

### Update Survey Findings
- **Endpoint**: `PUT /api/v1/surveys/{survey_id}`
- **Request Body**:
  ```json
  {
    "verified_area_sqft": 1650.0,
    "azimuth_degrees": 180.0,
    "tilt_degrees": 28.5,
    "shading_factor": 0.05,
    "cable_distance_meters": 35.0,
    "structural_notes": "Reinforced concrete slab in excellent structural condition. Suitable for ballasted mount.",
    "electrical_notes": "Existing 3-phase 415V main distribution board with spare 63A MCB slot.",
    "obstacles": [
      { "type": "water_tank", "x": 12.0, "y": 4.5, "height_m": 2.2 },
      { "type": "parapet_wall", "height_m": 1.0 }
    ]
  }
  ```

### Reject Site Survey
- **Endpoint**: `PATCH /api/v1/surveys/{survey_id}/reject`
- **Request Body**:
  ```json
  {
    "rejection_reason": "Excessive tree canopy shadow on South quadrant during peak generation hours."
  }
  ```

---

## 4. Commercial Quotations & Proposals (`/api/v1/quotations`)

### Create Quotation
- **Endpoint**: `POST /api/v1/quotations`
- **Request Body**:
  ```json
  {
    "project_id": "6fa85f64-5717-4562-b3fc-2c963f66afa9",
    "customer_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "system_capacity_kw": 5.5,
    "items": [
      {
        "product_id": "00000000-0000-0000-0003-000000000001",
        "description": "Tata Power 550W Mono PERC Half-Cut Modules",
        "quantity": 10.0,
        "unit_price": 16500.0
      }
    ],
    "discount": 5000.0,
    "gst_percent": 18.0,
    "installation_charges": 15000.0,
    "valid_until": "2026-12-21"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "id": "7fa85f64-5717-4562-b3fc-2c963f66afb0",
    "quotation_number": "QUOTE-2026-0001",
    "project_id": "6fa85f64-5717-4562-b3fc-2c963f66afa9",
    "customer_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "system_capacity_kw": "5.50",
    "subtotal": "165000.00",
    "discount": "5000.00",
    "gst_amount": "28800.00",
    "installation_charges": "15000.00",
    "total_amount": "203800.00",
    "quotation_status": "sent",
    "valid_until": "2026-12-21",
    "created_at": "2026-11-21T18:40:00Z",
    "items": [
      {
        "id": "8fa85f64-5717-4562-b3fc-2c963f66afb1",
        "product_id": "00000000-0000-0000-0003-000000000001",
        "description": "Tata Power 550W Mono PERC Half-Cut Modules",
        "quantity": "10.00",
        "unit_price": "16500.00",
        "total_price": "165000.00"
      }
    ]
  }
  ```

---

## 5. Warehouse Inventory & Atomic Stock Reservation (`/api/v1/inventory`)

### Reserve Stock for Installation Project
- **Endpoint**: `POST /api/v1/inventory/reserve`
- **Request Body**:
  ```json
  {
    "project_id": "6fa85f64-5717-4562-b3fc-2c963f66afa9",
    "items": [
      {
        "product_id": "00000000-0000-0000-0003-000000000001",
        "quantity": 10.0
      }
    ]
  }
  ```
- **Error Response `400 Bad Request` (Overselling Prevention)**:
  ```json
  {
    "detail": "Insufficient stock for product 'PANEL-550W-MONO'. Available: 5.00, Requested: 10.00"
  }
  ```

---

## 6. Field Installations & SOP Checklist (`/api/v1/installations`)

### Standard 9-Step SOP Checklist Items:
1. `Structure installed`
2. `Panels installed`
3. `Inverter installed`
4. `DC wiring completed`
5. `AC wiring completed`
6. `Earthing completed`
7. `Testing completed`
8. `Commissioning completed`
9. `Customer handover completed`

### Batch Update Checklist Progress
- **Endpoint**: `POST /api/v1/installations/{installation_id}/checklist`
- **Request Body**:
  ```json
  {
    "items": [
      {
        "task_name": "Structure installed",
        "is_completed": true,
        "remarks": "Anodized aluminum rail mounts secured to roof anchors."
      },
      {
        "task_name": "Panels installed",
        "is_completed": true,
        "remarks": "10x 550W modules mounted with stainless steel mid/end clamps."
      }
    ]
  }
  ```

### Complete Installation & Activate Warranties
- **Endpoint**: `POST /api/v1/installations/{installation_id}/complete`
- **Request Body**:
  ```json
  {
    "customer_confirmation": true,
    "testing_results": {
      "voc_volts": 412.5,
      "isc_amps": 13.8,
      "insulation_resistance_megaohms": 120.0,
      "earthing_pit_resistance_ohms": 2.4
    }
  }
  ```
- **Validation Note**: If any of the 9 required checklist tasks are incomplete, the endpoint rejects the request with `400 Bad Request` and lists incomplete SOP items.

---

## 7. IoT Telemetry Ingestion (`/api/v1/monitoring`)

### Ingest Inverter Readings
- **Endpoint**: `POST /api/v1/monitoring/telemetry`
- **Request Body**:
  ```json
  {
    "installation_id": "9fa85f64-5717-4562-b3fc-2c963f66afb2",
    "timestamp": "2026-11-21T12:00:00Z",
    "current_power_kw": 4.85,
    "daily_energy_kwh": 22.4,
    "total_energy_kwh": 3412.0,
    "grid_voltage_v": 234.2,
    "inverter_temperature_c": 46.5,
    "status": "normal"
  }
  ```

---

## 8. Business Intelligence Dashboard (`/api/v1/analytics`)

### Live Aggregate KPIs
- **Endpoint**: `GET /api/v1/analytics/dashboard`
- **Response `200 OK`**:
  ```json
  {
    "total_leads": 142,
    "total_customers": 98,
    "active_projects": 34,
    "installed_capacity_kw": 485.5,
    "monthly_revenue": 3450000.0,
    "active_tickets": 3,
    "low_stock_alerts": 2
  }
  ```
