"use client";

import { useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function dateKey(year: number, month: number, day: number): string {
  return `${year}-${pad2(month + 1)}-${pad2(day)}`;
}

export type MonthGridProps = {
  /** Calendar year. */
  year: number;
  /** 0-indexed calendar month. */
  month: number;
  /** Mon..Sun, already localized. */
  weekdayLabels: readonly string[];
  /** Locale, used only to render day numbers with the right digits (Persian
   *  numerals under fa) — the grid's own math stays locale-independent. */
  locale: string;
  /** "yyyy-mm-dd" keys that have at least one open slot. */
  datesWithSlots: ReadonlySet<string>;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  /** Inclusive "yyyy-mm-dd" bookable window. Outside it, a day is disabled
   *  even if it happens to carry a slot key (it never will, but the bound
   *  keeps the grid honest if `datesWithSlots` and the window disagree). */
  minDate: string;
  maxDate: string;
  /** Builds the per-day accessible name, e.g. "Tuesday, 6 October — 3 times available". */
  labelForDay: (dateKey: string, disabled: boolean) => string;
};

/**
 * A real `<table>`. Days outside this month are blank cells, not missing
 * ones — the grid shape stays 6 rows tall regardless of the month, so nothing
 * reflows when the visitor pages between months. Days with no slots stay in
 * the table as `aria-disabled` buttons rather than `disabled` ones: a truly
 * disabled button drops out of the tab sequence, which would break the
 * roving-tabindex arrow-key walk this component relies on for the exact
 * cells the "disabled" case needs to explain.
 */
export function MonthGrid({
  year,
  month,
  weekdayLabels,
  locale,
  datesWithSlots,
  selectedDate,
  onSelectDate,
  minDate,
  maxDate,
  labelForDay,
}: MonthGridProps) {
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const firstWeekday = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const isDisabled = (day: number) => {
    const key = dateKey(year, month, day);
    return !datesWithSlots.has(key) || key < minDate || key > maxDate;
  };

  const selectedDay =
    selectedDate?.slice(0, 7) === `${year}-${pad2(month + 1)}`
      ? Number(selectedDate.slice(8, 10))
      : null;
  const firstEnabled =
    Array.from({ length: daysInMonth }, (_, i) => i + 1).find((d) => !isDisabled(d)) ?? 1;
  const [focusDay, setFocusDay] = useState<number>(selectedDay ?? firstEnabled);

  const idFor = (day: number) => `sched-day-${year}-${month}-${day}`;

  function move(delta: number, from: number) {
    const target = from + delta;
    if (target < 1 || target > daysInMonth) return; // stays within this month — paging months is the Prev/Next buttons' job
    setFocusDay(target);
    document.getElementById(idFor(target))?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, day: number) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1, day);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1, day);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      move(7, day);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      move(-7, day);
    }
  }

  const digits = new Intl.NumberFormat(locale);

  return (
    <table className="w-full border-collapse">
      <caption className="sr-only">{dateKey(year, month, 1)}</caption>
      <thead>
        <tr>
          {weekdayLabels.map((label) => (
            <th
              key={label}
              scope="col"
              className="pb-[var(--space-2)] text-center text-[length:var(--text-xs)] font-normal text-dim"
            >
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weeks.map((week, wi) => (
          <tr key={wi}>
            {week.map((day, di) => {
              if (day === null) return <td key={di} aria-hidden="true" />;
              const key = dateKey(year, month, day);
              const disabled = isDisabled(day);
              const selected = key === selectedDate;
              return (
                <td key={di} className="p-[var(--space-1)] text-center">
                  <button
                    type="button"
                    id={idFor(day)}
                    aria-label={labelForDay(key, disabled)}
                    aria-disabled={disabled || undefined}
                    aria-pressed={selected}
                    tabIndex={day === focusDay ? 0 : -1}
                    onFocus={() => setFocusDay(day)}
                    onKeyDown={(e) => handleKeyDown(e, day)}
                    onClick={() => {
                      if (!disabled) onSelectDate(key);
                    }}
                    className={cn(
                      "inline-flex size-10 items-center justify-center rounded-[var(--radius-sm)]",
                      "font-mono text-[length:var(--text-sm)] tabular-nums",
                      "border border-transparent",
                      "transition-[color,border-color] duration-[var(--dur-fast)] ease-[var(--ease-out)]",
                      disabled
                        ? "cursor-not-allowed text-dim opacity-40"
                        : "cursor-pointer text-text hover:border-signal hover:text-signal-text",
                      selected && "border-signal-fill bg-signal-fill text-signal-ink",
                    )}
                  >
                    {digits.format(day)}
                  </button>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
