"use client";

import { useRef, type ReactNode } from "react";
import { useMotionSafe } from "@/lib/motion";

/**
 * Tilts a work card a few degrees toward the pointer and drifts its
 * screenshot the other way, which reads as depth rather than as a wobble.
 *
 * Deliberately narrow:
 * - `pointer: fine` only. On a touch screen there is no hover to track, and
 *   the tilt would fire on tap and stay stuck until the next tap elsewhere.
 * - nothing under reduced motion.
 * - transforms are written straight to the style, not through React state.
 *   A card that re-renders on every mousemove is the standard way this
 *   effect becomes the most expensive thing on the page.
 *
 * The rotation is small on purpose. Past about 4 degrees the screenshot's
 * own perspective fights the card's and the whole thing looks broken.
 */
const MAX_TILT = 3.2;
const MAX_SHIFT = 6;

export function MagneticCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const motionSafe = useMotionSafe();

  const fine = () =>
    typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;

  const onMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const node = ref.current;
    if (!node || !motionSafe || !fine()) return;

    const box = node.getBoundingClientRect();
    // -0.5..0.5 from the card's centre.
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;

    node.style.transform = `perspective(900px) rotateX(${(-y * MAX_TILT).toFixed(2)}deg) rotateY(${(x * MAX_TILT).toFixed(2)}deg)`;

    const shot = node.querySelector<HTMLElement>("[data-shot]");
    // Opposite direction to the tilt, which is what sells the parallax.
    if (shot) {
      shot.style.transform = `translate3d(${(-x * MAX_SHIFT).toFixed(2)}px, ${(-y * MAX_SHIFT).toFixed(2)}px, 0) scale(1.04)`;
    }
  };

  const reset = () => {
    const node = ref.current;
    if (!node) return;
    node.style.transform = "";
    const shot = node.querySelector<HTMLElement>("[data-shot]");
    if (shot) shot.style.transform = "";
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      // Only the settle is transitioned. Transitioning the move as well
      // would lag the transform a frame behind the pointer.
      className={className}
      style={{ transition: "transform var(--dur-base) var(--ease-out)" }}
    >
      {children}
    </div>
  );
}
