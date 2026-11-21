// =============================================================================
// SolarOS — Quotation maths (GST-aware line items and totals)
//
//   computeLineItem(line)                  -> QuoteLineComputed
//   computeQuotationTotals(lines, options) -> QuotationTotals
//   buildQuoteLinesFromSizing(result)      -> QuoteLineInput[]
//   defaultGstPercent(category)            -> 5 | 18
//
// Per line:  gross = qty × unit price; discount = gross × discount%;
//            taxable = gross − discount; GST = taxable × rate; total = taxable + GST
//            (each rounded to paise).
// Totals:    lines + installation charges (+ GST on installation, default 18%),
//            grand total rounded to the rupee with an explicit round-off.
// GST breakup is grouped by rate: CGST + SGST halves for intra-state supply,
// IGST for inter-state supply.
// =============================================================================

import {
  GST_RENEWABLE_DEVICES_PERCENT,
  GST_STANDARD_PERCENT,
  INSTALLATION_GST_PERCENT,
} from "./india-solar-data";
import { clamp, roundTo } from "./math";
import type {
  GstBreakupRow,
  QuotationTotals,
  QuotationTotalsOptions,
  QuoteLineComputed,
  QuoteLineInput,
  SizingComponent,
  SizingResult,
} from "./types";

const round2 = (value: number) => roundTo(value, 2);

function finiteOr(value: number, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

// --- GST rates & HSN codes ---------------------------------------------------------

const RENEWABLE_CATEGORY_IDS = new Set([
  "panel",
  "panels",
  "module",
  "modules",
  "solar_panel",
  "solar_panels",
  "solar_module",
  "solar_modules",
  "pv_module",
  "inverter",
  "inverters",
  "pcu",
  "battery",
  "batteries",
]);

/**
 * Default GST rate for a quotation line category (category id such as "panel"
 * or a display label such as "Solar panels").
 *
 * Solar modules, inverters / PCUs and batteries are renewable-energy devices at
 * 5% (reduced from 12% with effect from 22 Sep 2025). Everything else —
 * structures, cables, protection, earthing, accessories and services — is
 * charged at the standard 18% (assumption; editable per line).
 */
export function defaultGstPercent(category: string): number {
  const normalized = (category ?? "").toLowerCase().trim();
  const id = normalized.replace(/[\s-]+/g, "_");
  if (RENEWABLE_CATEGORY_IDS.has(id)) return GST_RENEWABLE_DEVICES_PERCENT;
  if (/\bsolar\s+(pv\s+)?(panel|module)s?\b|\bpv\s+modules?\b|photovoltaic/.test(normalized)) {
    return GST_RENEWABLE_DEVICES_PERCENT;
  }
  if (/\binverters?\b|\bpcu\b|power conditioning/.test(normalized)) return GST_RENEWABLE_DEVICES_PERCENT;
  if (/\bbatter(y|ies)\b/.test(normalized)) return GST_RENEWABLE_DEVICES_PERCENT;
  return GST_STANDARD_PERCENT;
}

/**
 * Indicative HSN code for a component category (8-digit, spaced as printed on
 * Indian tax invoices). Confirm classification with the company's tax adviser.
 */
export function indicativeHsnCode(
  category: string,
  details?: { name?: string; specifications?: Record<string, string | number> },
): string | undefined {
  const id = (category ?? "").toLowerCase().trim().replace(/[\s-]+/g, "_");
  const name = (details?.name ?? "").toLowerCase();
  switch (id) {
    case "panel":
      return "8541 43 00"; // photovoltaic cells assembled in modules or made up into panels
    case "inverter":
      return "8504 40 90"; // static converters
    case "battery": {
      const chemistry = String(details?.specifications?.chemistry ?? "").toLowerCase();
      if (/lead|vrla|tubular|gel|agm/.test(chemistry) || /lead.?acid|tubular|vrla/.test(name)) {
        return "8507 20 00"; // other lead-acid accumulators
      }
      return "8507 60 00"; // lithium-ion accumulators
    }
    case "racking":
      return "7308 90 90"; // structures of iron or steel
    case "cable_dc":
    case "cable_ac":
    case "cable":
      return "8544 49 99"; // insulated conductors ≤ 1,000 V
    case "protection":
      if (/acdb|dcdb|distribution|combiner|junction box|\bajb\b/.test(name)) return "8537 10 00"; // boards ≤ 1,000 V
      if (/lightning|arrest/.test(name)) return "8535 40 10"; // lightning arresters
      return "8536 30 00"; // apparatus for protecting circuits ≤ 1,000 V (SPD, MCB, fuses)
    case "earthing":
      return "8536 90 90"; // connection apparatus ≤ 1,000 V (earthing kits)
    case "monitoring":
      return "8517 62 90"; // data transmission apparatus (Wi-Fi / GPRS loggers)
    default:
      return undefined;
  }
}

// --- Line items ------------------------------------------------------------------------

/** Computes one line: gross, discount, taxable value, GST and total (paise precision). */
export function computeLineItem(line: QuoteLineInput): QuoteLineComputed {
  const quantity = Math.max(0, finiteOr(line.quantity, 0));
  const unitPrice = Math.max(0, finiteOr(line.unit_price, 0));
  const discountPercent = clamp(finiteOr(line.discount_percent, 0), 0, 100);
  const gstPercent = clamp(finiteOr(line.gst_percent, 0), 0, 100);

  const gross = round2(quantity * unitPrice);
  const discountAmount = round2((gross * discountPercent) / 100);
  const taxableValue = round2(gross - discountAmount);
  const gstAmount = round2((taxableValue * gstPercent) / 100);

  return {
    ...line,
    quantity,
    unit_price: unitPrice,
    discount_percent: discountPercent,
    gst_percent: gstPercent,
    gross,
    discount_amount: discountAmount,
    taxable_value: taxableValue,
    gst_amount: gstAmount,
    total: round2(taxableValue + gstAmount),
  };
}

// --- Totals -------------------------------------------------------------------------------

/**
 * Quotation totals. Installation charges are a separate taxable service
 * (default 18% GST) and are included in the GST breakup under their rate.
 */
export function computeQuotationTotals(
  lines: QuoteLineInput[],
  options: QuotationTotalsOptions,
): QuotationTotals {
  const computed = lines.map(computeLineItem);

  let subtotal = 0;
  let discountTotal = 0;
  let taxableTotal = 0;
  let gstTotal = 0;
  const byRate = new Map<number, { taxable: number; gst: number }>();

  const addToRate = (rate: number, taxable: number, gst: number) => {
    const row = byRate.get(rate) ?? { taxable: 0, gst: 0 };
    row.taxable += taxable;
    row.gst += gst;
    byRate.set(rate, row);
  };

  for (const line of computed) {
    subtotal += line.gross;
    discountTotal += line.discount_amount;
    taxableTotal += line.taxable_value;
    gstTotal += line.gst_amount;
    if (line.taxable_value > 0 || line.gst_amount > 0) {
      addToRate(line.gst_percent, line.taxable_value, line.gst_amount);
    }
  }

  const installationCharges = round2(Math.max(0, finiteOr(options.installation_charges, 0)));
  const installationRate = clamp(
    finiteOr(options.installation_gst_percent ?? INSTALLATION_GST_PERCENT, INSTALLATION_GST_PERCENT),
    0,
    100,
  );
  const installationGst = round2((installationCharges * installationRate) / 100);
  if (installationCharges > 0) addToRate(installationRate, installationCharges, installationGst);

  subtotal = round2(subtotal);
  discountTotal = round2(discountTotal);
  taxableTotal = round2(taxableTotal);
  gstTotal = round2(gstTotal);

  const beforeRounding = round2(taxableTotal + gstTotal + installationCharges + installationGst);
  const grandTotal = roundTo(beforeRounding, 0);
  const roundOff = round2(grandTotal - beforeRounding);

  const interState = options.inter_state === true;
  const gstBreakup: GstBreakupRow[] = [...byRate.entries()]
    .sort(([a], [b]) => a - b)
    .map(([rate, row]) => {
      const gst = round2(row.gst);
      const cgst = interState ? 0 : round2(gst / 2);
      return {
        rate,
        taxable_value: round2(row.taxable),
        cgst,
        sgst: interState ? 0 : round2(gst - cgst),
        igst: interState ? gst : 0,
      };
    });

  return {
    lines: computed,
    subtotal,
    discount_total: discountTotal,
    taxable_total: taxableTotal,
    gst_total: gstTotal,
    installation_charges: installationCharges,
    installation_gst: installationGst,
    grand_total: grandTotal,
    round_off: roundOff,
    gst_breakup: gstBreakup,
  };
}

// --- Sizing → quotation lines ----------------------------------------------------------------

function slug(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "item"
  );
}

