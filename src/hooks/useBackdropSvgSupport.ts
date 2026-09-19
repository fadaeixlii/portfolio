"use client";

import { useSyncExternalStore } from "react";

/**
 * True only where an SVG filter referenced from backdrop-filter actually
 * renders. Chromium: yes. Safari: no (WebKit #245510). Firefox: parses the
 * declaration as valid CSS and then renders nothing — so `@supports
 * (backdrop-filter: url(#f))` reports a false positive there and cannot be
 * used to gate this feature. Distinguishing Chromium from Firefox therefore
 * falls back to a UA-adjacent capability sniff rather than a pure CSS
 * feature query.
 *
 * Built on `useSyncExternalStore` rather than a `useEffect` + `useState`
 * pair: this is a one-shot read of an external, unchanging browser
 * capability (not a subscription to an event stream), and the repo's
 * `react-hooks/set-state-in-effect` lint rule forbids calling a `useState`
 * setter from inside an effect body for exactly this "force update / sync
 * with external data" pattern — its own message points at
 * `useSyncExternalStore` as the fix. `subscribe` is a no-op because the
 * capability cannot change after mount.
 *
 * `getServerSnapshot` returns `false` so server-rendered markup always shows
 * the universal (non-refracted) glass tier — the refracted tier is a
 * progressive enhancement applied only once the client snapshot resolves.
 * `getSnapshot` also stays `false` under `prefers-reduced-motion: reduce`:
 * the displacement filter reads as motion-adjacent texture, so
 * reduced-motion users get the flatter, calmer universal tier instead.
 */
function subscribe(): () => void {
  return () => {};
}

function getSnapshot(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return false;
  }

  // Chromium is the only engine that ships this today. Probing by painting
  // costs a frame; a cheap and honest check is whether the engine even
  // parses the declaration.
  const probe = document.createElement("div");
  probe.style.backdropFilter = "url(#glass-refraction)";
  const parsed = probe.style.backdropFilter !== "";
  if (!parsed) return false;

  // Firefox parses it too. Distinguish by checking for a Chromium-only API
  // that ships alongside working backdrop SVG filters.
  return "chrome" in window && navigator.userAgent.includes("Chrome");
}

function getServerSnapshot(): boolean {
  return false;
}

export function useBackdropSvgSupport(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
