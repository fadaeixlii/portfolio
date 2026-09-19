"use client";

import { LazyMotion } from "motion/react";
import { loadMotionFeatures } from "@/lib/motion-features";

/**
 * Loads framer-motion's animation engine as its own chunk instead of
 * bundling it into every page via a static `motion/react` import. Every
 * `m.*` component site-wide (Reveal, HeroBento) reads features from this
 * context. Not `strict`: components that still use `motion.*` directly
 * (Booker, ContactForm, ProgressRail) keep working unchanged, self-sufficient
 * as before — they just don't get the lazy-loading benefit yet.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={loadMotionFeatures}>{children}</LazyMotion>;
}
