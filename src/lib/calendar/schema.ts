import { z } from "zod";
import { locales } from "@/lib/i18n/routing";

/** POST /api/book body. Shared with the client so the form validates the
 *  exact same rules the route enforces — one schema, not two that can drift. */
export const bookingRequestSchema = z.object({
  start: z.string().datetime(),
  name: z.string().min(2).max(80),
  email: z.string().email().max(160),
  topic: z.string().max(120).optional(),
  notes: z.string().max(1000).optional(),
  locale: z.enum(locales),
  visitorTz: z.string().max(64),
  /** Honeypot. Real people leave it empty; a bot that fills it must still
   *  pass validation so the handler reaches the 200-and-drop branch below —
   *  `max(0)` would instead 400 a filled honeypot before it gets there. */
  company: z.string().max(200).optional(),
});

export type BookingRequest = z.infer<typeof bookingRequestSchema>;

/** The subset the visitor actually fills in. `start`, `locale` and
 *  `visitorTz` are supplied by the booker from selection state, not typed. */
export const bookingFormSchema = bookingRequestSchema.pick({
  name: true,
  email: true,
  topic: true,
  notes: true,
  company: true,
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
