import "server-only";
import { SCHEDULE_CONFIG } from "./config";
import { generateSlots, subtractBusy, type Slot, type Busy } from "./slots";
import { queryFreeBusy } from "./google";
import { sql } from "@/lib/db";

/**
 * Candidate slots minus the calendar's busy blocks minus slots already
 * booked here. The second subtraction matters because a booking written in
 * the same second may not yet be visible to free/busy.
 */
const describe = (error: unknown) =>
  error instanceof Error ? `${error.name}: ${error.message}` : String(error);

export async function getAvailability(from: Date, to: Date): Promise<Slot[]> {
  const candidates = generateSlots(from, to, SCHEDULE_CONFIG, new Date());
  if (candidates.length === 0) return [];

  // Both lookups at once: the calendar's busy blocks and the slots already
  // booked here. The second matters because a booking written in the same
  // second may not yet be visible to free/busy.
  const [busy, rows] = await Promise.all([
    // Tagged, because both halves can time out and a bare TimeoutError gives
    // no clue which. Blaming the database for a slow Google call sends
    // whoever reads the log to the wrong machine.
    queryFreeBusy(from, to).catch((error: unknown) => {
      throw new Error(`calendar free/busy failed: ${describe(error)}`, { cause: error });
    }),
    sql<{ start_at: string; end_at: string }[]>`
      select start_at, end_at
      from bookings
      where status <> 'cancelled'
        and start_at >= ${from.toISOString()}
        and start_at <= ${to.toISOString()}
    `.catch((error: unknown) => {
      throw new Error(`bookings lookup failed: ${describe(error)}`, { cause: error });
    }),
  ]);

  const booked: Busy[] = rows.map((r) => ({
    start: new Date(r.start_at),
    end: new Date(r.end_at),
  }));

  const afterCalendar = subtractBusy(candidates, busy, SCHEDULE_CONFIG.bufferMinutes);
  // Booked slots need no buffer — they were generated on the same grid.
  return subtractBusy(afterCalendar, booked, 0);
}
