"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { useLocale } from "next-intl";
import { MOTION, useMotionSafe } from "@/lib/motion";
import { cn } from "@/lib/cn";

export type ReadoutFormat = "int" | "year" | "seconds" | "plus";

/** Pure formatter, exported so it can be unit-tested without a DOM. */
export function formatReadout(
  value: number,
  format: ReadoutFormat,
  locale: string,
): string {
  if (format === "year") {
    return new Intl.NumberFormat(locale, { useGrouping: false }).format(value);
  }
  if (format === "seconds") {
    return `${new Intl.NumberFormat(locale, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value)}s`;
  }
  const n = new Intl.NumberFormat(locale).format(value);
  return format === "plus" ? `${n}+` : n;
}

/**
 * A numeric readout. Mono face, tabular figures so digits do not jitter while
 * counting. This is the one place mono is allowed — it is data, not decoration.
 */
export function Readout({
  value,
  label,
  format = "int",
  count = false,
  className,
}: {
  value: number;
  label?: string;
  format?: ReadoutFormat;
  count?: boolean;
  className?: string;
}) {
  const locale = useLocale();
  const safe = useMotionSafe();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -20% 0px" });
  const [shown, setShown] = useState(count && safe ? 0 : value);
  // True while an in-progress rAF loop owns `shown`. Outside that window the
  // displayed number is derived straight from `value` — deriving it in
  // render instead of effect-syncing it keeps the effect free of the
  // "non-local derived data" setState call react-hooks/set-state-in-effect
  // flags; only the rAF callback below (an external-timer subscription, not
  // a synchronous effect-body call) is allowed to drive `shown`.
  const animating = count && safe && inView;

  useEffect(() => {
    if (!animating) return;
    const start = performance.now();
    const ms = MOTION.boot.counters * 1000;
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min((now - start) / ms, 1);
      // Ease-out so the number decelerates into its final value.
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(value * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [animating, value]);

  const displayed = animating ? shown : value;
  const rounded =
    format === "seconds" ? Math.round(displayed * 10) / 10 : Math.round(displayed);

  return (
    <div ref={ref} className={cn("flex flex-col gap-1", className)}>
      <span className="font-mono text-[length:var(--text-3xl)] tabular-nums text-signal-text">
        {formatReadout(rounded, format, locale)}
      </span>
      {label ? (
        <span className="text-[length:var(--text-sm)] text-dim">{label}</span>
      ) : null}
    </div>
  );
}

/**
 * Convenience wrapper for the common "count up to a final number" case —
 * the brief's interface contract names this separately from `Readout`, but
 * it is the same instrument with `count` forced on and `to` standing in
 * for `value`. Kept as a one-line wrapper rather than a duplicate
 * implementation.
 */
export function CountUp({
  to,
  format = "int",
  className,
}: {
  to: number;
  format?: ReadoutFormat;
  className?: string;
}) {
  return <Readout value={to} format={format} count className={className} />;
}
