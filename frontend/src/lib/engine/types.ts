// =============================================================================
// SolarOS — Domain engine contracts
//
// Shared, framework-free types for the pure engines in `src/lib/engine/*`
// (solar sizing, quotation maths, rooftop analysis, business assistant).
// The data layer (`src/lib/api.ts`, mock DB) persists these shapes and the UI
// renders them. Field names are snake_case to match the FastAPI/Pydantic
// schemas; function names are camelCase.
//
// Rules for every engine:
//   * Pure and deterministic: no Date.now(), Math.random(), fetch, storage or
//     React. Time is passed in (`now`), randomness comes from a `seed`.
//   * Never invent electrical data. A check whose inputs are missing from the
//     product catalog returns status "unknown" with an explanation instead of
//     assuming a value.
// =============================================================================

import type {
  Equipment,
  InventoryItem,
  Installation,
  Lead,
  Payment,
  Quotation,
  RevenueDataPoint,
  RooftopSurvey,
  ServiceTicket,
  UserRole,
} from "@/types";

// -----------------------------------------------------------------------------
// Modules & permissions (shared by navigation, auth and the assistant)
// -----------------------------------------------------------------------------

export type ModuleId =
  | "dashboard"
  | "leads"
  | "customers"
  | "assessment"
  | "surveys"
  | "recommendations"
  | "quotations"
  | "payments"
  | "inventory"
  | "equipment"
  | "installations"
  | "monitoring"
  | "service"
  | "assistant"
  | "settings";

export type PermissionAction = "view" | "edit" | "approve";

// -----------------------------------------------------------------------------
// Product catalog specification keys
//
// Engines read electrical/physical data ONLY from `InventoryItem.specifications`
// using these keys (numbers unless noted). Seed data must use exactly these keys.
// -----------------------------------------------------------------------------

export const PANEL_SPEC_KEYS = {
  wattage_w: "wattage_w", // rated STC power, W
  voc_v: "voc_v", // open-circuit voltage, V
  vmp_v: "vmp_v", // max-power voltage, V
  isc_a: "isc_a", // short-circuit current, A
  imp_a: "imp_a", // max-power current, A
  temp_coeff_voc_pct: "temp_coeff_voc_pct", // %/°C, negative e.g. -0.27
  temp_coeff_pmax_pct: "temp_coeff_pmax_pct", // %/°C, negative e.g. -0.35
  length_mm: "length_mm",
  width_mm: "width_mm",
  weight_kg: "weight_kg",
  cell_type: "cell_type", // string
} as const;

export const INVERTER_SPEC_KEYS = {
  rated_ac_kw: "rated_ac_kw",
  max_dc_kw: "max_dc_kw",
  phase: "phase", // string: "single" | "three"
  inverter_type: "inverter_type", // string: "on_grid" | "hybrid" | "off_grid"
  max_dc_voltage_v: "max_dc_voltage_v",
  mppt_min_v: "mppt_min_v",
  mppt_max_v: "mppt_max_v",
  mppt_count: "mppt_count",
  max_input_current_a: "max_input_current_a", // per MPPT
  battery_voltage_min_v: "battery_voltage_min_v", // hybrid/off-grid only
  battery_voltage_max_v: "battery_voltage_max_v",
} as const;

export const BATTERY_SPEC_KEYS = {
  usable_kwh: "usable_kwh",
  nominal_voltage_v: "nominal_voltage_v",
  chemistry: "chemistry", // string
  max_continuous_kw: "max_continuous_kw",
} as const;

// -----------------------------------------------------------------------------
// Solar sizing (src/lib/engine/solar-sizing.ts)
//
//   export function sizeSolarSystem(input: SizingInput, catalog: InventoryItem[]): SizingResult
// -----------------------------------------------------------------------------

export type SystemType = "on_grid" | "off_grid" | "hybrid";
export type ConnectionType = "single_phase" | "three_phase" | "unknown";
export type AreaSource = "verified_survey" | "customer_estimate" | "ai_preliminary" | "unknown";

