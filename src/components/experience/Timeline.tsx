"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import type { ExperienceEntry } from "@/content/schema";
import { Hairline } from "@/components/primitives/Hairline";
import { Stagger, StaggerItem } from "@/components/primitives/Reveal";
import { ProgressRail } from "./ProgressRail";

/**
 * A single column of entries with the scroll-linked rail on the
 * inline-start edge. `ps-8` on each entry clears the rail gutter; the node
 * dot sits on the entry itself (not the padded content) so it lines up with
 * the rail regardless of writing direction — `start-0` plus a `-ms-[5px]`
 * pull centers the 10px dot on the 1px line under both LTR and RTL.
 */
export function Timeline({ entries }: { entries: ExperienceEntry[] }) {
  const t = useTranslations("experience");
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
                className="absolute top-1.5 start-0 -ms-[5px] size-[10px] rounded-full bg-signal"
              />
              <div className="flex flex-wrap items-baseline gap-[var(--space-3)]">
                <span className="font-mono text-[length:var(--text-sm)] tabular-nums text-signal">
                  {entry.period}
                </span>
                <span dir="auto" className="text-[length:var(--text-sm)] text-dim">
                  {entry.location}
                </span>
              </div>
              <h3 dir="auto" className="mt-1 font-display text-[length:var(--text-2xl)] text-text">
                {entry.company}
              </h3>
              <p dir="auto" className="text-[length:var(--text-sm)] text-dim">
                {entry.role}
              </p>
              <p dir="auto" className="mt-[var(--space-3)] max-w-[var(--measure)] text-text">
                {entry.summary}
              </p>
              {/* The one clause explaining the Nov 2025 – Feb 2026 overlap
                  between this entry and the next, rather than leaving a
                  reader to spot the contradiction. Specific to these two
                  entries, not a generic mechanism — nothing else overlaps. */}
              {entry.company === "aim2balance.ai" ? (
                <p className="mt-[var(--space-3)] text-[length:var(--text-sm)] text-dim">
                  {t("overlapNote")}
                </p>
              ) : null}
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
