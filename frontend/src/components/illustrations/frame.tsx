import type { ReactNode } from "react";

export interface IllustrationProps {
  className?: string;
  /** Accessible name. Without it the artwork is decorative and hidden from assistive tech. */
  title?: string;
}

/**
 * Responsive SVG wrapper shared by every illustration: viewBox only (no fixed
 * width/height), centred scaling, and role="img" + <title> when a title is given.
 */
export function IllustrationFrame({
  viewBox,
  className,
  title,
  children,
}: IllustrationProps & { viewBox: string; children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}
