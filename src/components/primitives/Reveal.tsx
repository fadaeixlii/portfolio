"use client";

import { motion } from "motion/react";
import type { ElementType, ReactNode } from "react";
import { MOTION, EASE, useMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/cn";

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  className?: string;
};

/**
 * Scroll reveal. Wraps every section on the site.
 * `once: true` so nothing re-animates when the reader scrolls back up — a
 * re-firing reveal is what makes this pattern feel cheap.
 */
export function Reveal({
  children,
  as = "div",
  delay = 0,
  className,
}: RevealProps) {
  const safe = useMotionSafe();
  const Component = motion[as as "div"] ?? motion.div;

  if (!MOTION.reveal.enabled || !safe) {
    // Reduced motion still gets a crossfade, never a jump.
    return (
      <Component
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.15 }}
        className={className}
      >
        {children}
      </Component>
    );
  }

  return (
    <Component
      initial={{ opacity: 0, y: MOTION.reveal.distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: MOTION.reveal.viewportMargin }}
      transition={{
        duration: MOTION.reveal.duration,
        delay,
        ease: EASE.out,
      }}
      className={className}
    >
      {children}
    </Component>
  );
}

/**
 * Parent orchestrator. Children animate in sequence rather than each running
 * its own viewport check, so a grid reads as one gesture.
 */
export function Stagger({
  children,
  as = "div",
  className,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
}) {
  const safe = useMotionSafe();
  const Component = motion[as as "div"] ?? motion.div;

  return (
    <Component
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: MOTION.reveal.viewportMargin }}
      variants={{
        hidden: {},
        shown: {
          transition: {
            staggerChildren: safe ? MOTION.stagger.step : 0,
          },
        },
      }}
      className={cn(className)}
    >
      {children}
    </Component>
  );
}

/** Child of `Stagger`. Reads its state from the parent's variants. */
export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const safe = useMotionSafe();

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: safe ? MOTION.reveal.distance : 0 },
        shown: {
          opacity: 1,
          y: 0,
          transition: {
            duration: safe ? MOTION.reveal.duration : 0.15,
            ease: EASE.out,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
