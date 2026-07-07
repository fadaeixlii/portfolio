"use server";

import { createClient } from "@/lib/supabase/server";
import { contactFormSchema } from "@/lib/validation/contact";

export type ContactFormResult =
  | { success: true; message: string }
  | { success: false; message: string; errors?: Record<string, string[]> };

// Rate limit (3/email/hour) is enforced in public.contact_rate_limited() — see
// supabase/migrations/20260707120000_contact_rate_limit_fn.sql

export async function submitContactForm(
  formData: Record<string, unknown>
): Promise<ContactFormResult> {
  const parsed = contactFormSchema.safeParse(formData);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the errors below.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  // Honeypot check — bots fill hidden fields
  if (parsed.data.company) {
    // Silently accept but don't store — bots think it worked
    return { success: true, message: "Message sent. I'll get back to you within 48 hours." };
  }

  const supabase = await createClient();

  // Rate limit — max 3 messages per email per hour (checked via security
  // definer RPC since anon has no SELECT on contact_messages)
  const { data: rateLimited, error: rateLimitError } = await supabase.rpc(
    "contact_rate_limited",
    { p_email: parsed.data.email }
  );

  if (rateLimitError) {
    return {
      success: false,
      message: "Something went wrong. Try again later.",
    };
  }

  if (rateLimited) {
    return {
      success: false,
      message: "You've sent too many messages recently. Please try again later.",
    };
  }

  const { error } = await supabase.from("contact_messages").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    message: parsed.data.message,
  });

  if (error) {
    return {
      success: false,
      message: "Something went wrong. Try again later.",
    };
  }

  return {
    success: true,
    message: "Message sent. I'll get back to you within 48 hours.",
  };
}
