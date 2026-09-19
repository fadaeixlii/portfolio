import { TZDate } from "@date-fns/tz";
import type { ScheduleConfig } from "./config";

export type Slot = { start: Date; end: Date };
export type Busy = { start: Date; end: Date };

const MINUTE = 60_000;

/** yyyy-mm-dd for an instant, as seen in the given timezone. */
function isoDateIn(instant: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

/** Weekday 0–6 for an instant, as seen in the given timezone. */
function weekdayIn(instant: Date, timeZone: string): number {
  const name = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
  }).format(instant);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(name);
}

/**
 * Candidate slots inside the configured working window.
 *
 * Pure: every input is an argument, including `now`, so the tests do not
 * depend on when they run. All returned instants are UTC; the wall-clock
 * window is resolved per calendar date through TZDate, so a timezone that
 * changes offset mid-range stays correct without special-casing.
 */
export function generateSlots(
  from: Date,
  to: Date,
  config: ScheduleConfig,
  now: Date,
): Slot[] {
  const {
    timeZone,
    workDayStartHour,
    workDayEndHour,
    workDays,
    slotMinutes,
    minimumNoticeHours,
    blackoutDates,
  } = config;

  const earliest = new Date(now.getTime() + minimumNoticeHours * 60 * MINUTE);
  const out: Slot[] = [];
  const blackout = new Set(blackoutDates);

  // Walk calendar dates in the target timezone. Step by 12h so a date is
  // never skipped by an offset change, then dedupe by date string.
  const seen = new Set<string>();
  const processInstant = (instant: Date) => {
    const dateKey = isoDateIn(instant, timeZone);
    if (seen.has(dateKey)) return;
    seen.add(dateKey);

    if (blackout.has(dateKey)) return;
    const [y, m, d] = dateKey.split("-").map(Number);

    const dayStart = new TZDate(y, m - 1, d, workDayStartHour, 0, 0, timeZone);
    if (!(workDays as readonly number[]).includes(weekdayIn(dayStart, timeZone))) {
      return;
    }
    const dayEnd = new TZDate(y, m - 1, d, workDayEndHour, 0, 0, timeZone);

    for (
      let s = dayStart.getTime();
      s + slotMinutes * MINUTE <= dayEnd.getTime();
      s += slotMinutes * MINUTE
    ) {
      const start = new Date(s);
      const end = new Date(s + slotMinutes * MINUTE);
      if (start < earliest) continue;
      if (start < from || end > to) continue;
      out.push({ start, end });
    }
  };

  for (let t = from.getTime(); t <= to.getTime(); t += 12 * 60 * MINUTE) {
    processInstant(new Date(t));
  }
  // The 12h stride can overshoot `to` without ever landing on `to`'s own
  // date (a window under 12h that crosses midnight) — evaluate it
  // explicitly too. `processInstant` is a no-op if that date was already
  // covered, via `seen`.
  processInstant(to);

  return out.sort((a, b) => a.start.getTime() - b.start.getTime());
}

/**
 * Drop candidates that collide with a busy block, widening each block by
 * `bufferMinutes` on both sides so back-to-back meetings are never offered.
 */
export function subtractBusy(
  slots: Slot[],
  busy: Busy[],
  bufferMinutes: number,
): Slot[] {
  const pad = bufferMinutes * MINUTE;
  return slots.filter((slot) =>
    busy.every((b) => {
      const busyStart = b.start.getTime() - pad;
      const busyEnd = b.end.getTime() + pad;
      // Overlap iff the intervals intersect on an open interval.
      return slot.end.getTime() <= busyStart || slot.start.getTime() >= busyEnd;
    }),
  );
}
