"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronsLeftRight } from "lucide-react";
import { cn } from "@/lib/cn";

/** Width of the range thumb in px. The line is drawn where the thumb's centre
 *  sits, so grabbing the line grabs the thumb (iOS only drags the thumb). */
const THUMB = 44;

/**
 * Old screenshot over new, split by a line the reader drags. A native range
 * input does the work, so mouse, touch and keyboard come for free. Nothing
 * moves on its own (the line follows the reader's hand only), so there is no
 * reduced-motion branch. The screenshots are left-to-right pages, so the frame
 * stays `dir="ltr"` in every locale: old on the left, new on the right.
 * The chips must not take `dir="auto"`: logical insets resolve against the
 * element's own direction, so a Farsi label would swap sides.
 */
export function BeforeAfter({
  before,
  after,
  width,
  height,
  beforeAlt,
  afterAlt,
  beforeLabel,
  afterLabel,
  sliderLabel,
  caption,
  sizes,
  eager = false,
  className,
}: {
  /** Public paths of the two screenshots, same size. */
  before: string;
  after: string;
  width: number;
  height: number;
  beforeAlt: string;
  afterAlt: string;
  beforeLabel: string;
  afterLabel: string;
  sliderLabel: string;
  caption: string;
  sizes: string;
  eager?: boolean;
  className?: string;
}) {
  const [pos, setPos] = useState(50);
  // A range thumb travels the track minus its own width.
  const x = `calc(${pos}% + ${THUMB * (0.5 - pos / 100)}px)`;
  const loading = eager ? "eager" : "lazy";
  const chip = "absolute top-[var(--space-3)] bg-paper px-[var(--space-2)] py-[var(--space-1)] text-[length:var(--text-xs)] font-medium text-text";

  return (
    <figure className={cn("flex min-w-0 flex-col gap-[var(--space-3)]", className)}>
      <div dir="ltr" className="relative overflow-hidden border border-hairline bg-surface" style={{ aspectRatio: `${width} / ${height}` }}>
        <Image src={after} alt={afterAlt} fill sizes={sizes} loading={loading} className="object-cover" />
        <Image
          src={before}
          alt={beforeAlt}
          fill
          sizes={sizes}
          loading={loading}
          className="object-cover"
          style={{ clipPath: `inset(0 calc(100% - ${x}) 0 0)` }}
        />
        <span className={cn(chip, "start-[var(--space-3)]")}>{beforeLabel}</span>
        <span className={cn(chip, "end-[var(--space-3)]")}>{afterLabel}</span>
        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(event) => setPos(Number(event.target.value))}
          aria-label={sliderLabel}
          className="peer absolute inset-0 size-full cursor-ew-resize appearance-none bg-transparent opacity-0 [&::-moz-range-thumb]:h-16 [&::-moz-range-thumb]:w-11 [&::-webkit-slider-thumb]:h-16 [&::-webkit-slider-thumb]:w-11 [&::-webkit-slider-thumb]:appearance-none"
        />
        <span aria-hidden className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-signal" style={{ insetInlineStart: x }} />
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[var(--radius-full)] bg-signal-fill text-signal-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--focus)]"
          style={{ insetInlineStart: x }}
        >
          <ChevronsLeftRight className="size-5" />
        </span>
      </div>
      <figcaption dir="auto" className="text-[length:var(--text-sm)] text-dim">
        {caption}
      </figcaption>
    </figure>
  );
}
