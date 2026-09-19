"use client";

/**
 * Loaded by `<LazyMotion>` in the locale layout, as its own chunk instead of
 * being bundled eagerly with every page that uses `m.*` (Reveal, HeroBento).
 * `domAnimation` covers `animate`/`whileInView`/variants — everything this
 * site's scroll-reveal and hero motion use. No drag or layout animation
 * anywhere, so `domMax` would only add unused weight back.
 */
export const loadMotionFeatures = () =>
  import("motion/react").then((mod) => mod.domAnimation);
