import { NextResponse } from "next/server";
import { z } from "zod";
import { getAvailability } from "@/lib/calendar/availability";
import { SCHEDULE_CONFIG } from "@/lib/calendar/config";

export const dynamic = "force-dynamic";

const query = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = query.safeParse({
    from: url.searchParams.get("from"),
    to: url.searchParams.get("to"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "bad_range" }, { status: 400 });
  }

  const from = new Date(parsed.data.from);
  const to = new Date(parsed.data.to);
  const horizonEnd = new Date(
    Date.now() + SCHEDULE_CONFIG.horizonDays * 86_400_000,
  );

  if (to <= from || to > horizonEnd) {
    return NextResponse.json({ error: "out_of_horizon" }, { status: 400 });
  }

  try {
    const slots = await getAvailability(from, to);
    return NextResponse.json(
      { slots: slots.map((s) => s.start.toISOString()) },
      // Short cache: the calendar changes, but a burst of requests from one
      // visitor paging through months should not hammer Google.
      { headers: { "Cache-Control": "private, max-age=30" } },
    );
  } catch (error) {
    // A one-line diagnosis, not the raw object: a DOMException prints all 25
    // of its legacy constants, which buried the actual cause twice a page.
    console.error(`availability failed: ${describeFailure(error)}`);
    // Degrade honestly — the UI shows "email me instead", never an empty month.
    return NextResponse.json({ error: "calendar_unavailable" }, { status: 503 });
  }
}

/**
 * The three ways this realistically fails, named. Anything else prints its
 * own message.
 *
 * `TimeoutError` here is almost always DNS: the Supabase host is behind
 * Cloudflare and answers in well under a second when it resolves, so a
 * five-second abort means the name never resolved — a VPN or corporate
 * resolver swallowing it, not a slow database.
 *
 * `PGRST205` means the REST layer reached Postgres and found no such table,
 * which means the migrations in supabase/migrations were never applied.
 */
export function describeFailure(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (error instanceof Error && error.name === "TimeoutError") {
    return "request timed out before the host answered — usually DNS, check that the Supabase URL resolves from this machine";
  }
  if (message.includes("PGRST205") || message.includes("schema cache")) {
    return "the bookings table does not exist — apply supabase/migrations";
  }
  if (message.includes("fetch failed")) {
    return `network error reaching Supabase or Google: ${message}`;
  }
  return message;
}
