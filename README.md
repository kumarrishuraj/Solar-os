# SolarOS — AI-Powered Solar Installation Management Platform

SolarOS is an enterprise-grade, AI-driven operating system designed to streamline the entire solar installation lifecycle—from automated rooftop feasibility analysis, lead intake, and quoting, to equipment inventory, field installations, IoT predictive maintenance, and natural-language AI business intelligence.

Built for the 24-hour hackathon, SolarOS accelerates clean energy adoption by removing friction across site surveys, system engineering, and post-installation monitoring.

---

## 🚀 Key Features

1. **AI Rooftop Survey & Layout Optimization**: Computer vision (YOLO + OpenCV) for obstacle detection, usable rooftop area calculation, and solar panel layout planning.
2. **Solar Recommendation Engine**: Rule-based electrical sizing, irradiance modeling, estimated annual kWh generation, and financial payback period calculations.
3. **End-to-End Workflow**: Unified management of Leads, Surveys, Quotations, Inventory, and Field Installations.
4. **Predictive Maintenance & Anomaly Detection**: Unsupervised machine learning (Isolation Forest) monitoring inverter telemetry, string degradation, and alert dispatch.
5. **Warranty & Equipment Intelligence**: OCR and RAG pipeline for solar panel and inverter warranty terms, datasheets, and replacement claims.
6. **AI Business Intelligence Chatbot**: Conversational copilot delivering instant operational analytics, revenue forecasting, and crew dispatch optimization.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js (App Router), TypeScript, Tailwind CSS, Reusable Component Library |
| **Backend** | Python 3.11+, FastAPI, SQLAlchemy, Pydantic v2, Uvicorn |
| **Database** | PostgreSQL (Supabase) |
| **AI / ML** | YOLO (Ultralytics) + OpenCV, Scikit-learn (Isolation Forest), RAG/OCR, LLM APIs |
| **Testing** | Pytest, HTTPX, Jest / React Testing Library |

---

## 📁 Repository Structure

```text
SolarOS/
│
├── frontend/                     # Next.js App Router frontend
│   ├── public/                   # Static assets
│   ├── src/
│   │   ├── app/                  # Application routes (login, dashboard, surveys, etc.)
│   │   ├── components/           # UI, layout, and dashboard widgets
│   │   ├── lib/                  # Utility functions and API clients
│   │   ├── hooks/                # Custom React hooks
│   │   └── types/                # TypeScript type definitions
│   └── package.json              # Frontend package manifest
│
├── backend/                      # FastAPI Python backend
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/           # Versioned API route handlers
│   │   ├── core/                 # Config (settings, database connection)
│   │   ├── models/               # SQLAlchemy ORM models
│   │   ├── schemas/              # Pydantic request/response schemas
│   │   ├── services/             # Core business logic services
│   │   ├── ai/                   # AI modules (CV, recommendations, anomaly, chatbot)
│   │   └── main.py               # FastAPI entrypoint
│   ├── tests/                    # Backend unit & integration tests
│   ├── requirements.txt          # Python dependencies
│   └── .env.example              # Environment variables template
│
├── database/                     # Enterprise PostgreSQL (Supabase) Database Infrastructure
│   ├── migrations/               # 22 ordered SQL migrations (extensions to RLS)
│   ├── docs/                     # Schema, ERD, data dictionary, contracts & guides
│   ├── tests/                    # Database schema validation test suites
│   ├── schema.sql                # Complete consolidated DDL schema
│   ├── seed.sql                  # Realistic Indian business seed dataset
│   ├── reset.sql                 # Safe teardown and schema reset script
│   └── README.md                 # Database layer operational documentation
│
├── docs/                         # Architecture & API documentation
│   ├── architecture.md           # System design & component interaction
│   └── api-endpoints.md          # REST API specifications
│
├── .gitignore                    # Git ignore file
└── README.md                     # Project documentation (this file)
```

---

## ⚙️ Quickstart Guide

### 1. Prerequisites

- **Python**: 3.11 or later
- **Node.js**: v18 or later (Node 20+ recommended)
- **Supabase / PostgreSQL**: Supabase account or local PostgreSQL instance

---

### 2. Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   - On Windows (PowerShell):
     ```powershell
     python -m venv .venv
     .\.venv\Scripts\Activate.ps1
     ```
   - On macOS/Linux:
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   ```bash
   copy .env.example .env    # On Windows
   cp .env.example .env      # On Linux/macOS
   ```
   *Edit `.env` and configure your database URL and API keys.*

5. **Run the FastAPI server**:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   Interactive Swagger documentation will be available at:
   - **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
   - **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

6. **Run tests**:
   ```bash
   pytest
   ```

---

### 3. Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **If initializing Next.js for the first time**:
   ```bash
   npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
   ```

3. **Install dependencies & start the dev server**:
   ```bash
   npm install
   npm run dev
   ```
   Access the dashboard at [http://localhost:3000](http://localhost:3000).

---

### 4. Database Setup

1. Open your **Supabase Dashboard** or local PostgreSQL client.
2. Execute `database/schema.sql` in the SQL Editor to provision tables and indexes.
3. Execute `database/seed.sql` to populate sample leads, equipment, and survey records for development.

---

## 👥 Hackathon Team Development Guide

To facilitate concurrent development across 3–4 developers:
- **Developer 1 (Frontend Lead)**: Builds App Router pages (`frontend/src/app/`) and UI components (`frontend/src/components/`).
- **Developer 2 (Backend / Database)**: Implements SQLAlchemy models, migration scripts, and REST endpoints (`backend/app/api/routes/`).
- **Developer 3 (AI / Vision)**: Implements rooftop CV segmentation and anomaly detection (`backend/app/ai/`).
- **Developer 4 (BI & Integrations)**: RAG warranty intelligence, LLM chatbot integration, and quotation PDF generation.

---

## 📄 License
MIT License. Built for the 24-Hour SolarOS Hackathon.
