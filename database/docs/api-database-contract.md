# SolarOS API & Database Contract

Strict specification for **Backend (FastAPI + SQLAlchemy)** and **Frontend (Next.js + TypeScript)** developers.

This document serves as the binding schema contract. Neither backend nor frontend developers need to guess database field names, data types, nullability, or status enums.

---

## 1. Global Conventions

1. **Table & Column Names**: Strict `snake_case` (e.g. `customer_id`, `monthly_electricity_bill`).
2. **Primary Keys**: Always `id` as `UUID` string.
3. **Foreign Keys**: Always `<singular_entity>_id` (e.g. `lead_id`, `surveyor_id`, `quotation_id`).
4. **Timestamps**: `created_at` and `updated_at` are ISO 8601 strings with timezone in API responses (e.g. `"2026-10-14T17:00:00+05:30"`).
5. **Monetary & Numeric Fields**: `NUMERIC` types are returned as standard JSON floats/numbers in API responses, but manipulated as `Decimal` in Python for financial precision.

---

## 2. Status Enums & Permitted Values

The backend must validate against these explicit literal sets before persisting to PostgreSQL:

| Entity | Field Name | Permitted Values |
|---|---|---|
| `users` | `role` | `'admin'`, `'director'`, `'sales'`, `'surveyor'`, `'engineer'`, `'finance'`, `'warehouse'`, `'technician'`, `'service_agent'` |
| `customers` | `property_type` | `'residential'`, `'commercial'`, `'industrial'`, `'agricultural'`, `'institutional'`, `'other'` |
| `leads` | `status` | `'new'`, `'contacted'`, `'qualified'`, `'survey_scheduled'`, `'quotation_sent'`, `'converted'`, `'lost'` |
| `projects` | `project_status` | `'enquiry'`, `'assessment'`, `'survey_pending'`, `'survey_approved'`, `'design_approved'`, `'quotation_pending'`, `'quotation_approved'`, `'payment_pending'`, `'ready_for_dispatch'`, `'installation_scheduled'`, `'installation_in_progress'`, `'completed'`, `'cancelled'` |
| `property_assessments` | `assessment_status` | `'draft'`, `'submitted'`, `'ai_analyzed'`, `'verified'`, `'superseded'` |
| `property_assessments` | `roof_type` | `'flat_concrete'`, `'tin_shed'`, `'tiled'`, `'pitched_metal'`, `'other'` |
| `property_assessments` | `connection_phase`| `'single_phase'`, `'three_phase'` |
| `property_assessments` | `preferred_solar_type`| `'on_grid'`, `'off_grid'`, `'hybrid'` |
| `assessment_images` | `image_type` | `'rooftop_full_view'`, `'rooftop_angle'`, `'obstacles'`, `'shaded_area'`, `'electricity_bill'`, `'switchboard_meter'`, `'other'` |
| `ai_analysis_results` | `analysis_status` | `'pending'`, `'processing'`, `'completed'`, `'failed'` |
| `site_surveys` | `approval_status` | `'pending'`, `'approved'`, `'rejected'`, `'revision_required'` |
| `products` | `category` | `'solar_panel'`, `'inverter'`, `'battery'`, `'charge_controller'`, `'mounting_structure'`, `'cable'`, `'protection_device'`, `'accessory'` |
| `solar_recommendations`| `recommendation_source` | `'engineering'`, `'ai_model'`, `'hybrid'`, `'customer_custom'` |
| `solar_recommendations`| `approval_status` | `'draft'`, `'accepted'`, `'rejected'`, `'superseded'` |
| `quotations` | `quotation_status`| `'draft'`, `'sent'`, `'approved'`, `'rejected'`, `'expired'` |
| `payments` | `payment_method` | `'neft'`, `'rtgs'`, `'upi'`, `'cheque'`, `'net_banking'`, `'cash'`, `'bank_transfer'`, `'credit_line'` |
| `payments` | `payment_status` | `'pending'`, `'completed'`, `'failed'`, `'refunded'` |
| `inventory_movements` | `movement_type` | `'purchase'`, `'reservation'`, `'release'`, `'dispatch'`, `'return'`, `'adjustment'` |
| `equipment` | `equipment_status`| `'in_stock'`, `'reserved'`, `'dispatched'`, `'installed'`, `'under_service'`, `'decommissioned'` |
| `installations` | `installation_status`| `'scheduled'`, `'in_progress'`, `'testing'`, `'completed'`, `'on_hold'`, `'cancelled'` |
| `warranties` | `warranty_status` | `'active'`, `'expired'`, `'claimed'`, `'void'` |
| `service_tickets` | `issue_category` | `'inverter_fault'`, `'panel_damage'`, `'generation_drop'`, `'wiring_issue'`, `'physical_damage'`, `'routine_maintenance'`, `'other'` |
| `service_tickets` | `priority` | `'low'`, `'medium'`, `'high'`, `'critical'` |
| `service_tickets` | `ticket_status` | `'open'`, `'assigned'`, `'in_progress'`, `'pending_parts'`, `'resolved'`, `'closed'` |

