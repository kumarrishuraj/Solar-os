# SolarOS Database Setup & Supabase Configuration Guide

This operational guide details the complete deployment, migration, seeding, and storage configuration process for SolarOS on **Supabase** or a standalone **PostgreSQL 15+** cluster.

---

## 1. Prerequisites

- **PostgreSQL**: Version 15.0 or later (with `pgcrypto`, `uuid-ossp`, and `pgvector` extensions supported).
- **Supabase Account**: A provisioned project on [supabase.com](https://supabase.com) (or local Supabase CLI instance).
- **Database Client**: `psql`, Supabase SQL Editor, DBeaver, or pgAdmin.

---

## 2. Environment Variables Configuration

Copy the following environment variables into your backend (`backend/.env`) and frontend (`frontend/.env.local`):

### Backend (`backend/.env`)
```bash
# ==============================================================================
# SolarOS Backend Database & Supabase Configuration
# ==============================================================================

# Direct PostgreSQL Connection URL (Port 5432) - Used for schema migrations & DDL
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Connection Pooler URL (Port 6543 / Transaction Mode) - Recommended for high-concurrency FastAPI routes
DATABASE_POOL_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require"

# Supabase Platform API Keys
SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
# CRITICAL: Service Role Key bypasses RLS for trusted backend server-side operations
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Frontend (`frontend/.env.local`)
```bash
# ==============================================================================
# SolarOS Frontend Supabase Client Configuration
# ==============================================================================
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

> [!CAUTION]
> Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend client code or public Git repositories. The service role key bypasses Row Level Security.

---

## 3. Database Migration Execution

You can deploy the schema via two methods:

### Option A: Complete Consolidated Schema (Fastest & Recommended)
Open the Supabase Dashboard **SQL Editor** (or run via `psql`):

```bash
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" -f database/schema.sql
```

### Option B: Sequential Step-by-Step Migrations
If using a custom migration runner or CI/CD pipeline, execute the ordered SQL files in `database/migrations/`:

```bash
# 1. Extensions & triggers
psql "$DATABASE_URL" -f database/migrations/001_create_extensions.sql

# 2. Users & CRM core
psql "$DATABASE_URL" -f database/migrations/002_create_users.sql
psql "$DATABASE_URL" -f database/migrations/003_create_customers.sql
psql "$DATABASE_URL" -f database/migrations/004_create_leads.sql
psql "$DATABASE_URL" -f database/migrations/005_create_projects.sql

# 3. Assessment & Vision AI
psql "$DATABASE_URL" -f database/migrations/006_create_assessments.sql
psql "$DATABASE_URL" -f database/migrations/007_create_assessment_images.sql
psql "$DATABASE_URL" -f database/migrations/008_create_ai_analysis_results.sql

# 4. Surveys & Products
psql "$DATABASE_URL" -f database/migrations/009_create_surveys.sql
psql "$DATABASE_URL" -f database/migrations/010_create_products.sql

# 5. Sizing, Quotations & Financials
psql "$DATABASE_URL" -f database/migrations/011_create_recommendations.sql
psql "$DATABASE_URL" -f database/migrations/012_create_quotations.sql
psql "$DATABASE_URL" -f database/migrations/013_create_payments.sql

# 6. Inventory & Serialized Hardware
psql "$DATABASE_URL" -f database/migrations/014_create_inventory.sql
psql "$DATABASE_URL" -f database/migrations/015_create_equipment.sql

# 7. Field Installations & SOPs
psql "$DATABASE_URL" -f database/migrations/016_create_installations.sql

# 8. Post-Commissioning & Telemetry
psql "$DATABASE_URL" -f database/migrations/017_create_warranties.sql
psql "$DATABASE_URL" -f database/migrations/018_create_telemetry.sql
psql "$DATABASE_URL" -f database/migrations/019_create_service_tickets.sql
psql "$DATABASE_URL" -f database/migrations/020_create_audit_logs.sql

# 9. Performance Indexes & RLS Security
psql "$DATABASE_URL" -f database/migrations/021_create_indexes.sql
psql "$DATABASE_URL" -f database/migrations/022_create_security_policies.sql
```

---

## 4. Seeding Development Fixtures

Execute `database/seed.sql` to populate realistic Indian business test data:

```bash
psql "$DATABASE_URL" -f database/seed.sql
```

The seed script is idempotent using `ON CONFLICT` clauses. Rerunning it updates existing sample records rather than producing duplicates.

---

## 5. Supabase Storage Buckets Planning & Configuration

SolarOS strictly adheres to database best practices: **image and document binary payloads are stored in Supabase Storage, while metadata and relative storage paths are tracked in PostgreSQL**.

### Required Storage Buckets

Navigate to **Storage** > **New Bucket** in the Supabase Dashboard and create the following:

| Bucket Name | Visibility | File Size Limit | Allowed MIME Types | Operational Purpose |
|---|---|---|---|---|
| `rooftop-images` | **Private** | 15 MB | `image/jpeg`, `image/png`, `image/webp` | Drone orthophotos & aerial terrace photos |
| `survey-images` | **Private** | 15 MB | `image/jpeg`, `image/png`, `image/webp` | Field engineer on-site audit photos & meter boxes |
| `installation-images`| **Private** | 15 MB | `image/jpeg`, `image/png` | Mounting, cable tray & inverter installation proofs |
| `electricity-bills` | **Private** | 10 MB | `application/pdf`, `image/jpeg`, `image/png` | Customer utility bills (sensitive personal data) |
| `quotation-documents`| **Private** | 15 MB | `application/pdf` | Generated official customer commercial proposals |
| `warranty-documents` | **Private** | 15 MB | `application/pdf` | Signed OEM equipment warranty certificates |

### Supabase Storage Security Policies (SQL)

Execute these policies in the Supabase SQL Editor to secure storage bucket access:

```sql
-- 1. Disallow public anonymous downloads on sensitive buckets
CREATE POLICY "Deny public access on sensitive buckets"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id NOT IN ('electricity-bills', 'quotation-documents', 'warranty-documents'));

-- 2. Allow authenticated staff full upload permissions
CREATE POLICY "Allow authenticated staff uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id IN (
        'rooftop-images',
        'survey-images',
        'installation-images',
        'electricity-bills',
        'quotation-documents',
        'warranty-documents'
    )
);

-- 3. Allow backend service_role unrestricted access
CREATE POLICY "Service role full access on storage"
ON storage.objects FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

---

## 6. Teardown & Schema Reset

To completely tear down all tables and reset the schema to a clean state during development:

```bash
psql "$DATABASE_URL" -f database/reset.sql
```
