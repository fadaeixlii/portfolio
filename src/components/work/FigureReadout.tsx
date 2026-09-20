"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { useMotionSafe } from "@/lib/motion";

/**
 * A case-study figure that resolves when it scrolls into view.
 *
 * Figures are already-composed strings — "3", "5,000+", "4.2s → 2.9s",
 * "8 days → 5 days" — so this is not the home page's `Readout`, which takes a
 * number and a format. Two shapes, two readings:
 *
 * - `a → b` animates b *down from a*. The pair is a before and an after, and
 *   watching the second number travel from the first is the claim itself.
 * - anything else counts its number up from zero.
 *
 * Everything that is not a digit — units, the arrow, the thousands comma,
 * the `+` — is left exactly as authored. The component never invents a
 * figure or reformats one; it only interpolates between two numbers that
 * are already in the content.
 */
const NUM = /-?\d[\d,.]*/g;

function parse(value: string) {
  const matches = value.match(NUM);
  if (!matches) return null;

  const toNumber = (raw: string) => Number(raw.replace(/,/g, ""));
  const arrow = value.includes("→");

  if (arrow && matches.length >= 2) {
    const from = toNumber(matches[0]);
    const to = toNumber(matches[1]);
    if (!Number.isFinite(from) || !Number.isFinite(to)) return null;
    // Only the second number moves; the first is the baseline it moved from.
    return { from, to, target: matches[1], decimals: (matches[1].split(".")[1] ?? "").length };
  }

  const to = toNumber(matches[0]);
  if (!Number.isFinite(to)) return null;
  return { from: 0, to, target: matches[0], decimals: (matches[0].split(".")[1] ?? "").length };
}

export function FigureReadout({ value, className }: { value: string; className?: string }) {
  const locale = useLocale();
  const motionSafe = useMotionSafe();
  const ref = useRef<HTMLSpanElement>(null);
  // null means "not animating" — render the authored value. Holding the
  // frame rather than the whole string is what makes reduced motion safe:
  // `useMotionSafe` is mount-gated, so it reads true on the first render and
  // false immediately after. Mirroring `value` into state meant the baseline
  // written by that first pass was left on screen forever, and the figure
  // read "4.2s -> 4.2s" — a claim that the page load never improved.
  const [frame, setFrame] = useState<string | null>(null);

  useEffect(() => {
    const node = ref.current;
    // Parsed inside the effect so the dependency list stays primitives; a
    // parsed object would be a fresh reference on every render.
    const plan = parse(value);
    // No parsable number, reduced motion, or no IntersectionObserver: the
    // final value is already rendered, so there is nothing to do.
    if (!node || !plan || !motionSafe) return;

    let raf = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        const DURATION = 900;
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / DURATION);
          // Ease out: the figure decelerates into its real value rather than
          // stopping dead on it.
          const eased = 1 - (1 - t) ** 3;
          const current = plan.from + (plan.to - plan.from) * eased;
          const text = current.toLocaleString(locale, {
            minimumFractionDigits: plan.decimals,
            maximumFractionDigits: plan.decimals,
          });
          // Swap only the number that moves, so units and the arrow survive.
          setFrame(t < 1 ? value.replace(plan.target, text) : null);
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
      // Whatever half-finished frame was on screen, the authored value is
      // what should survive an unmount or a motion-preference change.
      setFrame(null);
    };
  }, [value, motionSafe, locale]);

  return (
    <span ref={ref} className={className}>
      {frame ?? value}
    </span>
  );
}
