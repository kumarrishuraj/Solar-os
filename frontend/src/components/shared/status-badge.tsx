import { cn } from "@/lib/utils";
import { getStatusMeta, TONE_STYLES, type StatusTone } from "@/lib/status";

export interface StatusBadgeProps {
  /** Status key, e.g. "survey_scheduled". Unknown keys render neutral + humanized. */
  status: string;
  /** Overrides the label from `STATUS_META`. */
  label?: string;
  /** Overrides the tone from `STATUS_META`. */
  tone?: StatusTone;
  size?: "sm" | "md";
  /** Leading tone dot (default true). */
  dot?: boolean;
  className?: string;
}

/**
 * Soft, tone-coloured status pill. Colour meaning is defined once in
 * `src/lib/status.ts` so every module speaks the same visual language.
 *
 * @example <StatusBadge status="low_stock" />
 * @example <StatusBadge status="completed" label="Paid" size="sm" />
 */
export function StatusBadge({ status, label, tone, size = "md", dot = true, className }: StatusBadgeProps) {
  const meta = getStatusMeta(status);
  const resolvedTone = tone ?? meta.tone;
  const styles = TONE_STYLES[resolvedTone];

  return (
    <span
      data-slot="status-badge"
      data-tone={resolvedTone}
      className={cn(
        "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full font-medium whitespace-nowrap",
        size === "sm" ? "h-5 px-2 text-[11px]" : "h-6 px-2.5 text-xs",
        styles.badge,
        className,
      )}
    >
      {dot ? <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", styles.dot)} /> : null}
      {label ?? meta.label}
    </span>
  );
}
