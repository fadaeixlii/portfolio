"use client"; // click event + DOM particle animation

import { useRef, useCallback } from "react";

interface ClickSparkProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  count?: number;
}

export function ClickSpark({
  children,
  className,
  color = "oklch(0.68 0.09 65)",
  count = 8,
}: ClickSparkProps) {
  const ref = useRef<HTMLDivElement>(null);

  const spark = useCallback(
    (e: React.MouseEvent) => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReduced) return;

      const container = ref.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      for (let i = 0; i < count; i++) {
        const particle = document.createElement("div");
        const angle = (Math.PI * 2 * i) / count;
        const velocity = 30 + Math.random() * 30;
        const size = 3 + Math.random() * 3;

        Object.assign(particle.style, {
          position: "absolute",
          left: `${x}px`,
          top: `${y}px`,
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          background: color,
          pointerEvents: "none",
          zIndex: "50",
          transform: "translate(-50%, -50%)",
        });

        container.appendChild(particle);

        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;

        particle.animate(
          [
            { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
            {
              transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`,
              opacity: 0,
            },
          ],
          { duration: 400, easing: "cubic-bezier(0.25,0.46,0.45,0.94)", fill: "forwards" }
        );

        setTimeout(() => particle.remove(), 450);
      }
    },
    [color, count]
  );

  return (
    <div ref={ref} onClick={spark} className={`relative ${className ?? ""}`}>
      {children}
    </div>
  );
}
