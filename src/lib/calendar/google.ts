import "server-only";
import type { Busy } from "./slots";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const API = "https://www.googleapis.com/calendar/v3";

let cached: { token: string; expiresAt: number } | null = null;

/**
 * Exchange the long-lived refresh token for an access token, cached in
 * module memory until a minute before it expires. A serverless instance
 * that handles several bookings reuses one token.
 */
export async function getAccessToken(): Promise<string> {
  if (cached && Date.now() < cached.expiresAt) return cached.token;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) {
    // Most often: the refresh token was revoked or expired in Testing mode.
    throw new Error(`google token exchange failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cached = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return cached.token;
}

async function call<T>(path: string, init: RequestInit): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      ...init.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) {
    throw new Error(`google ${path} failed: ${res.status} ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

/** Busy intervals on the configured calendar, as UTC instants. */
export async function queryFreeBusy(from: Date, to: Date): Promise<Busy[]> {
  const calendarId = process.env.GOOGLE_CALENDAR_ID ?? "primary";
  const data = await call<{
    calendars: Record<string, { busy: { start: string; end: string }[] }>;
  }>("/freeBusy", {
    method: "POST",
    body: JSON.stringify({
      timeMin: from.toISOString(),
      timeMax: to.toISOString(),
      items: [{ id: calendarId }],
    }),
  });

  return (data.calendars[calendarId]?.busy ?? []).map((b) => ({
    start: new Date(b.start),
    end: new Date(b.end),
  }));
}

export type InsertEventInput = {
  start: Date;
  end: Date;
  summary: string;
  description: string;
  attendeeEmail: string;
  attendeeName: string;
  /** Idempotency handle for the Meet conference. */
  requestId: string;
};

/**
 * Create the event with a Google Meet link. `conferenceDataVersion=1` is
 * mandatory or the createRequest is silently dropped. `sendUpdates=all`
 * makes Google issue the invitations, so no separate invite mail is needed.
 */
export async function insertEvent(input: InsertEventInput): Promise<{
  id: string;
  hangoutLink?: string;
  htmlLink: string;
}> {
  const calendarId = process.env.GOOGLE_CALENDAR_ID ?? "primary";
  return call(
    `/calendars/${encodeURIComponent(calendarId)}/events` +
      `?conferenceDataVersion=1&sendUpdates=all`,
    {
      method: "POST",
      body: JSON.stringify({
        summary: input.summary,
        description: input.description,
        start: { dateTime: input.start.toISOString() },
        end: { dateTime: input.end.toISOString() },
        attendees: [
          { email: input.attendeeEmail, displayName: input.attendeeName },
        ],
        conferenceData: { createRequest: { requestId: input.requestId } },
        reminders: { useDefault: true },
      }),
    },
  );
}

export async function cancelEvent(eventId: string): Promise<void> {
  const calendarId = process.env.GOOGLE_CALENDAR_ID ?? "primary";
  const token = await getAccessToken();
  const res = await fetch(
    `${API}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}?sendUpdates=all`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    },
  );
  // 410 Gone means it is already deleted, which satisfies the intent.
  if (!res.ok && res.status !== 410) {
    throw new Error(`google delete failed: ${res.status}`);
  }
}
