// =============================================================================
// SolarOS — TypeScript Type Definitions
// Aligned with backend Pydantic schemas and PostgreSQL schema.
//
// Additive and backwards-compatible: existing exports and field names are kept;
// new fields on existing types are optional. Domain engine contracts (sizing,
// quotation maths, roof analysis, assistant) live in `@/lib/engine/types`.
// Data-layer reference: frontend/docs/data-layer.md
// =============================================================================

import type {
  AssistantAnswer,
  ConnectionType,
  GstBreakupRow,
  ModuleId,
  QuoteLineInput,
  RoofAnalysisResult,
  RoofCalibration,
  SizingComponent,
  SizingInput,
  SizingOverrides,
  SizingResult,
  SystemType,
} from "@/lib/engine/types";

export type { ModuleId, PermissionAction } from "@/lib/engine/types";

// --- Common Types ---

export type UUID = string;

export interface Timestamps {
  created_at: string;
  updated_at: string;
}

export type UserRole =
  | 'admin'
  | 'surveyor'
  | 'engineer'
  | 'sales_rep'
  | 'customer'
  | 'warehouse'
  | 'technician'
  | 'finance'
  | 'support';

export interface User extends Timestamps {
  id: UUID;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  /** Display title, e.g. "Director", "Sales Executive". */
  title?: string;
  city?: string;
}

// --- Files & images ---

/** An uploaded image (identical shape in the data layer and the image uploader). */
export interface ImageRef {
  id: string;
  name: string;
  /** `data:` URL (mock mode) or a served URL (live mode). */
  data_url: string;
  /** Natural pixel size. */
  width: number;
  height: number;
  size_bytes: number;
  mime_type: string;
  uploaded_at?: string;
}

/** A non-image upload such as an electricity bill PDF. */
export interface StoredFile {
  id: string;
  name: string;
  size_bytes: number;
  mime_type: string;
  data_url?: string;
  uploaded_at?: string;
}

// --- Lead & Customer Types ---

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'survey_scheduled'
  | 'quotation_sent'
  | 'converted'
  | 'lost';

export type CustomerSegment = 'residential' | 'commercial';

export interface LeadStatusChange {
  status: LeadStatus;
  note?: string;
  changed_at: string;
  changed_by?: string;
}

export interface Lead extends Timestamps {
  id: UUID;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  latitude?: number;
  longitude?: number;
  monthly_bill_avg?: number;
  annual_kwh_consumption?: number;
  estimated_system_kw?: number;
  status: LeadStatus;
  assigned_to?: UUID;
  assigned_to_name?: string;
  notes?: string;
  source?: string;
  /** Full customer enquiry (public enquiry flow or AI assistant). */
  enquiry?: EnquiryDetails;
  /** "ENQ-2026-0418" — given to the customer after an online enquiry. */
  enquiry_reference?: string;
  project_id?: UUID;
  customer_id?: UUID;
  lost_reason?: string;
  segment?: CustomerSegment;
  status_history?: LeadStatusChange[];
}

export interface Customer extends Timestamps {
  id: UUID;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  total_projects: number;
  total_spent: number;
  lead_id?: UUID;
  segment?: CustomerSegment;
  gstin?: string;
  notes?: string;
}

/** Customer with related records (`customers.get`). */
export interface CustomerDetail extends Customer {
  lead?: Lead;
  projects: Project[];
  quotations: Quotation[];
  payments: Payment[];
  tickets: ServiceTicket[];
  installations: Installation[];
}

// --- Projects ---

export type ProjectStage =
  | 'survey'
  | 'design'
  | 'quotation'
  | 'payment'
  | 'procurement'
  | 'installation'
  | 'commissioned'
  | 'cancelled';

export interface Project extends Timestamps {
  id: UUID;
  /** "PRJ-2026-041" */
  code: string;
  /** "Rahul Sharma — 3 kW Rooftop" */
  name: string;
  lead_id: UUID;
  customer_id: UUID;
  customer_name?: string;
  system_kw: number;
  stage: ProjectStage;
  quotation_id?: UUID;
  installation_id?: UUID;
  survey_id?: UUID;
  recommendation_id?: UUID;
  city: string;
  state?: string;
  address?: string;
  segment?: CustomerSegment;
}

/** Project with related records (`projects.get`). */
export interface ProjectDetail extends Project {
  lead?: Lead;
  customer?: Customer;
  quotation?: Quotation;
  installation?: Installation;
  payments: Payment[];
  equipment: Equipment[];
}

// --- Customer enquiry (public, AI-first) ---

export type PreferredContact = 'phone' | 'email' | 'whatsapp';
export type DimensionUnit = 'ft' | 'm';
export type EnquiryChannel = 'ai_assistant' | 'form';

