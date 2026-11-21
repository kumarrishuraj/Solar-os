import type { ComponentProps, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface SectionCardProps extends Omit<ComponentProps<"section">, "title"> {
  title?: ReactNode;
  description?: ReactNode;
  /** Lucide icon shown in a sage tile before the title. */
  icon?: LucideIcon;
  /** Header-right slot: a button, toggle group or menu. */
  action?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
  /** Remove body padding (tables, edge-to-edge lists). Adds a divider under the header. */
  flush?: boolean;
  /** Heading element for the title (default h2). */
  headingLevel?: 2 | 3;
}

/**
 * The standard white card: header row (icon tile + title/description +
 * action), padded body and an optional footer.
 *
 * @example
 * <SectionCard title="Recent payments" icon={IndianRupee} action={<Button size="sm" variant="ghost">View all</Button>}>
 *   …
 * </SectionCard>
 */
export function SectionCard({
  title,
  description,
  icon: Icon,
  action,
  footer,
  children,
  className,
  contentClassName,
  flush = false,
  headingLevel = 2,
  ...props
}: SectionCardProps) {
  const hasHeader = Boolean(title || description || Icon || action);
  const Heading = headingLevel === 3 ? "h3" : "h2";

  return (
    <section
      data-slot="section-card"
      className={cn("flex min-w-0 flex-col rounded-xl border border-border bg-card shadow-card", className)}
      {...props}
    >
      {hasHeader ? (
        <div
          className={cn(
            "flex items-center gap-3 px-5 pt-5",
            flush ? "border-b border-border pb-4" : "pb-0",
          )}
        >
          {Icon ? (
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sage-soft text-forest">
              <Icon className="size-4" aria-hidden />
            </span>
          ) : null}
          <div className="min-w-0 flex-1">
            {title ? <Heading className="text-[15px] leading-snug font-medium text-ink">{title}</Heading> : null}
            {description ? <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">{description}</p> : null}
          </div>
          {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
        </div>
      ) : null}
      <div className={cn("min-w-0 flex-1", !flush && (hasHeader ? "px-5 pt-4 pb-5" : "p-5"), contentClassName)}>
        {children}
      </div>
      {footer ? <div className="border-t border-border px-5 py-3">{footer}</div> : null}
    </section>
  );
}
