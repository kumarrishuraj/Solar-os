"use client";

import { useSyncExternalStore } from "react";

// Shared clock for relative timestamps ("5 min ago", "Delayed by 2 days").
//
// Cache Components forbids reading Date.now() while a route prerenders, and the
// react-hooks/purity lint rule forbids it during render. This store returns
// `null` on the server and during hydration, then the real time on the client,
// refreshing every 30 seconds while any component is subscribed.

const REFRESH_MS = 30_000;

let current: number | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function tick() {
  current = Date.now();
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (timer === null) {
    // Refresh immediately so a component mounting after an idle period never
    // sees a stale value; React re-reads the snapshot after subscribing.
    current = Date.now();
    timer = setInterval(tick, REFRESH_MS);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };
}

function getSnapshot(): number {
  if (current === null) current = Date.now();
  return current;
}

function getServerSnapshot(): number | null {
  return null;
}

/**
 * Current time in epoch milliseconds, or `null` during server prerender and
 * hydration. Render a stable fallback (e.g. an absolute date) when it is null.
 *
 * @example
 * const now = useNow();
 * return <span>{now ? formatRelativeTime(item.timestamp, now) : formatDate(item.timestamp)}</span>;
 */
export function useNow(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