export interface EnquiryContact {
  full_name: string;
  /** "+91 98765 43210" */
  phone: string;
  email: string;
  preferred_contact: PreferredContact;
}

export interface EnquiryLocation {
  address: string;
  city: string;
  state: string;
  postal_code: string;
  latitude?: number;
  longitude?: number;
}

export interface EnquiryRooftop {
  knows_dimensions: boolean;
  /** In `dimension_unit`. */
  roof_length?: number;
  roof_width?: number;
  dimension_unit: DimensionUnit;
  /** Usable area in square `dimension_unit` (sq ft when "ft", m² when "m"). */
  usable_area?: number;
  roof_sections?: number;
  /** e.g. "RCC flat", "Metal sheet", "Tiled (sloped)", "Asbestos" */
  roof_type?: string;
  /** e.g. "South", "South-West" */
  roof_direction?: string;
  /** e.g. "Flat", "Slight slope", "Steep slope" */
  roof_tilt?: string;
  /** e.g. ["Water tank", "Staircase room"] */
  obstacles?: string[];
  /** 0–100 */
  shaded_area_percent?: number;
}

export interface EnquiryElectricity {
  /** INR per month */
  monthly_bill?: number;
  monthly_consumption_kwh?: number;
  connection_type?: 'single_phase' | 'three_phase' | 'unknown';
  bill_file?: StoredFile;
  /** e.g. "MSEDCL", "BESCOM" */
  discom?: string;
  sanctioned_load_kw?: number;
}

export interface EnquiryPreferences {
  system_type?: 'on_grid' | 'off_grid' | 'hybrid' | 'not_sure';
  /** INR */
  budget?: number;
  battery_preference?: boolean;
  /** e.g. "Within 1 month", "1–3 months", "Just exploring" */
  installation_timeline?: string;
}

/** Everything the customer enquiry collects (stored on `Lead.enquiry`). */
export interface EnquiryDetails {
  contact: EnquiryContact;
  location: EnquiryLocation;
  rooftop: EnquiryRooftop;
  photos: ImageRef[];
  electricity: EnquiryElectricity;
  preferences: EnquiryPreferences;
  channel: EnquiryChannel;
  notes?: string;
  /** Preliminary rooftop assessment run during the enquiry; linked to the new lead on submit. */
  assessment_id?: UUID;
  /** AI assistant transcript summary, when collected conversationally. */
  conversation_summary?: string;
  submitted_at?: string;
}

export interface EnquirySubmitResult {
  lead: Lead;
  /** "ENQ-2026-0418" */
  reference: string;
}

// --- Survey Types ---

export type SurveyStatus = 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rejected';

export interface DetectedObstacle {
  type: string;
  x: number;
  y: number;
  area_sqm: number;
  confidence?: number;
}

export type SurveyChecklistResult = 'pending' | 'pass' | 'fail' | 'na';

export interface SurveyChecklistItem {
  id: string;
  label: string;
  category?: 'site' | 'structural' | 'electrical' | 'safety';
  result: SurveyChecklistResult;
  notes?: string;
}

export interface SurveyMeasurements {
  roof_length_m?: number;
  roof_width_m?: number;
  parapet_height_m?: number;
  building_height_m?: number;
  floors?: number;
  /** Cable run from array to inverter / distribution board. */
  inverter_to_db_distance_m?: number;
  earthing_pit_distance_m?: number;
}

export interface RooftopSurvey extends Timestamps {
  id: UUID;
  lead_id: UUID;
  lead_name?: string;
  aerial_image_url?: string;
  total_roof_area_sqm?: number;
  usable_roof_area_sqm?: number;
  detected_obstacles: DetectedObstacle[];
  roof_pitch_deg?: number;
  azimuth_deg?: number;
  /** Fractional shading loss 0–1. */
  shading_factor: number;
  roof_type?: string;
  roof_direction?: string;
  cable_distance_m?: number;
  structural_notes?: string;
  electrical_notes?: string;
  surveyor_notes?: string;
  surveyor_id?: UUID;
  surveyor_name?: string;
  status: SurveyStatus;
  scheduled_date?: string;
  photos: string[];
  /** Uploaded site photos. */
  images?: ImageRef[];
  checklist?: SurveyChecklistItem[];
  measurements?: SurveyMeasurements;
  connection_type?: ConnectionType;
  sanctioned_load_kw?: number;
  discom?: string;
  address?: string;
  city?: string;
  state?: string;
  project_id?: UUID;
  assessment_id?: UUID;
  started_at?: string;
  submitted_at?: string;
  approved_at?: string;
  approved_by?: string;
  rejection_reason?: string;
}

