import "server-only";
import { SCHEDULE_CONFIG } from "./config";
import { generateSlots, subtractBusy, type Slot, type Busy } from "./slots";
import { queryFreeBusy } from "./google";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Candidate slots minus the calendar's busy blocks minus slots already
 * booked here. The second subtraction matters because a booking written in
 * the same second may not yet be visible to free/busy.
 */
export async function getAvailability(from: Date, to: Date): Promise<Slot[]> {
  const candidates = generateSlots(from, to, SCHEDULE_CONFIG, new Date());
  if (candidates.length === 0) return [];

  const supabase = createServiceClient();
  const [busy, { data: rows, error }] = await Promise.all([
    queryFreeBusy(from, to),
    supabase
      .from("bookings")
      .select("start_at, end_at")
      .neq("status", "cancelled")
      .gte("start_at", from.toISOString())
      .lte("start_at", to.toISOString())
      // postgrest-js retries a GET up to 3x with backoff on network errors,
      // and only skips retry for an error literally named AbortError/ABORT_ERR
      // — the TimeoutError our service-client fetch produces doesn't match,
      // so without this a wedged host still takes ~4x the 5s fetch timeout,
      // not 5s. This is what actually bounds the request.
      .retry(false),
  ]);

  if (error) throw new Error(`bookings lookup failed: ${error.message}`);

  const booked: Busy[] = (rows ?? []).map((r) => ({
    start: new Date(r.start_at),
    end: new Date(r.end_at),
  }));

  const afterCalendar = subtractBusy(candidates, busy, SCHEDULE_CONFIG.bufferMinutes);
  // Booked slots need no buffer — they were generated on the same grid.
  return subtractBusy(afterCalendar, booked, 0);
}
