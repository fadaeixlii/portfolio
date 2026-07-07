"use client"; // intersection observer + motion animation

import { useRef, useState, useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
}

export function FadeIn({
  children,
  className,
  delay = 0,
  direction = "up",
  distance = 24,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const offsets = {
    up: { x: 0, y: distance },
    down: { x: 0, y: -distance },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
    none: { x: 0, y: 0 },
  };

  const { x, y } = offsets[direction];

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={
        shouldReduce
          ? { opacity: 1 }
          : { opacity: 0, x, y }
      }
      animate={inView ? { opacity: 1, x: 0, y: 0 } : undefined}
      transition={
        shouldReduce
          ? { duration: 0 }
          : { duration: 0.2, delay, ease: [0.25, 0.46, 0.45, 0.94] }
      }
    >
      {children}
    </motion.div>
  );
}
