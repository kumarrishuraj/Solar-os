import type { ReactNode } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { DeltaBadge } from "@/components/shared/delta-badge";

export type StatCardTone = "default" | "forest" | "lime" | "warning" | "danger";

export interface StatCardProps {
  label: ReactNode;
  value: ReactNode;
  icon?: LucideIcon;
  /** Percent change; renders a green/red chip with an arrow. */
  delta?: number | null;
  /** Context for the delta, e.g. "vs last month". */
  deltaLabel?: ReactNode;
  /** A decrease is good for this metric (e.g. overdue payments). */
  invertDelta?: boolean;
  /** Secondary line, e.g. "18 invoices". */
  hint?: ReactNode;
  /** Icon tile emphasis. `forest`/`lime` highlight the most important KPI. */
  tone?: StatCardTone;
  loading?: boolean;
  /** Makes the whole tile a link to the underlying list. */
  href?: string;
  className?: string;
}

const ICON_TILE: Record<StatCardTone, string> = {
  default: "bg-sage-soft text-forest",
  forest: "bg-forest text-white",
  lime: "bg-lime text-ink",
  warning: "bg-warning-soft text-[color:color-mix(in_oklab,var(--color-warning)_80%,var(--color-ink))]",
  danger: "bg-danger-soft text-danger",
};

/**
 * Compact KPI tile: uppercase label, large tabular value, delta chip.
 *
 * @example
 * <StatCard label="Revenue (Nov)" value={formatINRCompact(4860000)} icon={IndianRupee}
 *   delta={12.4} deltaLabel="vs last month" href="/payments" />
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  deltaLabel,
  invertDelta,
  hint,
  tone = "default",
  loading = false,
  href,
  className,
}: StatCardProps) {
  const hasDelta = typeof delta === "number" && Number.isFinite(delta);

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="pt-1 text-[11px] leading-tight font-medium tracking-[0.08em] text-muted-foreground uppercase">
          {label}
        </p>
        {Icon ? (
          <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", ICON_TILE[tone])}>
            <Icon className="size-4" aria-hidden />
          </span>
        ) : null}
      </div>
      {loading ? (
        <div className="mt-3 space-y-2.5" aria-hidden>
          <Skeleton className="h-7 w-28 bg-sage-soft" />
          <Skeleton className="h-4 w-36 bg-sage-soft" />
        </div>
      ) : (
        <>
          <div className="mt-2 text-2xl leading-tight font-semibold tracking-tight text-ink tabular-nums">{value}</div>
          {hasDelta || deltaLabel ? (
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
              {hasDelta ? <DeltaBadge value={delta} invert={invertDelta} /> : null}
              {deltaLabel ? <span className="text-muted-foreground">{deltaLabel}</span> : null}
            </div>
          ) : null}
          {hint ? <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p> : null}
        </>
      )}
      {loading ? <span className="sr-only">Loading</span> : null}
    </>
  );

  const shell = cn(
    "flex min-w-0 flex-col rounded-xl border border-border bg-card p-5 shadow-card",
    href &&
      "transition-colors duration-150 outline-none hover:border-forest/30 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
    className,
  );

  if (href) {
    return (
      <Link href={href} data-slot="stat-card" className={shell}>
        {body}
      </Link>
    );
  }
  return (
    <div data-slot="stat-card" className={shell} aria-busy={loading || undefined}>
      {body}
    </div>
  );
}
