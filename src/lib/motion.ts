"use client";

import { useReducedMotion } from "motion/react";

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
 */
export function useMotionSafe(): boolean {
  return !useReducedMotion();
}
