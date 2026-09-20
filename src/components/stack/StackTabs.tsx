"use client";

import { useState } from "react";
import { StackChip } from "./StackChip";
import type { StackMark } from "@/lib/stack-mark";
import { cn } from "@/lib/cn";

/**
 * The stack as a tab strip: the group names run along the top like the nav,
 * and the selected group's chips sit under them.
 *
 * This replaced six stacked rows and the drifting marquee above them. The
 * rows made the page a long scroll of near-identical bands, and the marquee
 * was a second, redundant way to see the same chips.
 *
 * Real tabs, not styled buttons: `role="tablist"`, arrow keys move between
 * them, and only the selected tab is in the tab order, which is what a
 * screen-reader user expects from a strip of this shape.
 */
type MarkedGroup = { name: string; items: { name: string; mark: StackMark }[] };

export function StackTabs({ groups }: { groups: MarkedGroup[] }) {
  const [active, setActive] = useState(0);

  const move = (delta: number) => {
    const next = (active + delta + groups.length) % groups.length;
    setActive(next);
    // Focus follows selection, or the arrow keys move the highlight without
    // moving the user.
    document.getElementById(`stack-tab-${next}`)?.focus();
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label={groups.map((g) => g.name).join(", ")}
        className="flex flex-wrap items-stretch border-2 border-hairline p-[2px]"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowDown") {
            e.preventDefault();
            move(1);
          }
          if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
            e.preventDefault();
            move(-1);
          }
        }}
      >
        {groups.map((group, i) => {
          const on = i === active;
          return (
            <button
              key={group.name}
              id={`stack-tab-${i}`}
              type="button"
              role="tab"
              aria-selected={on}
              aria-controls={`stack-panel-${i}`}
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(i)}
              dir="auto"
              className={cn(
                "flex items-center px-[13px] py-[9px] text-[length:11px] font-semibold uppercase tracking-wide whitespace-nowrap",
                "transition-[background-color,color] duration-[var(--dur-fast)]",
                on ? "bg-signal-fill text-signal-ink" : "text-dim hover:text-text",
              )}
            >
              {group.name}
              {/* No opacity: at 10px the dimmed count fell to 2.98:1 on the
                  active tab and 3.73:1 on the rest, both under AA. The
                  inherited colours already pass at full strength. */}
              <span className="ms-[var(--space-2)] font-mono text-[length:10px] tabular-nums">
                {String(group.items.length).padStart(2, "0")}
              </span>
            </button>
          );
        })}
      </div>

      {groups.map((group, i) => (
        <div
          key={group.name}
          id={`stack-panel-${i}`}
          role="tabpanel"
          aria-labelledby={`stack-tab-${i}`}
          hidden={i !== active}
          className="flex flex-wrap gap-[var(--space-2)] pt-[var(--space-6)]"
        >
          {group.items.map((item) => (
            <StackChip key={item.name} name={item.name} mark={item.mark} />
          ))}
        </div>
      ))}
    </div>
  );
}
