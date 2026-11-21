"use client";

import { useMediaQuery } from "@/hooks/use-media-query";

export const MOBILE_BREAKPOINT = 768;

/** True below the `md` breakpoint (768px). Always false during server prerender. */
export function useIsMobile(): boolean {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
}
