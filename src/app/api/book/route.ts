import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getAvailability } from "@/lib/calendar/availability";
import { insertEvent } from "@/lib/calendar/google";
import { sql, isUniqueViolation } from "@/lib/db";
import { signBookingToken } from "@/lib/calendar/token";
import { sendBookingEmails } from "@/lib/email/booking";
import { SCHEDULE_CONFIG } from "@/lib/calendar/config";
import { bookingRequestSchema } from "@/lib/calendar/schema";
import { clientIp } from "@/lib/http/client-ip";

export const dynamic = "force-dynamic";

/** The row shape `returning *` gives back, and what the emails are built from. */
type BookingRow = {
  id: string;
  start_at: string;
  end_at: string;
  name: string;
  email: string;
  topic: string | null;
  notes: string | null;
  locale: string;
  visitor_tz: string;
  meet_url: string | null;
};

export async function POST(request: Request) {
  const json: unknown = await request.json().catch(() => null);
  const parsed = bookingRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const input = parsed.data;
  if (input.company) {
    // Honeypot tripped. Answer 200 so a bot learns nothing.
    return NextResponse.json({ ok: true });
  }
  if (Date.now() - input.formRenderedAt < SCHEDULE_CONFIG.minFormSeconds * 1000) {
    // Submitted faster than a human fills a form. Same non-tell as the
    // honeypot: 200, nothing written.
    return NextResponse.json({ ok: true });
  }

  const start = new Date(input.start);
  const end = new Date(start.getTime() + SCHEDULE_CONFIG.slotMinutes * 60_000);
  const ip = clientIp(request);

  // Rate limit: primarily by IP (not attacker-chosen), email cap second and
  // additive (spec §3.5 — email alone lets a script vary the address).
  //
  // A failed count must never read as "zero bookings", or the limiter fails
  // open; the throw propagates to the catch below and answers 503.
  const since = new Date(Date.now() - 86_400_000).toISOString();
  try {
    const [[{ count: ipCount }], [{ count: emailCount }]] = await Promise.all([
      sql<{ count: string }[]>`
        select count(*)::int as count from bookings
        where ip = ${ip} and status <> 'cancelled' and created_at >= ${since}
      `,
      sql<{ count: string }[]>`
        select count(*)::int as count from bookings
        where email = ${input.email} and status <> 'cancelled' and created_at >= ${since}
      `,
    ]);

    if (Number(ipCount) >= SCHEDULE_CONFIG.maxBookingsPerIpPerDay) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
    if (Number(emailCount) >= SCHEDULE_CONFIG.maxBookingsPerEmailPerDay) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
  } catch (error) {
    console.error("book rate limit check failed", error);
    return NextResponse.json({ error: "server" }, { status: 503 });
  }

  // Re-check the slot. Cheap, and catches the common case before the insert.
  const free = await getAvailability(
    new Date(start.getTime() - 1000),
    new Date(end.getTime() + 1000),
  );
  if (!free.some((s) => s.start.getTime() === start.getTime())) {
    return NextResponse.json({ error: "slot_taken" }, { status: 409 });
  }

  // The insert is the real guard: the partial unique index rejects a second
  // confirmed row for this start time, whoever wins the race.
  let row: BookingRow;
  try {
    [row] = await sql<BookingRow[]>`
      insert into bookings ${sql({
        start_at: start.toISOString(),
        end_at: end.toISOString(),
        name: input.name,
        email: input.email,
        topic: input.topic ?? null,
        notes: input.notes ?? null,
        locale: input.locale,
        visitor_tz: input.visitorTz,
        ip,
      })}
      returning *
    `;
  } catch (error) {
    // 23505 = unique_violation: someone took it between the check and here.
    if (isUniqueViolation(error)) {
      return NextResponse.json({ error: "slot_taken" }, { status: 409 });
    }
    console.error("booking insert failed", error);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }

  // Calendar last. If this fails the row exists, so mark it and alert rather
  // than leaving a booking the calendar has never heard of.
  try {
    const event = await insertEvent({
      start,
      end,
      summary: `${input.name} — ${input.topic ?? "intro call"}`,
      description: input.notes ?? "",
      attendeeEmail: input.email,
      attendeeName: input.name,
      requestId: randomUUID(),
    });

    await sql`
      update bookings
      set google_event_id = ${event.id}, meet_url = ${event.hangoutLink ?? null}
      where id = ${row.id}
    `;

    // Never throws — logs and swallows its own failures.
    await sendBookingEmails({
      ...row,
      meet_url: event.hangoutLink ?? null,
      manageToken: signBookingToken(row.id),
    });

    return NextResponse.json({
      ok: true,
      meetUrl: event.hangoutLink ?? null,
      manageToken: signBookingToken(row.id),
    });
  } catch (error) {
    console.error("calendar write failed after booking row", row.id, error);
    await sql`update bookings set status = 'orphaned' where id = ${row.id}`;
    return NextResponse.json({ error: "calendar_write_failed" }, { status: 502 });
  }
}
