import "server-only";

export type IcsBooking = {
  id: string;
  start_at: string;
  end_at: string;
  name: string;
  topic: string | null;
  notes: string | null;
  meet_url: string | null;
};

const CRLF = "\r\n";

/** yyyymmddThhmmssZ — RFC 5545 UTC date-time. */
function toIcsDate(iso: string): string {
  return new Date(iso)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

/** RFC 5545 TEXT escaping: backslash, semicolon, comma, newline. */
function escapeText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/** Minimal VEVENT for a booked call. CRLF line endings per spec. */
export function buildIcs(booking: IcsBooking): string {
  const summary = `Call with ${booking.name}${booking.topic ? ` — ${booking.topic}` : ""}`;
  const description = [booking.notes, booking.meet_url ? `Meet: ${booking.meet_url}` : null]
    .filter((part): part is string => Boolean(part))
    .join("\n");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//mohammadmkh.dev//booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${booking.id}@mohammadmkh.dev`,
    `DTSTAMP:${toIcsDate(new Date().toISOString())}`,
    `DTSTART:${toIcsDate(booking.start_at)}`,
    `DTEND:${toIcsDate(booking.end_at)}`,
    `SUMMARY:${escapeText(summary)}`,
    ...(description ? [`DESCRIPTION:${escapeText(description)}`] : []),
    ...(booking.meet_url ? [`URL:${booking.meet_url}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.join(CRLF) + CRLF;
}
