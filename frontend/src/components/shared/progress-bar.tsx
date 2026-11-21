import { cn } from "@/lib/utils";
import { TONE_STYLES, type StatusTone } from "@/lib/status";

export interface ProgressBarProps {
  /** 0–100; clamped. */
  value: number;
  tone?: StatusTone;
  size?: "sm" | "md";
  /** Accessible name, e.g. "Installation progress". */
  label?: string;
  className?: string;
  /** Track colour override, e.g. "bg-white/50" inside the hero. */
  trackClassName?: string;
}

/** Thin rounded progress bar with a tone-coloured fill. */
export function ProgressBar({ value, tone = "forest", size = "sm", label, className, trackClassName }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      aria-label={label}
      className={cn(
        "relative w-full overflow-hidden rounded-full bg-sage-soft",
        size === "sm" ? "h-1.5" : "h-2",
        trackClassName,
        className,
      )}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500 ease-out", TONE_STYLES[tone].bar)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