export interface SizingOverrides {
  panel_sku?: string;
  inverter_sku?: string;
  /** `null` forces "no battery"; undefined lets the engine decide. */
  battery_sku?: string | null;
  panel_count?: number;
  system_type?: SystemType;
}

export interface SizingInput {
  /** Monthly consumption in kWh (preferred when known). */
  monthly_consumption_kwh?: number;
  /** Average monthly bill in INR; used to estimate kWh when consumption is unknown. */
  monthly_bill?: number;
  /** Tariff override, INR/kWh. Defaults by segment when absent. */
  tariff_per_kwh?: number;
  /** Indian state name (e.g. "Maharashtra"), used for peak-sun-hour lookup. */
  state?: string;
  usable_area_sqm?: number;
  area_source: AreaSource;
  /** Fractional shading loss 0–1 (0.05 = 5%). */
  shading_factor?: number;
  connection_type?: ConnectionType;
  /** Requested type; "not_sure" lets the engine recommend. */
  system_type?: SystemType | "not_sure";
  /** Desired backup duration (hybrid/off-grid), hours. */
  backup_hours?: number;
  /** Critical load to back up (hybrid/off-grid), kW. */
  critical_load_kw?: number;
  segment?: "residential" | "commercial";
  /** Budget in INR — produces a warning when exceeded; never silently shrinks the design. */
  budget?: number;
  overrides?: SizingOverrides;
}

export type CheckStatus = "pass" | "warn" | "fail" | "unknown";

export interface CompatibilityCheck {
  /** e.g. "roof_area", "dc_ac_ratio", "string_voc_cold", "mppt_window", "mppt_current", "phase_limit", "battery_voltage", "stock" */
  id: string;
  label: string;
  status: CheckStatus;
  /** Explanation including the numbers used, or which datasheet value is missing. */
  detail: string;
}

export type ComponentCategory =
  | "panel"
  | "inverter"
  | "battery"
  | "racking"
  | "cable_dc"
  | "cable_ac"
  | "protection"
  | "earthing"
  | "monitoring"
  | "accessory";

export interface SizingComponent {
  category: ComponentCategory;
  /** Display group, e.g. "Solar panels", "Inverter", "DC cables". */
  label: string;
  /** Inventory SKU when sourced from the catalog. */
  sku?: string;
  name: string;
  brand?: string;
  model?: string;
  quantity: number;
  /** "pcs" | "m" | "set" | "kit" */
  unit: string;
  unit_price: number;
  /** Values copied from catalog specifications (never invented). */
  specifications: Record<string, string | number>;
  /** False when no suitable catalog item exists — an engineer must select one. */
  from_catalog: boolean;
  available_qty?: number;
}

export interface StringDesign {
  panels_per_string: number;
  strings: number;
  string_voc_cold_v?: number;
  string_vmp_hot_v?: number;
}

export interface SizingResult {
  system_type: SystemType;
  /** DC capacity actually designed: panel count × panel wattage / 1000. */
  recommended_capacity_kw: number;
  /** Ideal capacity from consumption before roof/phase/stock constraints. */
  target_capacity_kw: number;
  estimated_panel_count: number;
  panel_wattage_rating: number;
  panel_sku?: string;
  inverter_sku?: string;
  inverter_model?: string;
  inverter_capacity_kw?: number;
  battery_sku?: string;
  battery_model?: string;
  battery_capacity_kwh?: number;
  mounting_type?: string;
  dc_ac_ratio?: number;
  string_design?: StringDesign;
  max_panels_by_area?: number;
  required_area_sqm: number;
  estimated_monthly_consumption_kwh?: number;
  estimated_annual_generation_kwh: number;
  /** 12 values, January → December. */
  monthly_generation_kwh: number[];
  offset_percentage: number;
  peak_sun_hours: number;
  performance_ratio: number;
  tariff_per_kwh: number;
  annual_savings: number;
  installation_cost: number;
  /** Gross turnkey cost = components + installation (INR, pre-subsidy). */
  estimated_total_cost: number;
  /** Indicative PM Surya Ghar subsidy (residential on-grid/hybrid only). */
  subsidy_amount: number;
  estimated_net_cost: number;
  simple_payback_years: number | null;
  estimated_co2_offset_tons_per_year: number;
  components: SizingComponent[];
  checks: CompatibilityCheck[];
  assumptions: string[];
  warnings: string[];
  /** True only when every datasheet value required for electrical checks was present. */
  electrical_checks_complete: boolean;
}