// --- AI rooftop assessment ---

export type RoofAssessmentStatus = 'pending_review' | 'reviewed' | 'rejected';
export type RoofReviewDecision = 'approved' | 'changes_requested' | 'rejected';

export interface RoofDetectionDecision {
  detection_id: string;
  decision: 'accepted' | 'rejected' | 'edited';
  label?: string;
}

export interface RoofAssessmentReview {
  reviewer_name: string;
  decision: RoofReviewDecision;
  notes?: string;
  reviewed_at: string;
  detection_decisions: RoofDetectionDecision[];
}

export interface RoofAssessment {
  id: UUID;
  lead_id?: UUID;
  survey_id?: UUID;
  lead_name?: string;
  images: ImageRef[];
  calibration?: RoofCalibration;
  result: RoofAnalysisResult;
  status: RoofAssessmentStatus;
  review?: RoofAssessmentReview;
  created_at: string;
  updated_at: string;
}

// --- Recommendation Types ---

export type RecommendationStatus = 'draft' | 'approved' | 'rejected';

/**
 * Engineering recommendation: the sizing engine's result plus record metadata.
 * `source` is "demo" when computed in the browser (mock mode, or the live
 * backend was unreachable) and "backend" when returned by the API.
 */
export type SolarRecommendation = SizingResult & {
  id: UUID;
  lead_id: UUID;
  lead_name?: string;
  survey_id?: UUID;
  assessment_id?: UUID;
  input: SizingInput;
  status: RecommendationStatus;
  version: number;
  approved_by?: string;
  approved_at?: string;
  notes?: string;
  source?: 'backend' | 'demo';
  created_at: string;
  updated_at: string;
};

/** Alias kept for compatibility — the sizing engine's component line. */
export type SystemComponent = SizingComponent;

/** `recommendations.estimate` — a sizing result that is not saved. */
export type SolarEstimate = SizingResult & { source: 'backend' | 'demo' };

// --- Quotation Types ---

export type QuotationStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';

export interface QuotationLineItem {
  id: string;
  product_name: string;
  category: string;
  brand: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  gst_percent: number;
  /** taxable value + GST for this line. */
  total: number;
  sku?: string;
  hsn_sac?: string;
  unit?: string;
  taxable_value?: number;
  gst_amount?: number;
}

export interface Quotation extends Timestamps {
  id: UUID;
  lead_id: UUID;
  lead_name?: string;
  survey_id?: UUID;
  /** "Q-2026-042" */
  quotation_number: string;
  system_capacity_kw: number;
  estimated_annual_kwh: number;
  line_items: QuotationLineItem[];
  /** Gross value of all lines before discount. */
  subtotal: number;
  discount_amount: number;
  /** All GST: lines + installation. */
  gst_amount: number;
  installation_charges: number;
  /** Grand total payable (rounded to the rupee). */
  total_cost: number;
  /** Indicative effective cost after subsidy (`total_cost - subsidy_amount`). */
  net_cost: number;
  status: QuotationStatus;
  valid_until?: string;
  notes?: string;
  project_id?: UUID;
  recommendation_id?: UUID;
  customer_id?: UUID;
  customer_phone?: string;
  customer_email?: string;
  customer_address?: string;
  customer_city?: string;
  customer_state?: string;
  /** GST % on installation services (default 18). */
  installation_gst_percent?: number;
  /** Inter-state supply → IGST; otherwise CGST + SGST. */
  inter_state?: boolean;
  /** GST on the line items only. */
  gst_total?: number;
  installation_gst?: number;
  taxable_total?: number;
  round_off?: number;
  gst_breakup?: GstBreakupRow[];
  /** Indicative PM Surya Ghar subsidy (credited to the customer after commissioning). */
  subsidy_amount?: number;
  payment_terms?: string;
  terms?: string[];
  sent_at?: string;
  approved_at?: string;
  rejected_reason?: string;
  /** Derived for approved quotations: total received so far. */
  amount_paid?: number;
  /** Derived for approved quotations: total_cost - amount_paid. */
  balance_due?: number;
}

export interface QuotationApprovalResult {
  quotation: Quotation;
  project: Project;
  advance_payment: Payment;
  reservations: { sku: string; product_name: string; quantity: number; available_after: number }[];
}

// --- Payment Types ---

export type PaymentStatus = 'pending' | 'partial' | 'completed' | 'refunded' | 'overdue';
export type PaymentMethod = 'bank_transfer' | 'upi' | 'credit_card' | 'cheque' | 'cash';
export type PaymentType = 'advance' | 'milestone' | 'final' | 'refund';

