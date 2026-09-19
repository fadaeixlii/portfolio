"use client";

import { useScroll, useTransform, motion } from "motion/react";
import type { RefObject } from "react";
import { useMotionSafe } from "@/lib/motion";

/**
 * A vertical rail whose fill tracks scroll position through the timeline.
 * Scroll-linked rather than triggered, so it reads as a measurement rather
 * than an entrance. Mirrors to the right-hand side under RTL via `start-0` —
 * a logical offset, never `left`/`right`.
 */
export function ProgressRail({
  targetRef,
}: {
  targetRef: RefObject<HTMLElement | null>;
}) {
  const safe = useMotionSafe();
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start 60%", "end 40%"],
  });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div
      data-rail
      aria-hidden
      className="absolute inset-y-0 start-0 w-px bg-hairline"
    >
      <motion.div
        data-rail-fill
        className="h-full w-full origin-top bg-signal"
        style={{ scaleY: safe ? scaleY : 1 }}
      />
    </div>
  );
}
