import { z } from "zod";

export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be under 100 characters"),
  email: z.string().email("Enter a valid email address"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message must be under 5000 characters"),
  // Honeypot — must remain empty. Bots auto-fill fields named "company"
  company: z.string().max(0).optional(),
  // Timestamp — form must have been open for at least 3 seconds
  _t: z.number().optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
