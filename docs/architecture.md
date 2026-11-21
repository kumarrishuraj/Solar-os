# SolarOS — System Architecture Document

## 1. High-Level Architecture Overview

SolarOS is organized as a decoupled, multi-tier cloud-native platform designed for fast development, modular expansion, and high developer throughput during hackathons and beyond.

```
+-------------------------------------------------------------------------+
|                              Client Layer                               |
|               Next.js App Router (TypeScript + Tailwind CSS)            |
|  [Dashboard] [Surveys] [Quotes] [Inventory] [IoT Alerts] [AI Copilot]   |
+-------------------------------------------------------------------------+
                                    │
                                    │ HTTPS / REST / WebSockets
                                    ▼
+-------------------------------------------------------------------------+
|                             API Gateway                                 |
|                       FastAPI (Uvicorn / ASGI)                          |
|  - CORS & Rate Limiting                                                 |
|  - Request / Response Validation (Pydantic v2)                          |
|  - Authentication & Authorization Middleware                            |
+-------------------------------------------------------------------------+
            │                                             │
            ▼                                             ▼
+-----------------------+                    +---------------------------+
|    Business Domain    |                    |       AI / ML Engines     |
|       Services        |                    |                           |
| - Leads & CRM         |                    | - CV Rooftop Area (YOLO)  |
| - Quotation Generator |                    | - Solar Recommendation    |
| - Inventory & BOM     |                    | - Anomaly Detector        |
| - Field Installations |                    | - RAG & Warranty Parser   |
| - Service & Dispatch  |                    | - LLM BI Chatbot          |
+-----------------------+                    +---------------------------+
            │                                             │
            └──────────────────────┬──────────────────────┘
                                   ▼
+-------------------------------------------------------------------------+
|                           Data Persistence                              |
|                 PostgreSQL on Supabase (SQLAlchemy ORM)                 |
|  - Relational Models (Leads, Surveys, Quotations, Assets, Inverters)     |
|  - Vector Embeddings (pgvector for Warranty Documents & Knowledge Base) |
|  - Storage Buckets (Rooftop Aerial Images, CAD Files, Generated PDFs)   |
+-------------------------------------------------------------------------+
```

---

## 2. Component Details

### 2.1 Frontend Architecture (`frontend/`)
- **Framework**: Next.js App Router using TypeScript and Tailwind CSS.
- **Routing Strategy**:
  - `/login`: Secure operator and customer authentication.
  - `/dashboard`: Executive operations overview (revenue, pipeline, megawatts installed).
  - `/leads`: Customer intake, property info, consumption history.
  - `/surveys`: Drone/satellite rooftop visualizer with obstacle bounding boxes.
  - `/quotations`: Interactive system sizing, component selection, and ROI estimator.
  - `/inventory`: Panels, inverters, racking, balance-of-system (BOS) stock.
  - `/installations`: Project management, crew dispatch, inspection tracking.
  - `/equipment`: Telemetry, inverter health, warranty status.
  - `/service`: Maintenance tickets and automated anomaly notifications.
  - `/ai-assistant`: Conversational interface for natural language analytics.
- **State & Data Management**: React hooks, SWR / React Query for server caching, Tailwind UI component modularity.

### 2.2 Backend Architecture (`backend/app/`)
- **Framework**: FastAPI (Python 3.11+).
- **Core Principles**:
  - **Separation of Concerns**: API routes (`api/routes/`) only validate HTTP requests and marshal schemas. Core logic resides in `services/`, and data persistence resides in `models/`.
  - **Type Safety**: Strictly enforced Pydantic v2 schemas (`schemas/`) across all requests and responses.
  - **Database Sessions**: Managed via SQLAlchemy session dependency injection (`core/database.py`), ensuring clean transaction rollback and connection pooling.
  - **Config Management**: Centralized `pydantic-settings` (`core/config.py`) parsing `.env` cleanly without global mutations.

### 2.3 AI & Machine Learning Subsystem (`backend/app/ai/`)
1. **Rooftop Analysis (`roof_analysis.py`)**:
   - Ingests aerial imagery / satellite orthophotos.
   - Runs YOLO object segmentation to detect obstacles (chimneys, HVAC units, vents, skylights) and roof planes.
   - Calculates usable solar surface area ($m^2$ / $sq\ ft$) and azimuth/pitch.
2. **Solar Recommendation Engine (`solar_recommendation.py`)**:
   - Computes peak sun hours (PSH), optimal tilt, and module layout.
   - Generates recommended DC system capacity (kWp), estimated annual generation (MWh), and financial payback period.
3. **Predictive Maintenance & Anomaly Detection (`anomaly_detection.py`)**:
   - Scikit-learn `IsolationForest` to analyze inverter time-series telemetry (voltage, current, power factor, temperature).
   - Flags clipping, shading degradation, or ground faults before equipment failure occurs.
4. **Warranty Intelligence & BI Chatbot (`chatbot.py`)**:
   - Ingests inverter and panel warranty specifications.
   - Provides RAG semantic search and conversational analytics for operational queries (e.g., "Which inverters in Region 2 are past warranty or show clipping?").

### 2.4 Database Schema & Persistence (`database/`)
- Relational schema hosted on PostgreSQL / Supabase.
- Foreign key constraints ensure referential integrity between:
  - `leads` -> `rooftop_surveys` -> `quotations` -> `installations`.
- Integrated `pgvector` extension for warranty documents and technical manuals.
- Audit timestamps (`created_at`, `updated_at`) across all primary entities.

---

## 3. Developer Workflow & Team Ownership

| Workstream | Team Role | Scope |
|---|---|---|
| **Stream A: UI / UX** | Frontend Specialist | Next.js components, Tailwind styling, survey visualization canvasing |
| **Stream B: Core API** | Backend Specialist | FastAPI endpoints, SQLAlchemy models, Pydantic schemas, auth |
| **Stream C: Computer Vision & AI** | AI Specialist | YOLO rooftop obstacle inference, recommendation logic, isolation forest |
| **Stream D: Integrations & Copilot** | Full-Stack / BI Specialist | Supabase vector search, warranty RAG, quotation PDF export, chatbot endpoints |