// -----------------------------------------------------------------------------
// Quotation maths (src/lib/engine/quotation-math.ts)
//
//   export function computeLineItem(line: QuoteLineInput): QuoteLineComputed
//   export function computeQuotationTotals(lines: QuoteLineInput[], options: QuotationTotalsOptions): QuotationTotals
//   export function buildQuoteLinesFromSizing(result: SizingResult): QuoteLineInput[]
//   export function defaultGstPercent(category: string): number
// -----------------------------------------------------------------------------

export interface QuoteLineInput {
  id: string;
  sku?: string;
  product_name: string;
  category: string;
  brand?: string;
  hsn_sac?: string;
  quantity: number;
  unit?: string;
  /** INR, pre-tax, per unit. */
  unit_price: number;
  /** 0–100, applied to quantity × unit_price. */
  discount_percent: number;
  /** e.g. 5 or 18. */
  gst_percent: number;
}

export interface QuoteLineComputed extends QuoteLineInput {
  gross: number;
  discount_amount: number;
  taxable_value: number;
  gst_amount: number;
  /** taxable_value + gst_amount. */
  total: number;
}

export interface QuotationTotalsOptions {
  installation_charges: number;
  /** GST on installation services, default 18. */
  installation_gst_percent?: number;
  /** Inter-state supply → IGST; otherwise CGST + SGST split equally. */
  inter_state?: boolean;
}

export interface GstBreakupRow {
  rate: number;
  taxable_value: number;
  cgst: number;
  sgst: number;
  igst: number;
}

export interface QuotationTotals {
  lines: QuoteLineComputed[];
  /** Sum of gross line values before discount. */
  subtotal: number;
  discount_total: number;
  taxable_total: number;
  gst_total: number;
  installation_charges: number;
  installation_gst: number;
  /** Rounded to the nearest rupee. */
  grand_total: number;
  round_off: number;
  gst_breakup: GstBreakupRow[];
}

// -----------------------------------------------------------------------------
// Rooftop analysis (src/lib/engine/roof-analysis.ts)
//
//   export function analyzeRoofDemo(input: RoofAnalysisInput): RoofAnalysisResult
//   export function adaptBackendRoofAnalysis(raw: unknown, images: RoofImageInput[]): RoofAnalysisResult
//
// Uncalibrated photos never yield absolute dimensions: areas are only filled
// when `calibration` provides real-world measurements.
// -----------------------------------------------------------------------------

export interface RoofImageInput {
  id: string;
  name?: string;
  /** Natural pixel size of the uploaded image. */
  width: number;
  height: number;
}

export interface RoofCalibration {
  /** Measured roof length/width in metres (customer- or surveyor-supplied). */
  roof_length_m?: number;
  roof_width_m?: number;
  /** Or a known reference length visible in the photo and its length in pixels. */
  reference_length_m?: number;
  reference_pixels?: number;
}

export interface RoofAnalysisInput {
  images: RoofImageInput[];
  calibration?: RoofCalibration;
  /** Deterministic seed (e.g. lead id + image names) so repeated runs match. */
  seed?: string;
}

export type DetectionKind = "roof_region" | "obstacle" | "shading" | "panel_layout";

export type ObstacleType =
  | "water_tank"
  | "staircase_room"
  | "parapet"
  | "tree"
  | "solar_water_heater"
  | "dish_antenna"
  | "vent"
  | "chimney"
  | "skylight"
  | "hvac"
  | "other";

