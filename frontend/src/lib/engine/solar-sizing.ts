// =============================================================================
// SolarOS — Solar sizing & compatibility engine (initial stub; being expanded)
// =============================================================================

import type { InventoryItem } from "@/types";
import {
  DEFAULT_PERFORMANCE_RATIO,
  DEFAULT_TARIFF_PER_KWH,
  distributeMonthly,
  getPeakSunHours,
} from "./india-solar-data";
import type { SizingInput, SizingResult } from "./types";

export function sizeSolarSystem(input: SizingInput, catalog: InventoryItem[]): SizingResult {
  void catalog;
  const segment = input.segment ?? "residential";
  const tariff = input.tariff_per_kwh ?? DEFAULT_TARIFF_PER_KWH[segment];
  const psh = getPeakSunHours(input.state).peak_sun_hours;
  const pr = DEFAULT_PERFORMANCE_RATIO;
  const monthly = input.monthly_consumption_kwh ?? (input.monthly_bill ? input.monthly_bill / tariff : 300);
  const target = (monthly * 12) / (365 * psh * pr);
  const wattage = 540;
  const count = Math.max(1, Math.round((target * 1000) / wattage));
  const kw = Math.round(count * wattage) / 1000;
  const annual = Math.round(kw * 365 * psh * pr);
  return {
    system_type: input.system_type && input.system_type !== "not_sure" ? input.system_type : "on_grid",
    recommended_capacity_kw: kw,
    target_capacity_kw: Math.round(target * 100) / 100,
    estimated_panel_count: count,
    panel_wattage_rating: wattage,
    required_area_sqm: Math.round(count * 2.15 * 1.2 * 10) / 10,
    estimated_monthly_consumption_kwh: Math.round(monthly),
    estimated_annual_generation_kwh: annual,
    monthly_generation_kwh: distributeMonthly(annual),
    offset_percentage: Math.min(100, Math.round((annual / (monthly * 12)) * 1000) / 10),
    peak_sun_hours: psh,
    performance_ratio: pr,
    tariff_per_kwh: tariff,
    annual_savings: Math.round(annual * tariff),
    installation_cost: 0,
    estimated_total_cost: 0,
    subsidy_amount: 0,
    estimated_net_cost: 0,
    simple_payback_years: null,
    estimated_co2_offset_tons_per_year: Math.round(annual * 0.716) / 1000,
    components: [],
    checks: [],
    assumptions: ["Initial engine stub — full catalog-based sizing is being implemented."],
    warnings: [],
    electrical_checks_complete: false,
  };
}