function lineIdFor(component: SizingComponent, used: Map<string, number>): string {
  const base = `line-${slug(component.sku ?? component.category)}`;
  const count = (used.get(base) ?? 0) + 1;
  used.set(base, count);
  return count === 1 ? base : `${base}-${count}`;
}

/**
 * One quotation line per sized component (deterministic ids from SKU or
 * category, indicative HSN codes, default GST rates, no discount). Placeholder
 * components (not in the catalog) are kept at ₹0 so the gap stays visible.
 * Installation is not a line: pass `result.installation_cost` as
 * `installation_charges` to {@link computeQuotationTotals}.
 */
export function buildQuoteLinesFromSizing(result: SizingResult): QuoteLineInput[] {
  return componentsToQuoteLines(result.components);
}

/** Same as {@link buildQuoteLinesFromSizing} for a bare component list. */
export function componentsToQuoteLines(components: readonly SizingComponent[]): QuoteLineInput[] {
  const used = new Map<string, number>();
  return components
    .filter((component) => component.quantity > 0)
    .map((component) => ({
      id: lineIdFor(component, used),
      sku: component.sku,
      product_name: component.name,
      category: component.category,
      brand: component.brand,
      hsn_sac: indicativeHsnCode(component.category, {
        name: component.name,
        specifications: component.specifications,
      }),
      quantity: component.quantity,
      unit: component.unit,
      unit_price: round2(Math.max(0, component.unit_price)),
      discount_percent: 0,
      gst_percent: defaultGstPercent(component.category),
    }));
}
