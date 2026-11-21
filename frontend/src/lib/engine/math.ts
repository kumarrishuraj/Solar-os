// =============================================================================
// SolarOS — Numeric helpers shared by the engines (pure, no side effects)
// =============================================================================

/**
 * Half-up rounding (away from zero) that is robust to binary floating-point
 * noise: roundTo(1.005, 2) === 1.01, roundTo(-2.5, 0) === -3.
 */
export function roundTo(value: number, decimals = 2): number {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** decimals;
  const scaled = Number((Math.abs(value) * factor).toPrecision(15));
  const rounded = Math.round(scaled) / factor;
  return value < 0 ? -rounded : rounded;
}

/** Rupee rounding for INR amounts (whole rupees). */
export const roundRupees = (value: number) => roundTo(value, 0);

export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function sum(values: readonly number[]): number {
  let total = 0;
  for (const value of values) total += value;
  return total;
}

/** Finite positive number or undefined (treats 0, negatives, NaN and non-numbers as missing). */
export function positive(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : undefined;
}

/** Finite number or undefined. Numeric strings such as "49.5" are accepted. */
export function toFiniteNumber(value: unknown): number | undefined {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}
