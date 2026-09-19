"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

export type SlotOption = {
  /** UTC ISO start time — the value posted to the API. */
  iso: string;
  /** Formatted in the visitor's zone. */
  visitorLabel: string;
  /** Formatted in Mohammad's zone, shown underneath in `font-mono`. */
  hostLabel: string;
};

/**
 * A real radio group: native `<input type="radio">` sharing one `name`, so
 * arrow-key navigation is free from the browser and a screen reader
 * announces the group's accessible name on entry — which is where the
 * visible count lives (`groupLabel`), since AT support for an automatic
 * "N of M" announcement isn't consistent enough to rely on alone.
 */
export function SlotList({
  slots,
  value,
  onChange,
  groupLabel,
  name = "slot",
}: {
  slots: SlotOption[];
  value: string | null;
  onChange: (iso: string) => void;
  groupLabel: string;
  name?: string;
}) {
  const id = useId();

  return (
    <div
      role="radiogroup"
      aria-label={groupLabel}
      className="grid grid-cols-2 gap-[var(--space-2)] sm:grid-cols-3"
    >
      {slots.map((slot) => {
        const inputId = `${id}-${slot.iso}`;
        return (
          // `relative`: the sr-only input below is `position: absolute` and
          // would otherwise escape to the nearest positioned ancestor —
          // `Surface`, which is `relative` itself — landing on top of
          // unrelated chrome instead of staying pinned to its own cell.
          <div key={slot.iso} className="relative">
            <input
              type="radio"
              id={inputId}
              name={name}
              value={slot.iso}
              checked={value === slot.iso}
              onChange={() => onChange(slot.iso)}
              className="peer sr-only"
            />
            <label
              htmlFor={inputId}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-[var(--space-1)] rounded-[var(--radius-md)]",
                "border border-hairline px-[var(--space-3)] py-[var(--space-2)] text-center",
                "transition-[color,border-color] duration-[var(--dur-fast)] ease-[var(--ease-out)]",
                "hover:border-signal",
                "peer-checked:border-signal peer-checked:text-signal-text",
                "peer-focus-visible:outline peer-focus-visible:outline-2",
                "peer-focus-visible:outline-[var(--focus)] peer-focus-visible:outline-offset-2",
              )}
            >
              <span className="text-[length:var(--text-sm)]">{slot.visitorLabel}</span>
              <span className="font-mono text-[length:var(--text-xs)] tabular-nums text-dim">
                {slot.hostLabel}
              </span>
            </label>
          </div>
        );
      })}
    </div>
  );
}
