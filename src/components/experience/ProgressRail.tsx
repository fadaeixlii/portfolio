"use client";

import { useEffect, useState, type RefObject } from "react";
import { useScroll, useTransform, motion } from "motion/react";
import { useMotionSafe } from "@/lib/motion";

/**
 * A vertical rule whose fill tracks scroll position through the timeline.
 * 2px like every other rule in this design, not a hairline. Scroll-linked
 * rather than triggered, so it reads as a measurement rather than an
 * entrance. Mirrors to the right-hand side under RTL via `start-0` — a
 * logical offset, never `left`/`right`.
 *
 * It runs between the centres of the first and last dots, measured rather
 * than assumed. `inset-y-0` spanned the whole container, which put a stub of
 * rule above the first dot and left a long tail hanging past the last one —
 * the line has to start and stop *at* the things it connects.
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
  const [span, setSpan] = useState<{ top: number; height: number } | null>(null);

  useEffect(() => {
    const host = targetRef.current;
    if (!host) return;

    const measure = () => {
      const dots = host.querySelectorAll<HTMLElement>("[data-dot]");
      if (dots.length < 2) {
        setSpan(null);
        return;
      }
      // Layout position, not `getBoundingClientRect`: the reveal animates
      // each row in on a `translateY`, and a rect measured mid-reveal bakes
      // that offset into the rail, leaving it sitting 16px below every dot
      // once the rows settle. `offsetTop` ignores transforms.
      const centre = (el: HTMLElement) => {
        let y = el.offsetHeight / 2;
        let node: HTMLElement | null = el;
        while (node && node !== host) {
          y += node.offsetTop;
          node = node.offsetParent as HTMLElement | null;
        }
        return y;
      };
      const top = centre(dots[0]);
      setSpan({ top, height: centre(dots[dots.length - 1]) - top });
    };

    measure();
    // Re-measure on reflow: a locale switch, a font swap or a wrapped line
    // all move the dots, and a rail measured once would drift off them.
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    return () => observer.disconnect();
  }, [targetRef]);

  return (
    <div
      data-rail
      aria-hidden
      // start-[4px], not start-0: the 10px dots sit flush at the inline start,
      // so their centre is 5px in and a 2px rule has to start at 4 to run
      // through them. Pulling the dots out by -4px instead made them hang
      // outside the container, which is the notch that showed at every node.
      className="absolute start-[4px] w-0.5 bg-hairline"
      // Before measuring, draw nothing rather than a full-height rule that
      // would visibly snap to size on the first frame.
      style={span ? { top: span.top, height: span.height } : { top: 0, height: 0 }}
    >
      <motion.div
        data-rail-fill
        className="h-full w-full origin-top bg-signal"
        style={{ scaleY: safe ? scaleY : 1 }}
      />
    </div>
  );
}