export interface PaymentReceipt {
  id: string;
  amount: number;
  method: PaymentMethod;
  reference_number?: string;
  date: string;
  notes?: string;
  recorded_by?: string;
}

/**
 * A payment instalment against an approved quotation. `amount` is the
 * instalment value; `amount_paid` what has been received against it.
 */
export interface Payment extends Timestamps {
  id: UUID;
  quotation_id: UUID;
  lead_id: UUID;
  customer_name: string;
  amount: number;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  reference_number?: string;
  /** Date of the latest receipt (or the scheduled date while pending). */
  payment_date: string;
  notes?: string;
  project_id?: UUID;
  type?: PaymentType;
  due_date?: string;
  quotation_number?: string;
  amount_paid?: number;
  receipts?: PaymentReceipt[];
}

export interface PaymentSummary {
  total_billed: number;
  total_received: number;
  outstanding: number;
  overdue_amount: number;
  overdue_count: number;
  pending_count: number;
  received_this_month: number;
}

// --- Inventory Types ---

export type EquipmentCategory = 'panel' | 'inverter' | 'battery' | 'racking' | 'cable' | 'protection' | 'accessory';
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface InventoryReservation {
  id: string;
  project_id: UUID;
  project_name?: string;
  quotation_id?: UUID;
  quantity: number;
  reserved_at: string;
}

export interface StockMovement {
  id: string;
  /** Positive = stock in, negative = stock out. */
  delta: number;
  reason: string;
  at: string;
  by?: string;
}

export interface InventoryItem extends Timestamps {
  id: UUID;
  sku: string;
  category: EquipmentCategory;
  manufacturer: string;
  model_name: string;
  rated_capacity_watts?: number;
  efficiency_pct?: number;
  unit_cost: number;
  quantity_on_hand: number;
  reserved_quantity: number;
  available_quantity: number;
  reorder_level: number;
  warranty_years: number;
  warehouse: string;
  /** Datasheet values — keys per PANEL/INVERTER/BATTERY_SPEC_KEYS in `@/lib/engine/types`. */
  specifications: Record<string, string | number>;
  status: StockStatus;
  /** "pcs" | "m" | "set" | "kit" */
  unit?: string;
  hsn_code?: string;
  supplier?: string;
  reservations?: InventoryReservation[];
  stock_movements?: StockMovement[];
}

// --- Equipment (Individual Units) Types ---

export type DispatchStatus = 'in_warehouse' | 'reserved' | 'dispatched' | 'installed' | 'returned';
export type WarrantyStatus = 'active' | 'expiring_soon' | 'expired';

export interface Equipment extends Timestamps {
  id: UUID;
  serial_number: string;
  inventory_item_id: UUID;
  product_name: string;
  category: EquipmentCategory;
  brand: string;
  model: string;
  supplier?: string;
  purchase_date: string;
  warranty_expiry: string;
  project_id?: UUID;
  project_name?: string;
  dispatch_status: DispatchStatus;
  /** Derived from `warranty_expiry` (expiring_soon = within 90 days). */
  warranty_status?: WarrantyStatus;
  sku?: string;
  installation_id?: UUID;
  customer_name?: string;
  warehouse?: string;
  dispatched_at?: string;
  installed_at?: string;
  notes?: string;
}

// --- Installation Types ---

export type InstallationStatus = 'scheduled' | 'permitting' | 'in_progress' | 'inspection' | 'commissioned' | 'delayed';

export interface InstallationTests {
  insulation_resistance_mohm?: number;
  string_voc_v?: number;
  earthing_resistance_ohm?: number;
  inverter_commissioned?: boolean;
  generation_test_kw?: number;
  passed?: boolean;
  tested_at?: string;
  notes?: string;
}

export interface CustomerConfirmation {
  name: string;
  accepted: boolean;
  confirmed_at: string;
  remarks?: string;
}

export interface InstallationHandover {
  completed_at: string;
  warranty_summary: string[];
  documents: string[];
}

export interface Installation extends Timestamps {
  id: UUID;
  quotation_id: UUID;
  lead_id: UUID;
  customer_name: string;
  system_capacity_kw: number;
  scheduled_date?: string;
  completion_date?: string;
  /** "delayed" is derived at read time when the schedule has slipped. */
  status: InstallationStatus;
  progress_percent: number;
  lead_technician_id?: UUID;
  lead_technician_name?: string;
  team_members: string[];
  equipment_serial_numbers: string[];
  checklist: InstallationChecklistItem[];
  photos: ImageRef[];
  commissioning_notes?: string;
  address: string;
  city: string;
  state?: string;
  customer_phone?: string;
  project_id?: UUID;
  quotation_number?: string;
  tests?: InstallationTests;
  customer_confirmation?: CustomerConfirmation;
  handover?: InstallationHandover;
  delay_reason?: string;
  /** Planned completion; in-progress work past this date is "delayed". */
  target_completion_date?: string;
}

