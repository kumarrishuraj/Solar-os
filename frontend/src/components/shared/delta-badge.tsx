import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatDelta } from "@/lib/format";
import { TONE_STYLES } from "@/lib/status";

export interface DeltaBadgeProps {
  /** Percent change, e.g. 12.4 or -3. */
  value: number;
  /** Treat a decrease as good (overdue amount, delays, open tickets). */
  invert?: boolean;
  decimals?: number;
  className?: string;
}

/**
 * Green/red change chip with an arrow. Direction follows the sign; colour
 * follows whether the change is good (`invert` flips it).
 */
export function DeltaBadge({ value, invert = false, decimals = 1, className }: DeltaBadgeProps) {
  const direction = value > 0 ? "up" : value < 0 ? "down" : "flat";
  const good = direction === "flat" ? null : (direction === "up") !== invert;
  const styles = good === null ? TONE_STYLES.neutral : good ? TONE_STYLES.success : TONE_STYLES.danger;
  const Icon = direction === "up" ? ArrowUpRight : direction === "down" ? ArrowDownRight : Minus;
  const spoken = direction === "flat" ? "No change" : `${direction === "up" ? "Up" : "Down"} ${formatDelta(Math.abs(value), decimals).replace(/^\+/, "")}`;

  return (
    <span
      data-slot="delta-badge"
      className={cn(
        "inline-flex h-5 shrink-0 items-center gap-0.5 rounded-full pr-1.5 pl-1 text-[11px] font-medium tabular-nums",
        styles.badge,
        className,
      )}
    >
      <Icon className="size-3" aria-hidden />
      <span aria-hidden>{formatDelta(value, decimals)}</span>
      <span className="sr-only">{spoken}</span>
    </span>
  );
}
