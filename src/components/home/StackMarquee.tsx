"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useMotionSafe } from "@/lib/motion";

/**
 * A single drifting row of the stack, faster while the page is scrolling.
 *
 * The children are rendered twice and the track is translated by half its
 * width, so the second copy arrives exactly where the first started and the
 * seam never shows. `aria-hidden` on the duplicate keeps the row from being
 * read out twice.
 *
 * The motion is one rAF loop writing a single transform, not an animation
 * per chip: the drift and the scroll boost are the same number, so there is
 * nothing to keep in sync. Under reduced motion no loop starts at all and
 * the row renders as a static, scrollable strip.
 */
export function StackMarquee({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  const motionSafe = useMotionSafe();
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !motionSafe) return;

    let offset = 0;
    let lastScroll = window.scrollY;
    let boost = 0;
    let last = performance.now();
    let raf = 0;

    const onScroll = () => {
      const delta = Math.abs(window.scrollY - lastScroll);
      lastScroll = window.scrollY;
      // Cap it: a flung phone reports hundreds of pixels per event and the
      // row would blur into nothing.
      boost = Math.min(boost + delta, 240);
    };

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05); // clamp tab-switch jumps
      last = now;

      // Base drift, plus whatever scrolling has added, decaying back to base.
      const speed = 22 + boost;
      boost *= 0.92;
      offset -= speed * dt;

      // Half the track is one full copy of the children.
      const span = track.scrollWidth / 2;
      if (span > 0 && -offset >= span) offset += span;
      track.style.transform = `translate3d(${offset}px, 0, 0)`;

      raf = requestAnimationFrame(frame);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(frame);
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [motionSafe]);

  return (
    <div
      // Focusable and named, because under reduced motion this becomes a
      // horizontally scrollable strip whose children are plain spans — axe
      // flags that as `scrollable-region-focusable`, and a keyboard user
      // genuinely could not reach the chips past the fold otherwise.
      tabIndex={0}
      aria-label={label}
      className="relative overflow-hidden border-y-2 border-hairline py-[var(--space-4)]"
      // Without motion the row cannot drift, so scrolling is the only way to
      // see the rest of it.
      style={motionSafe ? undefined : { overflowX: "auto" }}
    >
      <div ref={trackRef} className="flex w-max gap-[var(--space-2)] will-change-transform">
        <div className="flex shrink-0 gap-[var(--space-2)]">{children}</div>
        <div aria-hidden className="flex shrink-0 gap-[var(--space-2)]">
          {children}
        </div>
      </div>
    </div>
  );
}
