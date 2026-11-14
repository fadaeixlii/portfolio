"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

/**
 * One real result clip in a tall phone frame. Plays muted and looped only
 * while it is on screen; with reduced motion it stays on its poster frame
 * and offers the native controls instead of moving on its own.
 */
export function ResultVideo({
  name,
  label,
  priority = false,
  className,
}: {
  name: string;
  label: string;
  priority?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const video = ref.current;
    if (!video || reduce) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [reduce]);

  return (
    <figure className={cn("flex min-w-0 flex-col gap-[var(--space-3)]", className)}>
      <div className="overflow-hidden border border-hairline bg-surface">
        <video
          ref={ref}
          className="block aspect-[9/16] w-full object-cover"
          src={`/shop/ink-motion/${name}.mp4`}
          poster={`/shop/ink-motion/${name}.jpg`}
          muted
          loop
          playsInline
          preload={priority ? "metadata" : "none"}
          controls={!!reduce}
          aria-label={label}
        />
      </div>
      <figcaption dir="auto" className="text-[length:var(--text-sm)] text-dim">
        {label}
      </figcaption>
    </figure>
  );
}
