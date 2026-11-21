// =============================================================================
// SolarOS — CSV export
//
// `toCsv` builds an RFC 4180 document (CRLF line endings, quoted fields where
// needed, UTF-8 BOM so Excel renders "₹" correctly). `downloadCsv` must be
// called from an event handler: it touches `document` and object URLs.
// =============================================================================

/** One CSV column: `key` reads `row[key]`, or pass `value` for computed cells. */
export interface CsvColumn<T extends object = Record<string, unknown>> {
  key: string;
  label?: string;
  header?: string;
  /** Computed cell value; overrides `row[key]`. */
  value?: (row: T) => unknown;
}

export interface ToCsvOptions {
  /** Prefix the UTF-8 byte-order mark (default true) so Excel detects UTF-8. */
  bom?: boolean;
  delimiter?: "," | ";" | "\t";
}

const BOM = "﻿";
// Cells a spreadsheet would evaluate as a formula (CSV injection), except plain
// numbers and phone numbers such as "-1200" or "+91 98765 43210".
const FORMULA_PREFIX = /^[=+\-@\t\r]/;
const NUMERIC_LIKE = /^[+-]?[\d\s().,-]+$/;

function stringifyCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? "" : value.toISOString();
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";
  if (Array.isArray(value)) return value.map(stringifyCell).join("; ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function escapeCell(raw: string, delimiter: string): string {
  let text = raw;
  if (FORMULA_PREFIX.test(text) && !NUMERIC_LIKE.test(text)) text = `'${text}`;
  const needsQuotes =
    text.includes(delimiter) || text.includes('"') || text.includes("\n") || text.includes("\r") || /^\s|\s$/.test(text);
  return needsQuotes ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Reads a top-level key or a dotted path ("customer.city") from a row. */
function readPath(row: object, key: string): unknown {
  if (key in row) return (row as Record<string, unknown>)[key];
  return key.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in acc) return (acc as Record<string, unknown>)[part];
    return undefined;
  }, row);
}

/**
 * Serialises rows to CSV text.
 *
 * @example toCsv(leads, [{ key: "full_name", label: "Name" }, { key: "city", label: "City" }])
 */
export function toCsv<T extends object>(rows: readonly T[], columns: readonly CsvColumn<T>[], options: ToCsvOptions = {}): string {
  const delimiter = options.delimiter ?? ",";
  const header = columns.map((column) => escapeCell(column.label || column.header || column.key, delimiter)).join(delimiter);
  const lines = rows.map((row) =>
    columns
      .map((column) => {
        const value = column.value ? column.value(row) : readPath(row, column.key);
        return escapeCell(stringifyCell(value), delimiter);
      })
      .join(delimiter),
  );
  const body = [header, ...lines].join("\r\n");
  const withBom = options.bom ?? true;
  return (withBom ? BOM : "") + body;
}

/** "Leads export" -> "leads-export.csv"; keeps an existing .csv extension. */
export function toCsvFilename(name: string): string {
  const base = name
    .trim()
    .replace(/\.csv$/i, "")
    .replace(/[^\w\-. ]+/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
  return `${base || "export"}.csv`;
}

/** Triggers a browser download of CSV text. Call from an event handler only. */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = toCsvFilename(filename);
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Give the browser a tick to start the download before releasing the blob.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Convenience: downloads CSV supporting both (filename, rows, columns) and (filename, columns, rows) */
export function exportCsv<T extends object>(filename: string, rows: readonly T[], columns: readonly CsvColumn<T>[]): void;
export function exportCsv<T extends object>(filename: string, columns: readonly CsvColumn<T>[], rows: readonly T[]): void;
export function exportCsv<T extends object>(
  filename: string,
  arg2: readonly unknown[],
  arg3: readonly unknown[]
): void {
  const isArg2Columns =
    Array.isArray(arg2) &&
    arg2.length > 0 &&
    typeof arg2[0] === "object" &&
    arg2[0] !== null &&
    "key" in arg2[0] &&
    ("label" in arg2[0] || "header" in arg2[0]);

  let rows: readonly T[];
  let columns: readonly CsvColumn<T>[];

  if (isArg2Columns) {
    columns = arg2 as readonly CsvColumn<T>[];
    rows = (arg3 || []) as readonly T[];
  } else {
    rows = (arg2 || []) as readonly T[];
    columns = (arg3 || []) as readonly CsvColumn<T>[];
  }

  downloadCsv(filename, toCsv(rows, columns));
}

/** Alias for exportCsv */
export const exportToCsv = exportCsv;
