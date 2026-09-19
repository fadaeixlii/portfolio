import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { getAvailability } from "@/lib/calendar/availability";
import { insertEvent } from "@/lib/calendar/google";
import { createServiceClient } from "@/lib/supabase/service";
import { signBookingToken } from "@/lib/calendar/token";
import { sendBookingEmails } from "@/lib/email/booking";
import { SCHEDULE_CONFIG } from "@/lib/calendar/config";

export const dynamic = "force-dynamic";

const body = z.object({
  start: z.string().datetime(),
  name: z.string().min(2).max(80),
  email: z.string().email().max(160),
  topic: z.string().max(120).optional(),
  notes: z.string().max(1000).optional(),
  locale: z.enum(["en", "de", "nl", "fa"]),
  visitorTz: z.string().max(64),
  /** Honeypot. Real people leave it empty; a bot that fills it must still
   *  pass validation so the handler reaches the 200-and-drop branch below —
   *  `max(0)` would instead 400 a filled honeypot before it gets there. */
  company: z.string().max(200).optional(),
});

export async function POST(request: Request) {
  const json: unknown = await request.json().catch(() => null);
  const parsed = body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const input = parsed.data;
  if (input.company) {
    // Honeypot tripped. Answer 200 so a bot learns nothing.
    return NextResponse.json({ ok: true });
  }

  const start = new Date(input.start);
  const end = new Date(start.getTime() + SCHEDULE_CONFIG.slotMinutes * 60_000);
  const supabase = createServiceClient();

  // Per-email daily cap.
  const since = new Date(Date.now() - 86_400_000).toISOString();
  const { count } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("email", input.email)
    .neq("status", "cancelled")
    .gte("created_at", since);
  if ((count ?? 0) >= SCHEDULE_CONFIG.maxBookingsPerEmailPerDay) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
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
  const { data: row, error: insertError } = await supabase
    .from("bookings")
    .insert({
      start_at: start.toISOString(),
      end_at: end.toISOString(),
      name: input.name,
      email: input.email,
      topic: input.topic ?? null,
      notes: input.notes ?? null,
      locale: input.locale,
      visitor_tz: input.visitorTz,
    })
    .select()
    .single();

  if (insertError) {
    // 23505 = unique_violation: someone else took it between the check and here.
    if (insertError.code === "23505") {
      return NextResponse.json({ error: "slot_taken" }, { status: 409 });
    }
    console.error("booking insert failed", insertError);
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

    await supabase
      .from("bookings")
      .update({ google_event_id: event.id, meet_url: event.hangoutLink ?? null })
      .eq("id", row.id);

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
    await supabase.from("bookings").update({ status: "orphaned" }).eq("id", row.id);
    return NextResponse.json({ error: "calendar_write_failed" }, { status: 502 });
  }
}
