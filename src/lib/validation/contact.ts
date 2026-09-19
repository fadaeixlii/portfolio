import { z } from "zod";
import { locales } from "@/lib/i18n/routing";

/** POST /api/contact body. Shared with the client so the form validates the
 *  exact same rules the route enforces — one schema, not two that can drift. */
export const contactSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(160),
  message: z.string().min(20).max(2000),
  locale: z.enum(locales),
  /** Honeypot. Real people leave it empty; a bot that fills it must still
   *  pass validation so the handler reaches the 200-and-drop branch below —
   *  `max(0)` would instead 400 a filled honeypot before it gets there. */
  company: z.string().max(200).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

/** The subset the visitor actually fills in. `locale` is supplied by the
 *  form from `useLocale()`, not typed. */
export const contactFormSchema = contactSchema.pick({
  name: true,
  email: true,
  message: true,
  company: true,
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