---

## 3. TypeScript Interfaces (For Frontend `frontend/src/types/database.ts`)

```typescript
export type UserRole =
  | 'admin'
  | 'director'
  | 'sales'
  | 'surveyor'
  | 'engineer'
  | 'finance'
  | 'warehouse'
  | 'technician'
  | 'service_agent';

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'survey_scheduled'
  | 'quotation_sent'
  | 'converted'
  | 'lost';

export type ProjectStatus =
  | 'enquiry'
  | 'assessment'
  | 'survey_pending'
  | 'survey_approved'
  | 'design_approved'
  | 'quotation_pending'
  | 'quotation_approved'
  | 'payment_pending'
  | 'ready_for_dispatch'
  | 'installation_scheduled'
  | 'installation_in_progress'
  | 'completed'
  | 'cancelled';

export interface User {
  id: string;
  auth_user_id?: string | null;
  full_name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  full_name: string;
  email?: string | null;
  phone: string;
  alternate_phone?: string | null;
  property_address: string;
  city: string;
  state: string;
  postal_code: string;
  latitude?: number | null;
  longitude?: number | null;
  property_type?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  lead_number: string;
  customer_id: string;
  source?: string | null;
  monthly_electricity_bill?: number | null;
  monthly_consumption_kwh?: number | null;
  estimated_system_capacity_kw?: number | null;
  status: LeadStatus;
  assigned_salesperson_id?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  project_number: string;
  customer_id: string;
  lead_id?: string | null;
  project_name: string;
  proposed_capacity_kw?: number | null;
  approved_capacity_kw?: number | null;
  project_status: ProjectStatus;
  estimated_cost?: number | null;
  final_cost?: number | null;
  expected_completion_date?: string | null;
  actual_completion_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyAssessment {
  id: string;
  customer_id: string;
  lead_id?: string | null;
  project_id?: string | null;
  property_address: string;
  city: string;
  state: string;
  postal_code: string;
  latitude?: number | null;
  longitude?: number | null;
  roof_length?: number | null;
  roof_width?: number | null;
  roof_area?: number | null;
  usable_roof_area?: number | null;
  measurement_unit?: 'sq_meters' | 'sq_feet' | 'sq_yards';
  roof_type?: string | null;
  roof_orientation?: string | null;
  roof_tilt?: number | null;
  number_of_roof_sections?: number;
  grid_availability?: boolean;
  monthly_bill?: number | null;
  monthly_consumption_kwh?: number | null;
  connection_phase?: 'single_phase' | 'three_phase' | null;
  preferred_solar_type?: 'on_grid' | 'off_grid' | 'hybrid' | null;
  budget?: number | null;
  assessment_status: 'draft' | 'submitted' | 'ai_analyzed' | 'verified' | 'superseded';
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  sku: string;
  product_name: string;
  brand: string;
  model: string;
  category: string;
  rated_power_w?: number | null;
  voltage?: number | null;
  current?: number | null;
  technical_specifications: Record<string, unknown>;
  purchase_price: number;
  selling_price: number;
  warranty_months: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Quotation {
  id: string;
  quotation_number: string;
  project_id: string;
  customer_id: string;
  system_capacity_kw: number;
  subtotal: number;
  discount: number;
  gst_amount: number;
  installation_charges: number;
  total_amount: number;
  quotation_status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
  valid_until: string;
  approved_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  project_id: string;
  quotation_id?: string | null;
  amount: number;
  payment_method: string;
  transaction_reference: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_date: string;
  created_at: string;
}

export interface TelemetryReading {
  id: string;
  equipment_id: string;
  timestamp: string;
  voltage?: number | null;
  current?: number | null;
  power?: number | null;
  temperature?: number | null;
  energy_generated_kwh?: number | null;
  source?: string;
}
```

---

## 4. SQLAlchemy 2.0 ORM Compatibility Example (For Backend `backend/app/models/`)

```python
import uuid
from datetime import datetime, date
from decimal import Decimal
from typing import Optional, List
from sqlalchemy import (
    String, Boolean, Numeric, Integer, Text, Date, DateTime, ForeignKey, CheckConstraint
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass

class CustomerModel(Base):
    __tablename__ = "customers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    property_address: Mapped[str] = mapped_column(Text, nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    postal_code: Mapped[str] = mapped_column(String(10), nullable=False)
    latitude: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 7), nullable=True)
    longitude: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 7), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    leads: Mapped[List["LeadModel"]] = relationship("LeadModel", back_populates="customer")
    projects: Mapped[List["ProjectModel"]] = relationship("ProjectModel", back_populates="customer")
```
