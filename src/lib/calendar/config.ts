/**
 * Every scheduling rule lives here. No magic numbers anywhere else in the
 * calendar subsystem.
 */
export const SCHEDULE_CONFIG = {
  /** Mohammad's wall clock. Slots are generated against this, not UTC. */
  timeZone: "Asia/Tehran",
  /** 09:00–18:00 inclusive of the start, exclusive of the end.
   *  In Berlin winter that reads 06:30–15:30, which covers a European
   *  founder's working morning and most of their afternoon. */
  workDayStartHour: 9,
  workDayEndHour: 18,
  /** 0 = Sunday … 6 = Saturday, in the configured timezone. Mon–Fri,
   *  because the target clients are EU and their week is the one that
   *  matters for booking a call. */
  workDays: [1, 2, 3, 4, 5] as const,
  slotMinutes: 30,
  /** Dead time either side of an existing event before a slot is offered. */
  bufferMinutes: 15,
  /** Nothing bookable sooner than this. */
  minimumNoticeHours: 12,
  /** How far ahead the calendar opens. */
  horizonDays: 28,
  /** Dates fully closed. ISO yyyy-mm-dd in the configured timezone. */
  blackoutDates: [] as string[],
  /** Cap per visitor per day, enforced in the booking route. */
  maxBookingsPerEmailPerDay: 2,
  /** Fallback the booker UI shows when the calendar is unreachable. */
  contactEmail: "mmohammadkhani408@gmail.com",
} as const;

export type ScheduleConfig = typeof SCHEDULE_CONFIG;
