// =============================================================================
// SolarOS — Status vocabulary
//
// One flat lookup of every workflow status the app renders (leads, surveys,
// quotations, payments, stock, dispatch, installations, tickets, health, …)
// mapped to a human label and a semantic tone. `StatusBadge` reads it; pages
// can also use `getStatusMeta()` / `TONE_STYLES` for custom chips, bars and
// icon tiles so colour meaning stays identical everywhere.
//
// Tone meaning (see the design conventions):
//   success = completed / approved / paid / in stock / healthy
//   warning = pending / awaiting / low stock / medium
//   danger  = rejected / overdue / out of stock / critical / delayed
//   forest  = in progress / active
//   lime    = new
//   sage    = draft / info
//   neutral = closed / not connected / inactive
// =============================================================================

import { humanize } from "@/lib/format";

/** Semantic colour family for status chips, progress bars and icon tiles. */
export type StatusTone = "success" | "warning" | "danger" | "forest" | "lime" | "sage" | "neutral";

export interface StatusMeta {
  label: string;
  tone: StatusTone;
}

const meta = (label: string, tone: StatusTone): StatusMeta => ({ label, tone });

/**
 * Every known status key (snake_case, as stored by the API / mock DB).
 * Keys shared between modules (e.g. `pending`, `approved`, `in_progress`)
 * intentionally carry the same meaning everywhere.
 */
export const STATUS_META = {
  // Leads
  new: meta("New", "lime"),
  contacted: meta("Contacted", "sage"),
  qualified: meta("Qualified", "forest"),
  survey_scheduled: meta("Survey scheduled", "forest"),
  quotation_sent: meta("Quotation sent", "warning"),
  converted: meta("Converted", "success"),
  lost: meta("Lost", "danger"),

  // Site surveys
  pending: meta("Pending", "warning"),
  in_progress: meta("In progress", "forest"),
  submitted: meta("Submitted", "lime"),
  approved: meta("Approved", "success"),
  rejected: meta("Rejected", "danger"),

  // AI rooftop assessments
  pending_review: meta("Pending review", "warning"),
  reviewed: meta("Reviewed", "success"),

  // Recommendations & quotations
  draft: meta("Draft", "sage"),
  sent: meta("Sent", "warning"),
  expired: meta("Expired", "neutral"),

  // Payments
  partial: meta("Partially paid", "forest"),
  completed: meta("Completed", "success"),
  paid: meta("Paid", "success"),
  unpaid: meta("Unpaid", "warning"),
  refunded: meta("Refunded", "neutral"),
  overdue: meta("Overdue", "danger"),
  failed: meta("Failed", "danger"),

  // Stock levels
  in_stock: meta("In stock", "success"),
  low_stock: meta("Low stock", "warning"),
  out_of_stock: meta("Out of stock", "danger"),

  // Equipment dispatch
  in_warehouse: meta("In warehouse", "sage"),
  reserved: meta("Reserved", "warning"),
  dispatched: meta("Dispatched", "forest"),
  installed: meta("Installed", "success"),
  returned: meta("Returned", "danger"),

  // Installations
  scheduled: meta("Scheduled", "lime"),
  permitting: meta("Permitting", "warning"),
  inspection: meta("Inspection", "sage"),
  commissioned: meta("Commissioned", "success"),
  delayed: meta("Delayed", "danger"),
  on_hold: meta("On hold", "warning"),

  // Project lifecycle stages
  survey: meta("Survey", "forest"),
  design: meta("Design", "forest"),
  quotation: meta("Quotation", "forest"),
  payment: meta("Payment", "forest"),
  procurement: meta("Procurement", "forest"),
  installation: meta("Installation", "forest"),
  cancelled: meta("Cancelled", "neutral"),

  // Service tickets
  open: meta("Open", "warning"),
  resolved: meta("Resolved", "success"),
  closed: meta("Closed", "neutral"),

  // Priorities
  low: meta("Low", "sage"),
  medium: meta("Medium", "warning"),
  high: meta("High", "danger"),
  critical: meta("Critical", "danger"),

  // Notification priorities
  info: meta("Info", "sage"),
  warning: meta("Warning", "warning"),
  urgent: meta("Urgent", "danger"),

  // Monitoring telemetry
  not_connected: meta("Not connected", "neutral"),
  connected: meta("Connected", "success"),
  stale: meta("Stale", "warning"),

  // System health
  healthy: meta("Healthy", "success"),
  offline: meta("Offline", "danger"),

  // Warranty
  active: meta("Active", "forest"),
  expiring_soon: meta("Expiring soon", "warning"),
  inactive: meta("Inactive", "neutral"),
} as const satisfies Record<string, StatusMeta>;

