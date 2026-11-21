"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * `false` during server prerender and hydration, `true` once running in the
 * browser. Use it to gate browser-only UI (localStorage-derived values, camera,
 * geolocation) without calling setState inside an effect.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