export interface InstallationChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  notes?: string;
  completed_at?: string;
}

/** Installation with related records (`installations.get`). */
export interface InstallationDetail extends Installation {
  project?: Project;
  equipment: Equipment[];
}

// --- Telemetry & Monitoring Types ---

export interface TelemetryReading {
  timestamp: string;
  power_output_watts: number;
  dc_voltage: number;
  dc_current: number;
  inverter_temp_celsius: number;
  is_anomaly: boolean;
  anomaly_score?: number;
}

/** Telemetry view. In mock mode only produced as an explicit sample (`is_sample: true`). */
export interface MonitoringData {
  installation_id: UUID;
  customer_name: string;
  system_capacity_kw: number;
  today_generation_kwh: number;
  monthly_generation_kwh: number;
  total_generation_kwh: number;
  current_power_watts: number;
  system_health: 'healthy' | 'warning' | 'critical' | 'offline';
  inverter_status: string;
  last_updated: string;
  readings: TelemetryReading[];
  /** True for illustrative sample series — never real plant data. */
  is_sample?: boolean;
}

export type TelemetryStatus = 'not_connected' | 'connected' | 'stale';

export interface MonitoringSystem {
  installation_id: UUID;
  project_id?: UUID;
  customer_name: string;
  city: string;
  system_capacity_kw: number;
  commissioned_on?: string;
  telemetry_status: TelemetryStatus;
  /** e.g. "Inverter cloud API", "Data logger" — absent when not connected. */
  data_source?: string;
  last_reading_at?: string;
  inverter_model?: string;
  inverter_serial?: string;
}

// --- Service & Warranty Types ---

export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketType = 'maintenance' | 'warranty_claim' | 'complaint' | 'inspection';

export interface ServiceTicketNote {
  id: string;
  author: string;
  text: string;
  created_at: string;
}

export interface ServiceTicket extends Timestamps {
  id: UUID;
  /** "SVC-2026-089" */
  ticket_number: string;
  customer_name: string;
  installation_id?: UUID;
  equipment_serial_number?: string;
  type: TicketType;
  issue_description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assigned_technician_id?: UUID;
  assigned_technician_name?: string;
  warranty_applicable: boolean;
  warranty_status?: string;
  resolution?: string;
  resolved_at?: string;
  customer_phone?: string;
  customer_city?: string;
  project_id?: UUID;
  customer_id?: UUID;
  notes?: ServiceTicketNote[];
  closed_at?: string;
}

// --- Notification Types ---

export type NotificationPriority = 'info' | 'warning' | 'urgent';

export interface Notification {
  id: UUID;
  title: string;
  description: string;
  priority: NotificationPriority;
  category: string;
  timestamp: string;
  read: boolean;
  link?: string;
  /** Module the notification belongs to (used for role-based filtering). */
  module?: ModuleId;
}

// --- Activity / Timeline Types ---

export interface ActivityEvent {
  id: UUID;
  event: string;
  description: string;
  user?: string;
  timestamp: string;
  icon_type: 'customer' | 'survey' | 'recommendation' | 'quotation' | 'payment' | 'installation' | 'service' | 'system';
  lead_id?: UUID;
  href?: string;
}

// --- Dashboard Types ---

export interface DashboardStats {
  total_revenue: number;
  monthly_revenue: number;
  outstanding_payments: number;
  total_projects: number;
  total_leads: number;
  active_installations: number;
  completed_installations: number;
  project_completion_percent: number;
}

export interface PipelineStage {
  stage: string;
  count: number;
  color: string;
  key?: PipelineStageKey;
}

export type PipelineStageKey =
  | 'new_leads'
  | 'qualified'
  | 'survey'
  | 'design_approval'
  | 'quotation'
  | 'installation'
  | 'completed';

export interface RevenueDataPoint {
  /** Axis label: "Nov" (monthly), "16 Nov" (weekly), "FY27" (yearly). */
  month: string;
  revenue: number;
  payments_received: number;
  /** Receivables outstanding at the end of the period. */
  outstanding: number;
  /** ISO date of the period start. */
  period_start?: string;
  /** Long label for tooltips: "November 2026", "Week of 16 Nov", "FY 2026-27 (to date)". */
  label?: string;
}

export interface InstallationProgressItem {
  id: UUID;
  customer_name: string;
  system_kw: number;
  progress: number;
  status: InstallationStatus;
  city: string;
  scheduled_date?: string;
  delay_reason?: string;
  project_id?: UUID;
}

