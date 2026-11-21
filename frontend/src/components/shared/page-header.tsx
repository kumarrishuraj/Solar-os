import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  /** Small uppercase group label above the title, e.g. "Customer management". */
  eyebrow?: ReactNode;
  /** Primary page actions (buttons). Wrap under the title on mobile. */
  actions?: ReactNode;
  /** Inline badges next to the title, e.g. `<DemoDataBadge />` or a status. */
  meta?: ReactNode;
  className?: string;
}

/**
 * Page title block: optional eyebrow, the page `<h1>`, inline meta badges,
 * a short description and right-aligned actions.
 *
 * @example
 * <PageHeader eyebrow="Sales" title="Quotations" meta={<DemoDataBadge />}
 *   description="Proposals sent to customers" actions={<Button>New quotation</Button>} />
 */
export function PageHeader({ title, description, eyebrow, actions, meta, className }: PageHeaderProps) {
  return (
    <header
      data-slot="page-header"
      className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-6", className)}
    >
      <div className="min-w-0 space-y-1.5">
        {eyebrow ? (
          <p className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">{eyebrow}</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="text-2xl leading-tight font-semibold tracking-tight text-ink md:text-[28px]">{title}</h1>
          {meta ? <div className="flex flex-wrap items-center gap-2">{meta}</div> : null}
        </div>
        {description ? <p className="max-w-2xl text-sm text-pretty text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2 md:shrink-0 md:justify-end print:hidden">{actions}</div>
      ) : null}
    </header>
  );
}
