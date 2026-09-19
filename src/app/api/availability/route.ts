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
    console.error("availability failed", error);
    // Degrade honestly — the UI shows "email me instead", never an empty month.
    return NextResponse.json({ error: "calendar_unavailable" }, { status: 503 });
  }
}
