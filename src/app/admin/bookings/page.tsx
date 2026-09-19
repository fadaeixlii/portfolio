import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service";
import { signBookingToken } from "@/lib/calendar/token";
import { SCHEDULE_CONFIG } from "@/lib/calendar/config";
import { Surface } from "@/components/primitives/Surface";
import { Hairline } from "@/components/primitives/Hairline";
import { CancelBookingButton } from "@/components/admin/CancelBookingButton";

type Booking = {
  id: string;
  start_at: string;
  name: string;
  email: string;
  topic: string | null;
  status: string;
  meet_url: string | null;
  visitor_tz: string;
};

async function loadBookings(): Promise<Booking[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("id, start_at, name, email, topic, status, meet_url, visitor_tz")
    .order("start_at", { ascending: false })
    // See src/lib/supabase/service.ts — without this a wedged Supabase host
    // retries past the 5s fetch timeout instead of failing at it.
    .retry(false);
  if (error) throw new Error(`bookings lookup failed: ${error.message}`);
  return (data as Booking[] | null) ?? [];
}

function formatIn(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
    calendar: "gregory",
  }).format(new Date(iso));
}

export default async function AdminBookingsPage() {
  const bookings = await loadBookings();

  return (
    <div className="flex flex-col gap-[var(--space-8)]">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-[length:var(--text-2xl)]">Bookings</h1>
        <Link href="/admin" className="text-[length:var(--text-sm)] text-signal-text hover:underline">
          ← Messages
        </Link>
      </div>

      {bookings.length === 0 ? (
        <p className="text-[length:var(--text-sm)] text-dim">No bookings yet.</p>
      ) : (
        <ul className="flex flex-col gap-[var(--space-4)]">
          {bookings.map((b) => (
            <li key={b.id}>
              <Surface variant="flat" className="flex flex-col gap-2 p-[var(--space-4)]">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-[length:var(--text-base)]">
                    {b.name} <span className="text-dim">— {b.email}</span>
                  </p>
                  <span className="text-[length:var(--text-xs)] text-dim">{b.status}</span>
                </div>
                <div className="flex flex-col gap-1 font-mono text-[length:var(--text-xs)] tabular-nums text-dim">
                  <span>Tehran: {formatIn(b.start_at, SCHEDULE_CONFIG.timeZone)}</span>
                  <span>Visitor ({b.visitor_tz}): {formatIn(b.start_at, b.visitor_tz)}</span>
                </div>
                {b.topic ? <p className="text-dim">{b.topic}</p> : null}
                {b.meet_url ? (
                  <a href={b.meet_url} className="text-[length:var(--text-sm)] text-signal-text hover:underline">
                    {b.meet_url}
                  </a>
                ) : null}
                <Hairline />
                {b.status === "cancelled" ? (
                  <span className="text-[length:var(--text-sm)] text-dim">Cancelled</span>
                ) : (
                  <CancelBookingButton token={signBookingToken(b.id)} />
                )}
              </Surface>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