/** Coordinates normalised to 0–1 relative to the image width/height. */
export interface NormalizedPoint {
  x: number;
  y: number;
}

export interface RoofDetection {
  id: string;
  image_id: string;
  kind: DetectionKind;
  /** e.g. "Roof section A", "Water tank", "Tree shade (afternoon)". */
  label: string;
  obstacle_type?: ObstacleType;
  polygon: NormalizedPoint[];
  /** 0–1, present only when the model returns it. */
  confidence?: number;
  /** Present only when calibrated. */
  area_sqm?: number;
  notes?: string;
}

export interface PanelRect {
  x: number;
  y: number;
  w: number;
  h: number;
  rotation?: number;
}

export interface PanelLayoutSuggestion {
  image_id: string;
  panels: PanelRect[];
  orientation: "portrait" | "landscape";
  estimated_panel_count: number;
  requires_calibration: boolean;
}

export interface RoofAnalysisResult {
  analysis_id: string;
  source: "model" | "demo";
  model_name: string;
  calibrated: boolean;
  roof_regions: RoofDetection[];
  obstacles: RoofDetection[];
  shading_regions: RoofDetection[];
  panel_layout: PanelLayoutSuggestion[];
  estimated_total_area_sqm?: number;
  estimated_usable_area_sqm?: number;
  /** Share of detected roof area that looks usable (0–1); available without calibration. */
  usable_fraction?: number;
  /** Estimated shading loss 0–1. */
  estimated_shading_loss?: number;
  suggested_orientation?: string;
  overall_confidence?: number;
  missing_information: string[];
  recommendations: string[];
  disclaimer: string;
}

// -----------------------------------------------------------------------------
// Business assistant (src/lib/engine/assistant.ts)
//
//   export function answerBusinessQuestion(question: string, ctx: AssistantContext): AssistantAnswer
//   export const ASSISTANT_FUNCTIONS: AssistantFunctionInfo[]
//
// Intent routing over a whitelist of read-only functions. No SQL, no eval, no
// free-form data access: each function declares the module it reads and is
// refused when `ctx.canView(module)` is false.
// -----------------------------------------------------------------------------

export type AssistantTone = "default" | "success" | "warning" | "danger";

export type AssistantBlock =
  | {
      type: "metrics";
      items: { label: string; value: string; hint?: string; tone?: AssistantTone }[];
    }
  | {
      type: "table";
      caption?: string;
      columns: { key: string; label: string; align?: "left" | "right" }[];
      rows: Record<string, string | number>[];
    }
  | {
      type: "list";
      items: { title: string; description?: string; href?: string; tone?: AssistantTone }[];
    }
  | { type: "text"; text: string };

export interface AssistantAnswer {
  /** Matched intent id, or "unknown" / "forbidden". */
  intent: string;
  /** Authorized function invoked, e.g. "get_pending_quotations". */
  function_name?: string;
  /** Permission required, e.g. "quotations:view". */
  permission?: string;
  allowed: boolean;
  /** Plain-text summary (no markdown). */
  text: string;
  blocks: AssistantBlock[];
  /** Data domains consulted, e.g. ["Quotations", "Payments"]. */
  sources: string[];
  followups: string[];
}

export interface AssistantDataSnapshot {
  leads: Lead[];
  quotations: Quotation[];
  payments: Payment[];
  inventory: InventoryItem[];
  installations: Installation[];
  tickets: ServiceTicket[];
  equipment: Equipment[];
  surveys: RooftopSurvey[];
  revenue_series?: RevenueDataPoint[];
}

export interface AssistantContext {
  role: UserRole;
  canView: (module: ModuleId) => boolean;
  data: AssistantDataSnapshot;
  /** Epoch ms supplied by the caller (engines never read the clock). */
  now: number;
}

export interface AssistantFunctionInfo {
  name: string;
  module: ModuleId;
  description: string;
  /** Example question shown as a suggested prompt. */
  example: string;
}
