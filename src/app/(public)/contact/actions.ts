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

  // Notify by email (best-effort — never block the submit on it)
  await sendNotificationEmail(parsed.data).catch((e) =>
    console.error("Contact email notify failed:", e)
  );

  return {
    success: true,
    message: "Message sent. I'll get back to you within 48 hours.",
  };
}

// Sends a notification email via Resend. No-ops if RESEND_API_KEY is unset,
// so the form still works (message is saved to Supabase regardless).
async function sendNotificationEmail(data: {
  name: string;
  email: string;
  message: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const to = process.env.CONTACT_TO_EMAIL ?? "mmohammadkhani408@gmail.com";
  const from = process.env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: data.email,
      subject: `New portfolio message from ${data.name}`,
      text: `Name: ${data.name}\nEmail: ${data.email}\n\n${data.message}`,
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${await res.text()}`);
  }
}
