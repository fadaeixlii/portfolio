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
 * The ways this realistically fails, named.
 *
 * The database is Postgres in a container now, so the failure modes are the
 * container's, not a hosted service's: not running, not migrated, or not
 * answering. Each one has a different fix and the log should say which.
 */
export function describeFailure(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const code = (error as { code?: string } | null)?.code;

  if (code === "ECONNREFUSED" || message.includes("ECONNREFUSED")) {
    return "nothing is listening on DATABASE_URL — start the database with `pnpm db:up`";
  }
  if (code === "42P01" || message.includes("does not exist")) {
    return "the bookings table is missing — run `pnpm db:migrate`";
  }
  // Which half timed out is carried in the message, because both can and a
  // bare TimeoutError names neither.
  if (message.startsWith("calendar free/busy failed")) {
    return `Google Calendar did not answer: ${message}`;
  }
  if (message.startsWith("bookings lookup failed")) {
    return `the database did not answer: ${message}`;
  }
  if (message.includes("fetch failed")) {
    return `network error reaching Google Calendar: ${message}`;
  }
  return message;
}