export type DashboardRange = 'weekly' | 'monthly' | 'yearly';

export interface DashboardSummary {
  range: DashboardRange;
  stats: {
    /** Financial year to date. */
    total_revenue: number;
    /** Current calendar month to date. */
    monthly_revenue: number;
    outstanding_payments: number;
    total_projects: number;
    /** Percent change vs the comparison period (see `delta_labels`). */
    deltas: {
      total_revenue: number;
      monthly_revenue: number;
      outstanding_payments: number;
      total_projects: number;
    };
    delta_labels: {
      total_revenue: string;
      monthly_revenue: string;
      outstanding_payments: string;
      total_projects: string;
    };
  };
  hero: {
    project_completion_percent: number;
    active_projects: number;
    completed_installations: number;
    pipeline_bars: { label: string; value: number; max: number }[];
  };
  pipeline: PipelineStage[];
  revenue_series: RevenueDataPoint[];
  recent_leads: Lead[];
  installation_progress: InstallationProgressItem[];
  operational: {
    equipment_dispatched: number;
    equipment_total: number;
    inventory_availability_percent: number;
    open_service_tickets: number;
    critical_tickets: number;
  };
  notifications: Notification[];
  activity: ActivityEvent[];
  /** "FY 2026-27" */
  fiscal_year_label: string;
}

// --- AI Assistant Types ---

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sources?: string[];
  suggested_followups?: string[];
  /** Structured answer for rich rendering (assistant messages). */
  answer?: AssistantAnswer;
}

export interface AssistantQueryInput {
  question: string;
  history?: Pick<ChatMessage, 'role' | 'content'>[];
  /** Defaults to the signed-in session role. */
  role?: UserRole;
}

// --- Assessment Types (legacy form shape, kept for compatibility) ---

export interface AssessmentData {
  // Customer info
  full_name: string;
  phone: string;
  email: string;
  preferred_contact: 'phone' | 'email' | 'whatsapp';

  // Location
  address: string;
  city: string;
  state: string;
  postal_code: string;
  latitude?: number;
  longitude?: number;

  // Rooftop
  roof_length_ft?: number;
  roof_width_ft?: number;
  usable_area_sqft?: number;
  roof_sections?: number;
  roof_type?: string;
  roof_direction?: string;
  roof_tilt?: string;
  obstacles?: string[];
  shaded_area_percent?: number;
  knows_dimensions: boolean;

  // Photos
  photos: File[];

  // Electricity
  monthly_bill?: number;
  monthly_consumption_kwh?: number;
  connection_type?: 'single_phase' | 'three_phase' | 'unknown';
  electricity_bill_file?: File;

  // Preferences
  system_type?: 'on_grid' | 'off_grid' | 'hybrid' | 'not_sure';
  budget?: number;
  battery_preference?: boolean;
  installation_timeline?: string;
}

// --- Organisation settings ---

export interface OrgBankDetails {
  bank_name: string;
  account_name: string;
  account_number: string;
  ifsc: string;
  upi_id?: string;
}

export interface OrgSettings {
  company_name: string;
  gstin: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  default_quotation_validity_days: number;
  default_installation_gst_percent: number;
  /** INR per kWh used for savings estimates. */
  default_tariff_per_kwh: number;
  postal_code?: string;
  website?: string;
  bank_details?: OrgBankDetails;
  /** Default terms printed on quotations. */
  quotation_terms?: string[];
  /** e.g. "40% advance, 50% on material delivery, 10% after commissioning" */
  payment_terms?: string;
  /** True for the demo organisation (GSTIN and bank details are fictitious). */
  is_demo?: boolean;
}

// --- Global search ---

export type SearchResultType =
  | 'lead'
  | 'customer'
  | 'project'
  | 'quotation'
  | 'survey'
  | 'service_ticket'
  | 'equipment';

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  type: SearchResultType;
}

export interface SearchResultGroup {
  type: SearchResultType;
  /** "Leads", "Customers", "Projects", "Quotations", "Surveys", "Service tickets", "Equipment" */
  label: string;
  results: SearchResult[];
}

// --- Lead lifecycle ---

export type LifecycleStepId =
  | 'enquiry'
  | 'requirements'
  | 'rooftop_analysis'
  | 'recommendation'
  | 'site_verification'
  | 'design_approval'
  | 'quotation'
  | 'payment'
  | 'inventory_reservation'
  | 'equipment_dispatch'
  | 'installation'
  | 'warranty'
  | 'monitoring'
  | 'service';

export type LifecycleStepStatus = 'complete' | 'current' | 'upcoming' | 'skipped';

