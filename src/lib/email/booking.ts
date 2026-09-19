import "server-only";
import { buildIcs, type IcsBooking } from "@/lib/calendar/ics";
import { sendResendEmail, escapeHtml } from "@/lib/email/resend";

export type BookingEmailInput = IcsBooking & {
  email: string;
  locale: string;
  manageToken: string;
};

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
