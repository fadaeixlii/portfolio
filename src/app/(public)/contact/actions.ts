"use server";

import { createClient } from "@/lib/supabase/server";
import { contactFormSchema } from "@/lib/validation/contact";

export type ContactFormResult =
  | { success: true; message: string }
  | { success: false; message: string; errors?: Record<string, string[]> };

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

  const supabase = await createClient();

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
