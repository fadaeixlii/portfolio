"use client";

import { useRef } from "react";
import type { ExperienceEntry } from "@/content/schema";
import { Hairline } from "@/components/primitives/Hairline";
import { Stagger, StaggerItem } from "@/components/primitives/Reveal";
import { ProgressRail } from "./ProgressRail";

/**
 * A single column of entries with the scroll-linked rule on the
 * inline-start edge. `ps-8` on each entry clears the rule's gutter; the node
 * sits on the entry itself (not the padded content) so it lines up with the
 * rule regardless of writing direction — `start-0` plus a `-ms-[4px]` pull
 * centers the 10px square on the 2px line under both LTR and RTL. Square,
 * not round: radius is 0 everywhere in this design bar the availability dot.
 */
export function Timeline({ entries }: { entries: ExperienceEntry[] }) {
  const railRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={railRef} className="relative">
      <ProgressRail targetRef={railRef} />
      <Stagger className="flex flex-col gap-[var(--space-12)]">
        {entries.map((entry, index) => (
          <StaggerItem key={entry.company}>
            <div className="relative ps-[var(--space-8)]">
              <span
                aria-hidden
                data-dot
                className="absolute top-1.5 start-0 -ms-[4px] size-[10px] bg-signal"
              />
              <div className="flex flex-wrap items-baseline gap-[var(--space-3)]">
                <span className="font-mono text-[length:var(--text-sm)] tabular-nums text-signal-text">
                  {entry.period}
                </span>
                <span dir="auto" className="text-[length:var(--text-sm)] text-dim">
                  {entry.location}
                </span>
              </div>
              <h3
                dir="auto"
                className="mt-1 font-display text-[length:var(--text-2xl)] font-extrabold uppercase leading-[var(--leading-tight)] tracking-[var(--tracking-display)] text-text"
              >
                {entry.company}
              </h3>
              <p dir="auto" className="text-[length:var(--text-sm)] text-dim">
                {entry.role}
              </p>
              <p dir="auto" className="mt-[var(--space-3)] max-w-[var(--measure)] text-text">
                {entry.summary}
              </p>
              <div dir="auto" className="mt-[var(--space-4)] flex flex-wrap gap-[var(--space-3)] text-[length:var(--text-xs)] text-dim">
                {entry.stack.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
            {index < entries.length - 1 ? (
              <Hairline className="mt-[var(--space-6)] ms-[var(--space-8)]" />
            ) : null}
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