export type KnownStatus = keyof typeof STATUS_META;

/** "Survey Scheduled" / "survey-scheduled" / "SURVEY_SCHEDULED" -> "survey_scheduled". */
export function normalizeStatus(status: string | null | undefined): string {
  return (status ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_");
}

/**
 * Label + tone for any status string. Unknown statuses fall back to a
 * neutral tone and a humanized label ("awaiting_parts" -> "Awaiting parts").
 */
export function getStatusMeta(status: string | null | undefined): StatusMeta {
  const key = normalizeStatus(status);
  if (key && Object.prototype.hasOwnProperty.call(STATUS_META, key)) {
    return STATUS_META[key as KnownStatus];
  }
  return { label: humanize(status), tone: "neutral" };
}

/** Tone helper for pages that only need the colour family. */
export function getStatusTone(status: string | null | undefined): StatusTone {
  return getStatusMeta(status).tone;
}

/**
 * Tailwind class sets per tone, shared by badges, dots, icon tiles, progress
 * bars and text accents. Soft backgrounds pair with a darkened text colour so
 * small labels keep readable contrast on white cards.
 */
export const TONE_STYLES: Record<
  StatusTone,
  { badge: string; dot: string; tile: string; bar: string; text: string; border: string }
> = {
  success: {
    badge: "bg-success-soft text-[color:color-mix(in_oklab,var(--color-success)_60%,var(--color-ink))]",
    dot: "bg-success",
    tile: "bg-success-soft text-success",
    bar: "bg-success",
    text: "text-success",
    border: "border-success/30",
  },
  warning: {
    badge: "bg-warning-soft text-[color:color-mix(in_oklab,var(--color-warning)_50%,var(--color-ink))]",
    dot: "bg-warning",
    tile: "bg-warning-soft text-[color:color-mix(in_oklab,var(--color-warning)_80%,var(--color-ink))]",
    bar: "bg-warning",
    text: "text-[color:color-mix(in_oklab,var(--color-warning)_70%,var(--color-ink))]",
    border: "border-warning/40",
  },
  danger: {
    badge: "bg-danger-soft text-[color:color-mix(in_oklab,var(--color-danger)_65%,var(--color-ink))]",
    dot: "bg-danger",
    tile: "bg-danger-soft text-danger",
    bar: "bg-danger",
    text: "text-danger",
    border: "border-danger/30",
  },
  forest: {
    badge: "bg-sage-soft text-forest-dark",
    dot: "bg-forest",
    tile: "bg-sage-soft text-forest",
    bar: "bg-forest",
    text: "text-forest",
    border: "border-forest/30",
  },
  lime: {
    badge: "bg-lime-soft text-forest-dark",
    dot: "bg-lime",
    tile: "bg-lime-soft text-forest-dark",
    bar: "bg-lime",
    text: "text-forest-dark",
    border: "border-lime/50",
  },
  sage: {
    badge: "bg-sage-soft text-[color:color-mix(in_oklab,var(--color-sage)_50%,var(--color-ink))]",
    dot: "bg-sage",
    tile: "bg-sage-soft text-sage",
    bar: "bg-sage",
    text: "text-sage",
    border: "border-sage/30",
  },
  neutral: {
    badge: "bg-background text-ink/70 ring-1 ring-inset ring-border",
    dot: "bg-muted-foreground/60",
    tile: "bg-background text-muted-foreground",
    bar: "bg-muted-foreground/50",
    text: "text-muted-foreground",
    border: "border-border",
  },
};
