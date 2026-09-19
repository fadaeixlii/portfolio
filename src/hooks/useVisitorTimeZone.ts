"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * The visitor's IANA zone, read once from the platform. "UTC" on the server
 * and the first client render so hydration markup matches (same rationale
 * as `useMotionSafe`); the real zone applies from the second render on.
 */
export function useVisitorTimeZone(): string {
  return useSyncExternalStore(
    emptySubscribe,
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    () => "UTC",
  );
}

/**
 * "yyyy-mm-dd" for right now, as seen in `timeZone`. Same server/client
 * split as above: a fixed epoch date server-side (never rendered — callers
 * gate on the mounted flag before trusting this), the real date once
 * mounted. Returns a primitive each call, so `useSyncExternalStore`'s
 * `Object.is` check stays stable within a render pass and this cannot
 * infinite-loop even though nothing here is a real subscription.
 */
export function useTodayKey(timeZone: string): string {
  return useSyncExternalStore(
    emptySubscribe,
    () => new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date()),
    () => "1970-01-01",
  );
}
