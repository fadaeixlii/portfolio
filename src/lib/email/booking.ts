import "server-only";
import { buildIcs, type IcsBooking } from "@/lib/calendar/ics";

export type BookingEmailInput = IcsBooking & {
  email: string;
  locale: string;
  manageToken: string;
};

const RESEND_URL = "https://api.resend.com/emails";

const SUBJECT: Record<string, string> = {
  en: "Your call is booked",
  de: "Ihr Termin ist gebucht",
  nl: "Je afspraak is geboekt",
  fa: "قرار شما رزرو شد",
};

function manageUrl(token: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mohammadmkh.dev";
  return `${base}/schedule/manage/${token}`;
}

/** A visitor controls name/topic/notes end to end — escape before it ever
 *  reaches an HTML (or plain-text-that-gets-read-as-markup) email body. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendResendEmail(payload: Record<string, unknown>): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return; // sandbox / not configured — booking still succeeds without email

  const res = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`resend send failed: ${res.status} ${await res.text()}`);
  }
}

/**
 * Confirmation to the visitor (their locale, .ics attached, manage link)
 * plus a notification to the owner. Never throws: by the time this runs the
 * booking row exists and Google has already sent its own invite, so an
 * email failure here must be logged, not surfaced as a booking failure.
 */
export async function sendBookingEmails(booking: BookingEmailInput): Promise<void> {
  try {
    const ics = buildIcs(booking);
    const icsBase64 = Buffer.from(ics, "utf8").toString("base64");
    const from = process.env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>";
    const subject = SUBJECT[booking.locale] ?? SUBJECT.en;
    const when = new Date(booking.start_at).toUTCString();
    const to = process.env.CONTACT_TO_EMAIL;

    const safeName = escapeHtml(booking.name);
    const safeEmail = escapeHtml(booking.email);
    const safeTopic = booking.topic ? escapeHtml(booking.topic) : null;
    const safeNotes = booking.notes ? escapeHtml(booking.notes) : null;

    await Promise.all([
      sendResendEmail({
        from,
        to: booking.email,
        subject,
        html:
          `<p>Hi ${safeName},</p><p>Your call is booked for ${when}.</p>` +
          (booking.meet_url
            ? `<p><a href="${booking.meet_url}">Join with Google Meet</a></p>`
            : "") +
          `<p><a href="${manageUrl(booking.manageToken)}">Manage or cancel this booking</a></p>`,
        attachments: [{ filename: "call.ics", content: icsBase64 }],
      }),
      ...(to
        ? [
            sendResendEmail({
              from,
              to,
              // Subject is plain text, not HTML, but it's still visitor input
              // reaching an inbox unescaped — same treatment.
              subject: `New booking: ${safeName}`,
              html:
                `<p>${safeName} (${safeEmail}) booked ${when}.</p>` +
                (safeTopic ? `<p>Topic: ${safeTopic}</p>` : "") +
                (safeNotes ? `<p>Notes: ${safeNotes}</p>` : ""),
            }),
          ]
        : []),
    ]);
  } catch (error) {
    console.error("booking email failed", booking.id, error);
  }
}
