// =============================================================================
// SolarOS — Formatting helpers (Indian locale)
//
// Every date/time helper is pinned to Asia/Kolkata so the server prerender and
// the browser always produce identical strings (no hydration mismatches).
// None of these helpers read the current time: relative formatting takes an
// explicit `now` (see `useNow()` in `@/hooks/use-now`).
// =============================================================================

export const APP_TIME_ZONE = "Asia/Kolkata";
const LOCALE = "en-IN";

const inrFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const inrPaiseFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatters = {
  short: new Intl.DateTimeFormat(LOCALE, { day: "numeric", month: "short", timeZone: APP_TIME_ZONE }),
  medium: new Intl.DateTimeFormat(LOCALE, { day: "numeric", month: "short", year: "numeric", timeZone: APP_TIME_ZONE }),
  long: new Intl.DateTimeFormat(LOCALE, { weekday: "short", day: "numeric", month: "long", year: "numeric", timeZone: APP_TIME_ZONE }),
} as const;

const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: APP_TIME_ZONE,
});

const timeFormatter = new Intl.DateTimeFormat(LOCALE, {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: APP_TIME_ZONE,
});

const isoDateFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: APP_TIME_ZONE,
});

const monthLabelFormatter = new Intl.DateTimeFormat(LOCALE, { month: "short", timeZone: APP_TIME_ZONE });

function isMissing(value: number | null | undefined): value is null | undefined {
  return value === null || value === undefined || Number.isNaN(value);
}

/** Removes trailing zeros from a fixed-point string: "12.50" -> "12.5", "3.00" -> "3". */
function trimZeros(fixed: string): string {
  return fixed.includes(".") ? fixed.replace(/\.?0+$/, "") : fixed;
}

function toDate(value: string | number | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

// --- Currency -----------------------------------------------------------------

/** ₹2,45,110 (Indian digit grouping). Pass `{ paise: true }` for ₹2,45,110.00. */
export function formatINR(value: number | null | undefined, opts?: { paise?: boolean }): string {
  if (isMissing(value)) return "—";
  return (opts?.paise ? inrPaiseFormatter : inrFormatter).format(value);
}

/**
 * Compact Indian notation: ₹12.45 L / ₹1.2 Cr (unit "short", default) or
 * ₹12.45 lakh / ₹1.2 crore (unit "long"). Values under one lakh use full digits.
 */
export function formatINRCompact(
  value: number | null | undefined,
  opts?: { decimals?: number; unit?: "short" | "long" },
): string {
  if (isMissing(value)) return "—";
  const decimals = opts?.decimals ?? 2;
  const long = opts?.unit === "long";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1e7) return `${sign}₹${trimZeros((abs / 1e7).toFixed(decimals))}${long ? " crore" : " Cr"}`;
  if (abs >= 1e5) return `${sign}₹${trimZeros((abs / 1e5).toFixed(decimals))}${long ? " lakh" : " L"}`;
  return formatINR(value);
}

/** Short axis-tick label for charts: ₹3.2L, ₹85k, ₹1.1Cr. */
export function formatINRAxis(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1e7) return `${sign}₹${trimZeros((abs / 1e7).toFixed(1))}Cr`;
  if (abs >= 1e5) return `${sign}₹${trimZeros((abs / 1e5).toFixed(1))}L`;
  if (abs >= 1e3) return `${sign}₹${Math.round(abs / 1e3)}k`;
  return `${sign}₹${abs}`;
}

// --- Numbers ------------------------------------------------------------------

const numberFormatters = new Map<number, Intl.NumberFormat>();

/** 1,23,456 or 1,23,456.79 (Indian grouping). */
export function formatNumber(value: number | null | undefined, decimals = 0): string {
  if (isMissing(value)) return "—";
  let formatter = numberFormatters.get(decimals);
  if (!formatter) {
    formatter = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: 0, maximumFractionDigits: decimals });
    numberFormatters.set(decimals, formatter);
  }
  return formatter.format(value);
}

/** "79%" — expects 0–100, not 0–1. */
export function formatPercent(value: number | null | undefined, decimals = 0): string {
  if (isMissing(value)) return "—";
  return `${trimZeros(value.toFixed(decimals))}%`;
}

