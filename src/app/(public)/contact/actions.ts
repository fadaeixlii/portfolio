"use server";

import { createClient } from "@/lib/supabase/server";
import { contactFormSchema } from "@/lib/validation/contact";

export type ContactFormResult =
  | { success: true; message: string }
  | { success: false; message: string; errors?: Record<string, string[]> };

const MIN_SUBMIT_TIME_MS = 3000;
const MAX_MESSAGES_PER_HOUR = 3;

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

  // Timing check — reject instant submissions
  if (parsed.data._t && Date.now() - parsed.data._t < MIN_SUBMIT_TIME_MS) {
    return { success: true, message: "Message sent. I'll get back to you within 48 hours." };
  }

  const supabase = await createClient();

  // Rate limit — max 3 messages per email per hour
  const { count } = await supabase
    .from("contact_messages")
    .select("*", { count: "exact", head: true })
    .eq("email", parsed.data.email)
    .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString());

  if (count !== null && count >= MAX_MESSAGES_PER_HOUR) {
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
