import "server-only";

const RESEND_URL = "https://api.resend.com/emails";

/** A visitor controls form input end to end — escape before it ever reaches
 *  an HTML (or plain-text-that-gets-read-as-markup) email body. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Shared Resend send. Throws on a non-2xx response — every caller decides
 *  for itself whether that failure should surface or just be logged. */
export async function sendResendEmail(payload: Record<string, unknown>): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return; // sandbox / not configured — caller still succeeds without email

  const res = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) {
    throw new Error(`resend send failed: ${res.status} ${await res.text()}`);
  }
}
