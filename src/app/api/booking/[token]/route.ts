import { NextResponse } from "next/server";
import { verifyBookingToken } from "@/lib/calendar/token";
import { createServiceClient } from "@/lib/supabase/service";
import { cancelEvent } from "@/lib/calendar/google";

export const dynamic = "force-dynamic";

type Booking = {
  id: string;
  start_at: string;
  end_at: string;
  name: string;
  email: string;
  topic: string | null;
  notes: string | null;
  meet_url: string | null;
  status: string;
  google_event_id: string | null;
};

/** Never distinguishes "bad token" from "no such booking" — both are null. */
async function loadBooking(token: string): Promise<Booking | null> {
  const id = verifyBookingToken(token);
  if (!id) return null;
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("bookings")
    .select("id, start_at, end_at, name, email, topic, notes, meet_url, status, google_event_id")
    .eq("id", id)
    .single()
    // See the comment in availability.ts: without this, a wedged Supabase
    // host retries this GET ~3x past the 5s fetch timeout.
    .retry(false);
  return (data as Booking | null) ?? null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const booking = await loadBooking(token);
  if (!booking) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  // Deliberately excludes google_event_id — an internal handle, not visitor data.
  return NextResponse.json({
    id: booking.id,
    start_at: booking.start_at,
    end_at: booking.end_at,
    name: booking.name,
    email: booking.email,
    topic: booking.topic,
    notes: booking.notes,
    meet_url: booking.meet_url,
    status: booking.status,
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const booking = await loadBooking(token);
  if (!booking || booking.status === "cancelled") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (booking.google_event_id) {
    try {
      await cancelEvent(booking.google_event_id);
    } catch (error) {
      console.error("calendar cancel failed", booking.id, error);
      return NextResponse.json({ error: "calendar_unavailable" }, { status: 502 });
    }
  }

  const supabase = createServiceClient();
  await supabase.from("bookings").update({ status: "cancelled" }).eq("id", booking.id);
  return new NextResponse(null, { status: 204 });
}