export interface LifecycleStep {
  id: LifecycleStepId;
  label: string;
  status: LifecycleStepStatus;
  /** ISO timestamp of completion (or scheduled date for the current step). */
  date?: string;
  href?: string;
  detail?: string;
}

// --- Session & demo users ---

export interface DemoUser extends User {
  /** Role label, e.g. "Director". */
  title: string;
}

export interface SignedInSession {
  status: 'signed_in';
  user: DemoUser;
  role: UserRole;
  signed_in_at?: string;
}

export interface SignedOutSession {
  status: 'signed_out';
  user: null;
  role: null;
}

export type Session = SignedInSession | SignedOutSession;

export type ProfilePatch = Partial<Pick<DemoUser, 'full_name' | 'email' | 'phone' | 'avatar_url' | 'city'>>;

// --- Data mode / health ---

export type DataMode = 'mock' | 'live';
export type ApiHealthStatus = 'online' | 'offline' | 'checking';

export interface HealthCheckResponse {
  status: string;
  environment?: string;
  timestamp?: string;
  database?: string;
  version?: string;
}

// --- List filters (all optional; "all" or undefined = no filter) ---

export interface LeadFilters {
  search?: string;
  status?: LeadStatus | 'all';
  city?: string;
  assigned_to?: UUID | 'unassigned' | 'all';
  source?: string;
}

export interface CustomerFilters {
  search?: string;
  city?: string;
  segment?: CustomerSegment | 'all';
}

export interface ProjectFilters {
  search?: string;
  stage?: ProjectStage | 'all';
  customer_id?: UUID;
}

export interface SurveyFilters {
  search?: string;
  status?: SurveyStatus | 'all';
  surveyor_id?: UUID;
  lead_id?: UUID;
}

export interface AssessmentFilters {
  lead_id?: UUID;
  status?: RoofAssessmentStatus | 'all';
}

export interface RecommendationFilters {
  lead_id?: UUID;
  status?: RecommendationStatus | 'all';
  search?: string;
}

export interface QuotationFilters {
  search?: string;
  status?: QuotationStatus | 'all';
  lead_id?: UUID;
  project_id?: UUID;
}

export interface PaymentFilters {
  search?: string;
  status?: PaymentStatus | 'all';
  type?: PaymentType | 'all';
  quotation_id?: UUID;
  lead_id?: UUID;
  project_id?: UUID;
}

export interface InventoryFilters {
  search?: string;
  category?: EquipmentCategory | 'all';
  status?: StockStatus | 'all';
  warehouse?: string;
}

export interface EquipmentFilters {
  search?: string;
  category?: EquipmentCategory | 'all';
  dispatch_status?: DispatchStatus | 'all';
  warranty_status?: WarrantyStatus | 'all';
  project_id?: UUID;
  inventory_item_id?: UUID;
}

export interface InstallationFilters {
  search?: string;
  status?: InstallationStatus | 'all';
  technician_id?: UUID;
  project_id?: UUID;
  city?: string;
}

export interface ServiceTicketFilters {
  search?: string;
  status?: TicketStatus | 'all' | 'active';
  priority?: TicketPriority | 'all';
  type?: TicketType | 'all';
  technician_id?: UUID;
  installation_id?: UUID;
  warranty?: 'applicable' | 'not_applicable' | 'all';
}

export interface NotificationFilters {
  unread_only?: boolean;
  limit?: number;
  /** Hide notifications from modules this role cannot view (defaults to the session role). */
  role?: UserRole;
}

export interface ActivityFilters {
  limit?: number;
  lead_id?: UUID;
}

export interface UserFilters {
  role?: UserRole | 'all';
  search?: string;
}

// --- Mutation inputs ---

export interface LeadCreateInput {
  full_name: string;
  phone: string;
  email?: string;
  address?: string;
  city: string;
  state: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  monthly_bill_avg?: number;
  annual_kwh_consumption?: number;
  estimated_system_kw?: number;
  source?: string;
  assigned_to?: UUID;
  notes?: string;
  segment?: CustomerSegment;
  status?: LeadStatus;
}

export type LeadUpdateInput = Partial<
  Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'status' | 'status_history' | 'assigned_to_name'>
>;

export interface LeadConversionResult {
  lead: Lead;
  customer: Customer;
  project: Project;
}

export type CustomerCreateInput = Pick<Customer, 'full_name' | 'phone' | 'city' | 'state'> &
  Partial<Pick<Customer, 'email' | 'address' | 'postal_code' | 'segment' | 'gstin' | 'notes' | 'lead_id'>>;

export type CustomerUpdateInput = Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'total_projects' | 'total_spent'>>;