/** Signed change label for KPI deltas: "+12.5%", "-3%". */
export function formatDelta(value: number | null | undefined, decimals = 1): string {
  if (isMissing(value)) return "—";
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${trimZeros(Math.abs(value).toFixed(decimals))}%`;
}

/** "3 kW", "7.6 kW", "10.35 kWp" (pass unit "kWp"). */
export function formatKw(value: number | null | undefined, unit: "kW" | "kWp" = "kW"): string {
  if (isMissing(value)) return "—";
  return `${trimZeros(value.toFixed(2))} ${unit}`;
}

/** "4,380 kWh"; values >= 100,000 kWh render as MWh. */
export function formatKwh(value: number | null | undefined): string {
  if (isMissing(value)) return "—";
  if (Math.abs(value) >= 100_000) return `${trimZeros((value / 1000).toFixed(1))} MWh`;
  return `${formatNumber(value)} kWh`;
}

export const SQM_PER_SQFT = 0.09290304;
export const sqmToSqft = (sqm: number) => sqm / SQM_PER_SQFT;
export const sqftToSqm = (sqft: number) => sqft * SQM_PER_SQFT;
export const feetToMetres = (ft: number) => ft * 0.3048;
export const metresToFeet = (m: number) => m / 0.3048;

/** "62 m²" or "667 sq ft". */
export function formatArea(sqm: number | null | undefined, unit: "sqm" | "sqft" = "sqm"): string {
  if (isMissing(sqm)) return "—";
  return unit === "sqft" ? `${formatNumber(sqmToSqft(sqm))} sq ft` : `${formatNumber(sqm, 1)} m²`;
}

// --- Dates & times (Asia/Kolkata) ---------------------------------------------

/** "21 Nov" (short), "21 Nov 2026" (medium, default), "Sat, 21 November 2026" (long). */
export function formatDate(
  value: string | number | Date | null | undefined,
  style: keyof typeof dateFormatters = "medium",
): string {
  if (value === null || value === undefined || value === "") return "—";
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return "—";
  return dateFormatters[style].format(date);
}

/** "21 Nov 2026, 2:00 pm". */
export function formatDateTime(value: string | number | Date | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return "—";
  return dateTimeFormatter.format(date);
}

/** "2:00 pm". */
export function formatTime(value: string | number | Date | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return "—";
  return timeFormatter.format(date);
}

/** "Nov" — month label for chart axes. */
export function formatMonth(value: string | number | Date): string {
  return monthLabelFormatter.format(toDate(value));
}

/** "2026-11-21" — calendar date in IST, for `<input type="date">` values and date keys. */
export function toISODate(value: string | number | Date): string {
  return isoDateFormatter.format(toDate(value));
}

/**
 * "just now", "5 min ago", "3 h ago", "yesterday", "4 days ago", "in 2 days",
 * "tomorrow"; beyond a week falls back to formatDate(). `now` is epoch ms and
 * must come from `useNow()` (client) or the caller — never computed here.
 */
export function formatRelativeTime(value: string | number | Date, now: number): string {
  const date = toDate(value);
  const diffMs = date.getTime() - now;
  if (Number.isNaN(diffMs)) return "—";
  const future = diffMs > 0;
  const abs = Math.abs(diffMs);
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (abs < minute) return future ? "in a moment" : "just now";
  if (abs < hour) {
    const m = Math.round(abs / minute);
    return future ? `in ${m} min` : `${m} min ago`;
  }
  if (abs < day) {
    const h = Math.round(abs / hour);
    return future ? `in ${h} h` : `${h} h ago`;
  }
  const calendarDays = Math.round(
    (Date.parse(toISODate(date)) - Date.parse(toISODate(now))) / day,
  );
  if (calendarDays === 1) return "tomorrow";
  if (calendarDays === -1) return "yesterday";
  if (Math.abs(calendarDays) < 7) {
    return calendarDays > 0 ? `in ${calendarDays} days` : `${Math.abs(calendarDays)} days ago`;
  }
  return formatDate(date);
}

// --- Text ---------------------------------------------------------------------

/** "Rahul Sharma" -> "RS". */
export function initials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "?";
}

/** pluralize(3, "lead") -> "3 leads"; pluralize(1, "battery", "batteries") -> "1 battery". */
export function pluralize(count: number, singular: string, plural?: string): string {
  return `${formatNumber(count)} ${count === 1 ? singular : (plural ?? `${singular}s`)}`;
}

/** "survey_scheduled" -> "Survey scheduled". */
export function humanize(value: string | null | undefined): string {
  if (!value) return "—";
  const text = value.replace(/[_-]+/g, " ").trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}
