import "server-only";
import { sendResendEmail, escapeHtml } from "@/lib/email/resend";

export type ContactEmailInput = {
  id: string;
  name: string;
  email: string;
  message: string;
};

/**
 * Notifies the owner of a new contact message. Never throws: by the time
 * this runs the message is already stored in `contact_messages`, so a
 * Resend failure must be logged, not surfaced as a failed submit — telling
 * the visitor it failed would make them send it twice.
 */
export async function sendContactEmail(input: ContactEmailInput): Promise<void> {
  try {
    const to = process.env.CONTACT_TO_EMAIL;
    if (!to) return;

    const from = process.env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>";
    const safeName = escapeHtml(input.name);
    const safeEmail = escapeHtml(input.email);
    const safeMessage = escapeHtml(input.message).replace(/\n/g, "<br />");

    await sendResendEmail({
      from,
      to,
      "reply-to": input.email,
      subject: `New contact message: ${safeName}`,
      html: `<p>${safeName} (${safeEmail}) wrote:</p><p>${safeMessage}</p>`,
    });
  } catch (error) {
    console.error("contact email failed", input.id, error);
  }
}
