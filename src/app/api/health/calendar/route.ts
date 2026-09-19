import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/calendar/google";

export const dynamic = "force-dynamic";

/**
 * Cheap liveness check for the Google credentials. The booker fetches this
 * once on mount; a failure swaps the calendar widget for an "email me
 * instead" panel rather than rendering an empty month.
 */
export async function GET() {
  try {
    await getAccessToken();
    return NextResponse.json({ ok: true });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown";
    return NextResponse.json({ ok: false, reason }, { status: 503 });
  }
}
