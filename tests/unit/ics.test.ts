import { describe, it, expect } from "vitest";
import { buildIcs, type IcsBooking } from "@/lib/calendar/ics";

const BOOKING: IcsBooking = {
  id: "b7f1c2a0-1234-4a5b-8c9d-abcdef012345",
  start_at: "2026-10-05T05:30:00.000Z",
  end_at: "2026-10-05T06:00:00.000Z",
  name: "Ada Lovelace",
  topic: "AI engineering role",
  notes: "Met at a conference.",
  meet_url: "https://meet.google.com/abc-defg-hij",
};

describe("buildIcs", () => {
  it("uses CRLF line endings throughout", () => {
    const ics = buildIcs(BOOKING);
    expect(ics).toContain("\r\n");
    // Every line break is CRLF, never a bare LF.
    expect(ics.replace(/\r\n/g, "")).not.toContain("\n");
  });

  it("emits a well-formed VEVENT with the required fields", () => {
    const ics = buildIcs(BOOKING);
    const lines = ics.split("\r\n");

    expect(lines[0]).toBe("BEGIN:VCALENDAR");
    expect(lines.at(-1)).toBe(""); // trailing CRLF
    expect(lines.at(-2)).toBe("END:VCALENDAR");
    expect(ics).toContain("BEGIN:VEVENT\r\n");
    expect(ics).toContain("END:VEVENT\r\n");
    expect(ics).toContain(`UID:${BOOKING.id}@mohammadmkh.dev\r\n`);
    expect(ics).toContain("DTSTART:20261005T053000Z\r\n");
    expect(ics).toContain("DTEND:20261005T060000Z\r\n");
    expect(ics).toMatch(/DTSTAMP:\d{8}T\d{6}Z\r\n/);
    expect(ics).toContain("SUMMARY:Call with Ada Lovelace — AI engineering role\r\n");
    expect(ics).toContain("URL:https://meet.google.com/abc-defg-hij\r\n");
  });

  it("escapes commas and semicolons in free text per RFC 5545", () => {
    const ics = buildIcs({ ...BOOKING, notes: "Prefers Tue, Wed; flexible" });
    expect(ics).toContain("Prefers Tue\\, Wed\\; flexible");
  });

  it("normalizes a bare CR in free text instead of leaving it mid-line", () => {
    const ics = buildIcs({ ...BOOKING, notes: "Line one\rLine two" });
    // A literal CR anywhere but the CRLF line breaks this function itself
    // inserts would corrupt the content line under RFC 5545's line folding.
    expect(ics.replace(/\r\n/g, "")).not.toContain("\r");
    expect(ics).toContain("Line one\\nLine two");
  });
});
