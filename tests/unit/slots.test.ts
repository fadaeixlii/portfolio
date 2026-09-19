import { describe, it, expect } from "vitest";
import { generateSlots, subtractBusy } from "@/lib/calendar/slots";
import { SCHEDULE_CONFIG } from "@/lib/calendar/config";

const CFG = SCHEDULE_CONFIG;
const at = (iso: string) => new Date(iso);

// 2026-10-05 is a Monday, 2026-10-10 a Saturday. Tehran is UTC+3:30 with no
// DST, so 09:00 Tehran is 05:30 UTC and 18:00 Tehran is 14:30 UTC.
describe("generateSlots", () => {
  it("places the first slot at 09:00 Tehran, which is 05:30 UTC", () => {
    const slots = generateSlots(
      at("2026-10-05T00:00:00Z"),
      at("2026-10-06T00:00:00Z"),
      CFG,
      at("2026-09-01T00:00:00Z"),
    );
    expect(slots.length).toBeGreaterThan(0);
    expect(slots[0].start.toISOString()).toBe("2026-10-05T05:30:00.000Z");
  });

  it("stops before 18:00 Tehran — the last slot ends exactly at the boundary", () => {
    const slots = generateSlots(
      at("2026-10-05T00:00:00Z"),
      at("2026-10-06T00:00:00Z"),
      CFG,
      at("2026-09-01T00:00:00Z"),
    );
    const last = slots[slots.length - 1];
    expect(last.start.toISOString()).toBe("2026-10-05T14:00:00.000Z");
    expect(last.end.toISOString()).toBe("2026-10-05T14:30:00.000Z");
  });

  it("produces 18 slots in a 9-hour day at 30 minutes", () => {
    const slots = generateSlots(
      at("2026-10-05T00:00:00Z"),
      at("2026-10-06T00:00:00Z"),
      CFG,
      at("2026-09-01T00:00:00Z"),
    );
    expect(slots).toHaveLength(18);
  });

  it("skips weekends", () => {
    // 2026-10-10 is a Saturday and 2026-10-11 a Sunday. Neither is in workDays.
    const slots = generateSlots(
      at("2026-10-10T00:00:00Z"),
      at("2026-10-12T00:00:00Z"),
      CFG,
      at("2026-09-01T00:00:00Z"),
    );
    expect(slots).toHaveLength(0);
  });

  it("honours minimum notice", () => {
    const now = at("2026-10-05T05:00:00Z"); // 08:30 Tehran, same morning
    const slots = generateSlots(
      at("2026-10-05T00:00:00Z"),
      at("2026-10-07T00:00:00Z"),
      CFG,
      now,
    );
    const tooSoon = slots.filter(
      (s) => s.start.getTime() - now.getTime() < CFG.minimumNoticeHours * 3_600_000,
    );
    expect(tooSoon).toHaveLength(0);
  });

  it("excludes blackout dates", () => {
    const slots = generateSlots(
      at("2026-10-05T00:00:00Z"),
      at("2026-10-06T00:00:00Z"),
      { ...CFG, blackoutDates: ["2026-10-05"] },
      at("2026-09-01T00:00:00Z"),
    );
    expect(slots).toHaveLength(0);
  });

  it("never emits a slot outside the requested window", () => {
    const from = at("2026-10-05T00:00:00Z");
    const to = at("2026-10-08T00:00:00Z");
    const slots = generateSlots(from, to, CFG, at("2026-09-01T00:00:00Z"));
    for (const s of slots) {
      expect(s.start.getTime()).toBeGreaterThanOrEqual(from.getTime());
      expect(s.end.getTime()).toBeLessThanOrEqual(to.getTime());
    }
  });
});

describe("subtractBusy", () => {
  // The first three slots of Monday 2026-10-05, in UTC.
  const slots = [
    { start: at("2026-10-05T05:30:00Z"), end: at("2026-10-05T06:00:00Z") },
    { start: at("2026-10-05T06:00:00Z"), end: at("2026-10-05T06:30:00Z") },
    { start: at("2026-10-05T06:30:00Z"), end: at("2026-10-05T07:00:00Z") },
  ];

  it("removes a slot that overlaps a busy block", () => {
    const out = subtractBusy(
      slots,
      [{ start: at("2026-10-05T06:05:00Z"), end: at("2026-10-05T06:20:00Z") }],
      0,
    );
    expect(out).toHaveLength(2);
    expect(out.map((s) => s.start.toISOString())).not.toContain(
      "2026-10-05T06:00:00.000Z",
    );
  });

  it("applies the buffer to both sides of a busy block", () => {
    // A 15-minute buffer around 06:00–06:30 also kills 05:30 and 06:30.
    const out = subtractBusy(
      slots,
      [{ start: at("2026-10-05T06:00:00Z"), end: at("2026-10-05T06:30:00Z") }],
      15,
    );
    expect(out).toHaveLength(0);
  });

  it("keeps a slot that merely touches a busy edge when there is no buffer", () => {
    const out = subtractBusy(
      slots,
      [{ start: at("2026-10-05T06:30:00Z"), end: at("2026-10-05T07:00:00Z") }],
      0,
    );
    expect(out.map((s) => s.start.toISOString())).toContain(
      "2026-10-05T06:00:00.000Z",
    );
  });

  it("returns everything when nothing is busy", () => {
    expect(subtractBusy(slots, [], 15)).toHaveLength(3);
  });
});