export interface SurveyScheduleInput {
  lead_id: UUID;
  /** "2026-11-24" */
  scheduled_date: string;
  surveyor_id: UUID;
  notes?: string;
}

export type SurveyUpdateInput = Partial<
  Omit<RooftopSurvey, 'id' | 'lead_id' | 'created_at' | 'updated_at' | 'status' | 'approved_at' | 'approved_by'>
>;

export interface SurveyChecklistUpdate {
  result?: SurveyChecklistResult;
  notes?: string;
}

export interface RoofAnalyzeInput {
  images: ImageRef[];
  calibration?: RoofCalibration;
  lead_id?: UUID;
  survey_id?: UUID;
}

export type RoofAssessmentReviewInput = Omit<RoofAssessmentReview, 'reviewed_at' | 'reviewer_name'> & {
  reviewer_name?: string;
};

export interface RecommendationGenerateInput {
  lead_id: UUID;
  survey_id?: UUID;
  assessment_id?: UUID;
  overrides?: SizingOverrides;
  /** Extra sizing inputs (e.g. backup_hours, budget) merged over the derived input. */
  input?: Partial<SizingInput>;
}

export interface RecommendationUpdateInput {
  overrides?: SizingOverrides;
  input?: Partial<SizingInput>;
  notes?: string;
}

/** A quotation line as edited in the builder (totals are always recomputed). */
export type QuotationLineInput = QuoteLineInput;

export interface QuotationDraftInput {
  lead_id: UUID;
  recommendation_id?: UUID;
  survey_id?: UUID;
  project_id?: UUID;
  system_capacity_kw?: number;
  estimated_annual_kwh?: number;
  line_items: QuotationLineInput[];
  installation_charges: number;
  installation_gst_percent?: number;
  inter_state?: boolean;
  subsidy_amount?: number;
  valid_until?: string;
  notes?: string;
  payment_terms?: string;
  terms?: string[];
  customer_phone?: string;
  customer_email?: string;
  customer_address?: string;
}

export type QuotationUpdateInput = Partial<Omit<QuotationDraftInput, 'lead_id'>>;

export interface PaymentRecordInput {
  quotation_id: UUID;
  amount: number;
  method: PaymentMethod;
  reference_number?: string;
  /** "2026-11-21" */
  payment_date: string;
  type: PaymentType;
  notes?: string;
}

export interface InventoryCreateInput {
  sku: string;
  category: EquipmentCategory;
  manufacturer: string;
  model_name: string;
  unit_cost: number;
  quantity_on_hand: number;
  reorder_level: number;
  warranty_years: number;
  warehouse: string;
  specifications?: Record<string, string | number>;
  rated_capacity_watts?: number;
  efficiency_pct?: number;
  unit?: string;
  hsn_code?: string;
  supplier?: string;
}

export type InventoryUpdateInput = Partial<
  Omit<InventoryItem, 'id' | 'created_at' | 'updated_at' | 'reserved_quantity' | 'available_quantity' | 'status' | 'reservations' | 'stock_movements'>
>;

export interface EquipmentCreateInput {
  serial_number: string;
  inventory_item_id: UUID;
  supplier?: string;
  purchase_date: string;
  /** Defaults to purchase date + the catalog item's warranty years. */
  warranty_expiry?: string;
  dispatch_status?: DispatchStatus;
  project_id?: UUID;
  notes?: string;
}

export interface InstallationCreateInput {
  project_id?: UUID;
  quotation_id?: UUID;
  scheduled_date?: string;
  technician_id?: UUID;
  team?: string[];
  target_completion_date?: string;
}

export interface InstallationScheduleInput {
  project_id?: UUID;
  quotation_id?: UUID;
  scheduled_date: string;
  technician_id: UUID;
  team: string[];
  target_completion_date?: string;
}

export type InstallationTestsInput = Omit<InstallationTests, 'tested_at'>;

export interface CustomerConfirmationInput {
  name: string;
  accepted: boolean;
  remarks?: string;
}

export interface InstallationHandoverInput {
  commissioning_notes?: string;
  documents?: string[];
  warranty_summary?: string[];
}

export interface ServiceTicketCreateInput {
  customer_name?: string;
  installation_id?: UUID;
  project_id?: UUID;
  equipment_serial_number?: string;
  type: TicketType;
  issue_description: string;
  priority: TicketPriority;
  customer_phone?: string;
  customer_city?: string;
  assigned_technician_id?: UUID;
}

export type OrgSettingsUpdateInput = Partial<OrgSettings>;

// --- Engine re-exports used across the UI ---

export type { SystemType, ConnectionType };

// --- API Response Types ---

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
