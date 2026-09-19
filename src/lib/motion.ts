"use client";

import { useReducedMotion } from "motion/react";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/** Cubic-bezier tuples matching the --ease-* tokens in tokens.css. */
export const EASE = {
  out: [0.22, 1, 0.36, 1],
  in: [0.55, 0, 1, 0.45],
  inOut: [0.65, 0, 0.35, 1],
} as const;

export const MOTION = {
  dur: { fast: 0.12, base: 0.24, slow: 0.48 },
  reveal: {
    /** Single switch. Set false to strip every scroll reveal site-wide. */
    enabled: true,
    distance: 16,
    duration: 0.5,
    /** Fire slightly before the element is fully in view. */
    viewportMargin: "0px 0px -12% 0px",
  },
  stagger: {
    step: 0.06,
    /** Beyond this many children the last one arrives too late to feel related. */
    max: 8,
  },
  boot: {
    grid: 0.6,
    counters: 1.1,
    headline: 0.5,
  },
} as const;

/**
 * True when motion is welcome. Everything spatial must check this and fall back
 * to an instant or opacity-only state.
 *
 * `useReducedMotion()` returns `null` during SSR, so a bare `!useReducedMotion()`
 * reads `true` on the server but can flip to `false` on the very first client
 * render for a reduced-motion device — a hydration mismatch on every `initial`/
 * `transition` prop that reads this value. Gated behind the same
 * `useSyncExternalStore` mount flag used in `ThemeToggle` and
 * `useBackdropSvgSupport`: server and first client render both report
 * `mounted = false` and this returns `true`, so markup agrees; the real
 * preference applies from the second render on. Nothing is shown in the
 * meantime — `whileInView` animations haven't fired at first paint — and the
 * global `prefers-reduced-motion` CSS rule in globals.css is the second layer.
 */
export function useMotionSafe(): boolean {
  // Client-only flag without a setState-in-effect: false on the server and
  // the first client render (so SSR and hydration markup agree), true after.
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const reduced = useReducedMotion();
  return !mounted || !reduced;
}
