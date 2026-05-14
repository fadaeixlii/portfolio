"use client"; // intersection observer + motion animations

import { useRef, useState, useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";

interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  by?: "words" | "letters";
  onComplete?: () => void;
}

export function BlurText({
  text,
  className,
  delay = 0,
  duration = 0.4,
  by = "words",
  onComplete,
}: BlurTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
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
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const segments =
    by === "words" ? text.split(" ") : text.split("");
  const separator = by === "words" ? "\u00A0" : "";

  return (
    <span ref={ref} className={className}>
      {segments.map((segment, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={
            shouldReduce
              ? { opacity: 1 }
              : { opacity: 0, filter: "blur(12px)", y: 8 }
          }
          animate={
            inView
              ? { opacity: 1, filter: "blur(0px)", y: 0 }
              : undefined
          }
          transition={
            shouldReduce
              ? { duration: 0 }
              : {
                  duration,
                  delay: delay + i * 0.04,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }
          }
          onAnimationComplete={
            i === segments.length - 1 ? onComplete : undefined
          }
        >
          {segment}
          {i < segments.length - 1 && separator}
        </motion.span>
      ))}
    </span>
  );
}
