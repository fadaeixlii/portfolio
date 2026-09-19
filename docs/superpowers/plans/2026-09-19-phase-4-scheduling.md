# Portfolio v2 · Phase 4 — Scheduling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A booking page that reads Mohammad's real Google Calendar, offers only genuinely free slots inside 09:00–18:00 Tehran time, Monday to Friday, lets a visitor pick one in their own timezone, and writes a confirmed event with a Meet link.

**Architecture:** Slot generation is a pure module with no network and no clock dependency, so the timezone and DST logic can be tested exhaustively. Everything with a side effect — token exchange, free/busy, event creation — sits behind thin `fetch` wrappers. Postgres owns the double-booking guarantee through a partial unique index; application code never arbitrates a race.

**Tech Stack:** Google Calendar REST v3 over `fetch` (no `googleapis`), `@date-fns/tz`, Supabase, Resend, Zod, Phase 2 primitives.

**Spec:** `docs/superpowers/specs/2026-09-19-portfolio-v2-design.md` §3.5.

**Depends on:** Phases 1–3 complete.

## Global Constraints

- Everything in Phase 2 and 3's Global Constraints still binds.
- **No `googleapis` package.** Three `fetch` calls, zero dependencies.
- All slot arithmetic in **UTC**. Wall-clock hours convert per date through `@date-fns/tz`. Iran's offset is never hardcoded, despite DST being abolished there in 2022.
- Secrets never reach the client. `GOOGLE_*` and `BOOKING_TOKEN_SECRET` are server-only; no `NEXT_PUBLIC_` prefix.
- **The database is the double-booking guard.** Never "check then insert" in application code.
- Every route handler validates input with Zod before touching anything.
- Booking flow strings live in all four locales.

---

### Task 1: Google Cloud setup and the one-time auth script

**Files:**
- Create: `docs/google-calendar-setup.md`, `scripts/calendar-auth.mjs`
- Modify: `package.json`, `.env.local.example`, `.husky/pre-commit` (or the existing secret-scan hook)

**Interfaces:**
- Produces: a `GOOGLE_REFRESH_TOKEN` in `.env.local`; documented manual steps

- [ ] **Step 1: Write `docs/google-calendar-setup.md`**

Document, as numbered steps Mohammad performs once:

1. Create a Google Cloud project at `console.cloud.google.com`.
2. Enable the **Google Calendar API**.
3. OAuth consent screen: type **External**, publishing status **Testing**, add `mmohammadkhani408@gmail.com` as the sole test user. Testing mode is correct here — the app has exactly one user, and it avoids Google's verification review.
4. Create credentials → **OAuth client ID** → **Web application**. Authorised redirect URI: `http://localhost:4321/callback`.
5. Put the client id and secret in `.env.local`.
6. Run `pnpm calendar:auth`, open the printed URL, grant access. The script prints `GOOGLE_REFRESH_TOKEN=…`; paste it into `.env.local`.
7. Set `GOOGLE_CALENDAR_ID=primary` unless a dedicated calendar is preferred.

Add a warning: a refresh token from a **Testing**-mode consent screen expires after seven days of non-use in some configurations. If bookings stop working, re-run step 6. The health check in Task 8 surfaces this rather than showing visitors an empty calendar.

- [ ] **Step 2: Write `scripts/calendar-auth.mjs`**

```js
#!/usr/bin/env node
/**
 * One-time OAuth consent. Spins a throwaway localhost server, opens the
 * consent URL, catches the code, exchanges it for a refresh token, prints it.
 * Never run in CI; never commit its output.
 */
import { createServer } from "node:http";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const CLIENT_ID = env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET;
const REDIRECT = "http://localhost:4321/callback";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local first.");
  process.exit(1);
}

const authUrl =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/calendar",
    // Both are required to be handed a refresh token at all.
    access_type: "offline",
    prompt: "consent",
  });

console.log("\nOpen this URL and grant access:\n\n" + authUrl + "\n");

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost:4321");
  if (url.pathname !== "/callback") return res.end();

  const code = url.searchParams.get("code");
  if (!code) {
    res.end("No code in callback.");
    return;
  }

  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT,
      grant_type: "authorization_code",
    }),
  });

  const data = await r.json();
  if (!data.refresh_token) {
    console.error("\nNo refresh_token returned. Revoke prior access at " +
      "https://myaccount.google.com/permissions and run again.\n", data);
    res.end("Failed — check the terminal.");
    server.close();
    return;
  }

  console.log("\nAdd this line to .env.local:\n");
  console.log(`GOOGLE_REFRESH_TOKEN=${data.refresh_token}\n`);
  res.end("Done. Close this tab and return to the terminal.");
  server.close();
});

server.listen(4321);
```

Add `"calendar:auth": "node scripts/calendar-auth.mjs"` to `package.json`.

- [ ] **Step 3: Extend the secret guard**

Add `GOOGLE_REFRESH_TOKEN=` and `BOOKING_TOKEN_SECRET=` to the pre-commit hook's blocked patterns. Verify by staging a file containing `GOOGLE_REFRESH_TOKEN=1//abc` and confirming the commit is refused.

- [ ] **Step 4: Commit**

```bash
git add docs/google-calendar-setup.md scripts/calendar-auth.mjs package.json .env.local.example
git commit -m "feat: google calendar auth bootstrap"
```

---

### Task 2: Schedule configuration

**Files:**
- Create: `src/lib/calendar/config.ts`

**Interfaces:**
- Produces: `SCHEDULE_CONFIG` — the single source for hours, days, durations and blackouts

- [ ] **Step 1: Write it**

```ts
/**
 * Every scheduling rule lives here. No magic numbers anywhere else in the
 * calendar subsystem.
 */
export const SCHEDULE_CONFIG = {
  /** Mohammad's wall clock. Slots are generated against this, not UTC. */
  timeZone: "Asia/Tehran",
  /** 09:00–18:00 inclusive of the start, exclusive of the end.
   *  In Berlin winter that reads 06:30–15:30, which covers a European
   *  founder's working morning and most of their afternoon. */
  workDayStartHour: 9,
  workDayEndHour: 18,
  /** 0 = Sunday … 6 = Saturday, in the configured timezone. Mon–Fri,
   *  because the target clients are EU and their week is the one that
   *  matters for booking a call. */
  workDays: [1, 2, 3, 4, 5] as const,
  slotMinutes: 30,
  /** Dead time either side of an existing event before a slot is offered. */
  bufferMinutes: 15,
  /** Nothing bookable sooner than this. */
  minimumNoticeHours: 12,
  /** How far ahead the calendar opens. */
  horizonDays: 28,
  /** Dates fully closed. ISO yyyy-mm-dd in the configured timezone. */
  blackoutDates: [] as string[],
  /** Cap per visitor per day, enforced in the booking route. */
  maxBookingsPerEmailPerDay: 2,
} as const;

export type ScheduleConfig = typeof SCHEDULE_CONFIG;
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/calendar/config.ts
git commit -m "feat: schedule configuration"
```

---

### Task 3: Pure slot generation

**Files:**
- Create: `src/lib/calendar/slots.ts`
- Test: `tests/unit/slots.test.ts`

**Interfaces:**
- Consumes: `SCHEDULE_CONFIG`, `@date-fns/tz`
- Produces: `type Slot = { start: Date; end: Date }`, `generateSlots(from, to, config, now): Slot[]`, `subtractBusy(slots, busy, bufferMinutes): Slot[]`

This module is the heart of the feature and touches no network. Test it hard.

- [ ] **Step 1: Write the failing tests**

`tests/unit/slots.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { generateSlots, subtractBusy } from "@/lib/calendar/slots";
import { SCHEDULE_CONFIG } from "@/lib/calendar/config";

const CFG = SCHEDULE_CONFIG;
const at = (iso: string) => new Date(iso);

// 2026-10-05 is a Monday, 2026-10-10 a Saturday. Tehran is UTC+3:30 with no
// DST, so 09:00 Tehran is 05:30 UTC and 18:00 Tehran is 14:30 UTC.
describe("generateSlots", () => {
  it("places the first slot at 09:00 Tehran, which is 05:30 UTC", () => {
    const slots = generateSlots(
      at("2026-10-05T00:00:00Z"),
      at("2026-10-06T00:00:00Z"),
      CFG,
      at("2026-09-01T00:00:00Z"),
    );
    expect(slots.length).toBeGreaterThan(0);
    expect(slots[0].start.toISOString()).toBe("2026-10-05T05:30:00.000Z");
  });

  it("stops before 18:00 Tehran — the last slot ends exactly at the boundary", () => {
    const slots = generateSlots(
      at("2026-10-05T00:00:00Z"),
      at("2026-10-06T00:00:00Z"),
      CFG,
      at("2026-09-01T00:00:00Z"),
    );
    const last = slots[slots.length - 1];
    expect(last.start.toISOString()).toBe("2026-10-05T14:00:00.000Z");
    expect(last.end.toISOString()).toBe("2026-10-05T14:30:00.000Z");
  });

  it("produces 18 slots in a 9-hour day at 30 minutes", () => {
    const slots = generateSlots(
      at("2026-10-05T00:00:00Z"),
      at("2026-10-06T00:00:00Z"),
      CFG,
      at("2026-09-01T00:00:00Z"),
    );
    expect(slots).toHaveLength(18);
  });

  it("skips weekends", () => {
    // 2026-10-10 is a Saturday and 2026-10-11 a Sunday. Neither is in workDays.
    const slots = generateSlots(
      at("2026-10-10T00:00:00Z"),
      at("2026-10-12T00:00:00Z"),
      CFG,
      at("2026-09-01T00:00:00Z"),
    );
    expect(slots).toHaveLength(0);
  });

  it("honours minimum notice", () => {
    const now = at("2026-10-05T05:00:00Z"); // 08:30 Tehran, same morning
    const slots = generateSlots(
      at("2026-10-05T00:00:00Z"),
      at("2026-10-07T00:00:00Z"),
      CFG,
      now,
    );
    const tooSoon = slots.filter(
      (s) => s.start.getTime() - now.getTime() < CFG.minimumNoticeHours * 3_600_000,
    );
    expect(tooSoon).toHaveLength(0);
  });

  it("excludes blackout dates", () => {
    const slots = generateSlots(
      at("2026-10-05T00:00:00Z"),
      at("2026-10-06T00:00:00Z"),
      { ...CFG, blackoutDates: ["2026-10-05"] },
      at("2026-09-01T00:00:00Z"),
    );
    expect(slots).toHaveLength(0);
  });

  it("never emits a slot outside the requested window", () => {
    const from = at("2026-10-05T00:00:00Z");
    const to = at("2026-10-08T00:00:00Z");
    const slots = generateSlots(from, to, CFG, at("2026-09-01T00:00:00Z"));
    for (const s of slots) {
      expect(s.start.getTime()).toBeGreaterThanOrEqual(from.getTime());
      expect(s.end.getTime()).toBeLessThanOrEqual(to.getTime());
    }
  });
});

describe("subtractBusy", () => {
  // The first three slots of Monday 2026-10-05, in UTC.
  const slots = [
    { start: at("2026-10-05T05:30:00Z"), end: at("2026-10-05T06:00:00Z") },
    { start: at("2026-10-05T06:00:00Z"), end: at("2026-10-05T06:30:00Z") },
    { start: at("2026-10-05T06:30:00Z"), end: at("2026-10-05T07:00:00Z") },
  ];

  it("removes a slot that overlaps a busy block", () => {
    const out = subtractBusy(
      slots,
      [{ start: at("2026-10-05T06:05:00Z"), end: at("2026-10-05T06:20:00Z") }],
      0,
    );
    expect(out).toHaveLength(2);
    expect(out.map((s) => s.start.toISOString())).not.toContain(
      "2026-10-05T06:00:00.000Z",
    );
  });

  it("applies the buffer to both sides of a busy block", () => {
    // A 15-minute buffer around 06:00–06:30 also kills 05:30 and 06:30.
    const out = subtractBusy(
      slots,
      [{ start: at("2026-10-05T06:00:00Z"), end: at("2026-10-05T06:30:00Z") }],
      15,
    );
    expect(out).toHaveLength(0);
  });

  it("keeps a slot that merely touches a busy edge when there is no buffer", () => {
    const out = subtractBusy(
      slots,
      [{ start: at("2026-10-05T06:30:00Z"), end: at("2026-10-05T07:00:00Z") }],
      0,
    );
    expect(out.map((s) => s.start.toISOString())).toContain(
      "2026-10-05T06:00:00.000Z",
    );
  });

  it("returns everything when nothing is busy", () => {
    expect(subtractBusy(slots, [], 15)).toHaveLength(3);
  });
});
```

- [ ] **Step 2: Run, watch them fail**

Run: `pnpm test:unit -- slots`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/lib/calendar/slots.ts`**

```ts
import { TZDate } from "@date-fns/tz";
import type { ScheduleConfig } from "./config";

export type Slot = { start: Date; end: Date };
export type Busy = { start: Date; end: Date };

const MINUTE = 60_000;

/** yyyy-mm-dd for an instant, as seen in the given timezone. */
function isoDateIn(instant: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

/** Weekday 0–6 for an instant, as seen in the given timezone. */
function weekdayIn(instant: Date, timeZone: string): number {
  const name = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
  }).format(instant);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(name);
}

/**
 * Candidate slots inside the configured working window.
 *
 * Pure: every input is an argument, including `now`, so the tests do not
 * depend on when they run. All returned instants are UTC; the wall-clock
 * window is resolved per calendar date through TZDate, so a timezone that
 * changes offset mid-range stays correct without special-casing.
 */
export function generateSlots(
  from: Date,
  to: Date,
  config: ScheduleConfig,
  now: Date,
): Slot[] {
  const {
    timeZone,
    workDayStartHour,
    workDayEndHour,
    workDays,
    slotMinutes,
    minimumNoticeHours,
    blackoutDates,
  } = config;

  const earliest = new Date(now.getTime() + minimumNoticeHours * 60 * MINUTE);
  const out: Slot[] = [];
  const blackout = new Set(blackoutDates);

  // Walk calendar dates in the target timezone. Step by 12h so a date is
  // never skipped by an offset change, then dedupe by date string.
  const seen = new Set<string>();
  for (let t = from.getTime(); t <= to.getTime(); t += 12 * 60 * MINUTE) {
    const dateKey = isoDateIn(new Date(t), timeZone);
    if (seen.has(dateKey)) continue;
    seen.add(dateKey);

    if (blackout.has(dateKey)) continue;
    const [y, m, d] = dateKey.split("-").map(Number);

    const dayStart = new TZDate(y, m - 1, d, workDayStartHour, 0, 0, timeZone);
    if (!(workDays as readonly number[]).includes(weekdayIn(dayStart, timeZone))) {
      continue;
    }
    const dayEnd = new TZDate(y, m - 1, d, workDayEndHour, 0, 0, timeZone);

    for (
      let s = dayStart.getTime();
      s + slotMinutes * MINUTE <= dayEnd.getTime();
      s += slotMinutes * MINUTE
    ) {
      const start = new Date(s);
      const end = new Date(s + slotMinutes * MINUTE);
      if (start < earliest) continue;
      if (start < from || end > to) continue;
      out.push({ start, end });
    }
  }

  return out.sort((a, b) => a.start.getTime() - b.start.getTime());
}

/**
 * Drop candidates that collide with a busy block, widening each block by
 * `bufferMinutes` on both sides so back-to-back meetings are never offered.
 */
export function subtractBusy(
  slots: Slot[],
  busy: Busy[],
  bufferMinutes: number,
): Slot[] {
  const pad = bufferMinutes * MINUTE;
  return slots.filter((slot) =>
    busy.every((b) => {
      const busyStart = b.start.getTime() - pad;
      const busyEnd = b.end.getTime() + pad;
      // Overlap iff the intervals intersect on an open interval.
      return slot.end.getTime() <= busyStart || slot.start.getTime() >= busyEnd;
    }),
  );
}
```

- [ ] **Step 4: Run the tests**

Run: `pnpm test:unit -- slots`
Expected: all 11 PASS. If the 05:30 UTC assertion fails, the machine's ICU lacks `Asia/Tehran` — check `node -e "console.log(new Intl.DateTimeFormat('en',{timeZone:'Asia/Tehran'}).format(new Date()))"`.

- [ ] **Step 5: Prove the buffer test can fail**

Set `bufferMinutes` to `0` in the "applies the buffer" test, confirm it goes red, restore it.

- [ ] **Step 6: Commit**

```bash
git add src/lib/calendar/slots.ts tests/unit/slots.test.ts
git commit -m "feat: pure slot generator"
```

---

### Task 4: Google Calendar client

**Files:**
- Create: `src/lib/calendar/google.ts`

**Interfaces:**
- Produces: `getAccessToken()`, `queryFreeBusy(from, to)`, `insertEvent(input)`, `patchEvent(id, patch)`, `cancelEvent(id)`

- [ ] **Step 1: Write it**

```ts
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
    { method: "DELETE", headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
  );
  // 410 Gone means it is already deleted, which satisfies the intent.
  if (!res.ok && res.status !== 410) {
    throw new Error(`google delete failed: ${res.status}`);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/calendar/google.ts
git commit -m "feat: google calendar rest client"
```

---

### Task 5: Bookings table

**Files:**
- Create: `supabase/migrations/20260919120000_create_bookings.sql`, `src/lib/supabase/service.ts`

**Interfaces:**
- Produces: `public.bookings` with the partial unique index that guarantees one confirmed booking per start time; `createServiceClient()` — the service-role client every calendar route uses

- [ ] **Step 1: Write the migration**

```sql
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  start_at timestamptz not null,
  end_at timestamptz not null,
  name text not null,
  email text not null,
  topic text,
  notes text,
  locale text not null default 'en',
  visitor_tz text not null,
  status text not null default 'confirmed'
    check (status in ('confirmed', 'cancelled', 'orphaned')),
  google_event_id text,
  meet_url text
);

-- The double-booking guarantee. Cancelled rows are excluded so a freed slot
-- becomes bookable again. Application code never arbitrates this race.
create unique index if not exists bookings_slot_unique
  on public.bookings (start_at)
  where status <> 'cancelled';

create index if not exists bookings_start_at_idx on public.bookings (start_at);
create index if not exists bookings_email_created_idx
  on public.bookings (email, created_at desc);

alter table public.bookings enable row level security;
-- No policies: every read and write goes through the service key in a route
-- handler. An anon client must never see who booked what.
```

- [ ] **Step 2: Write the service client**

`src/lib/supabase/service.ts`:

```ts
import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client. Bypasses RLS, so it may only ever be constructed
 * inside a route handler or server module — never imported by a component.
 */
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
```

- [ ] **Step 3: Apply and verify the constraint bites**

```bash
supabase db push
```

Then, against the local test database, insert two rows with the same `start_at` and confirm the second fails with a unique violation; set the first to `cancelled` and confirm the insert then succeeds.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations src/lib/supabase/service.ts
git commit -m "feat: bookings table with slot uniqueness"
```

---

### Task 6: Availability composition and route

**Files:**
- Create: `src/lib/calendar/availability.ts`, `src/app/api/availability/route.ts`

**Interfaces:**
- Consumes: `generateSlots`, `subtractBusy`, `queryFreeBusy`, Supabase server client
- Produces: `getAvailability(from, to): Promise<Slot[]>`; `GET /api/availability?from=&to=` returning `{ slots: string[] }` of ISO start times

- [ ] **Step 1: Write `availability.ts`**

```ts
import "server-only";
import { SCHEDULE_CONFIG } from "./config";
import { generateSlots, subtractBusy, type Slot, type Busy } from "./slots";
import { queryFreeBusy } from "./google";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Candidate slots minus the calendar's busy blocks minus slots already
 * booked here. The second subtraction matters because a booking written in
 * the same second may not yet be visible to free/busy.
 */
export async function getAvailability(from: Date, to: Date): Promise<Slot[]> {
  const candidates = generateSlots(from, to, SCHEDULE_CONFIG, new Date());
  if (candidates.length === 0) return [];

  const supabase = createServiceClient();
  const [busy, { data: rows, error }] = await Promise.all([
    queryFreeBusy(from, to),
    supabase
      .from("bookings")
      .select("start_at, end_at")
      .neq("status", "cancelled")
      .gte("start_at", from.toISOString())
      .lte("start_at", to.toISOString()),
  ]);

  if (error) throw new Error(`bookings lookup failed: ${error.message}`);

  const booked: Busy[] = (rows ?? []).map((r) => ({
    start: new Date(r.start_at),
    end: new Date(r.end_at),
  }));

  const afterCalendar = subtractBusy(candidates, busy, SCHEDULE_CONFIG.bufferMinutes);
  // Booked slots need no buffer — they were generated on the same grid.
  return subtractBusy(afterCalendar, booked, 0);
}
```

- [ ] **Step 2: Write the route**

```ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAvailability } from "@/lib/calendar/availability";
import { SCHEDULE_CONFIG } from "@/lib/calendar/config";

export const dynamic = "force-dynamic";

const query = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = query.safeParse({
    from: url.searchParams.get("from"),
    to: url.searchParams.get("to"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "bad_range" }, { status: 400 });
  }

  const from = new Date(parsed.data.from);
  const to = new Date(parsed.data.to);
  const horizonEnd = new Date(
    Date.now() + SCHEDULE_CONFIG.horizonDays * 86_400_000,
  );

  if (to <= from || to > horizonEnd) {
    return NextResponse.json({ error: "out_of_horizon" }, { status: 400 });
  }

  try {
    const slots = await getAvailability(from, to);
    return NextResponse.json(
      { slots: slots.map((s) => s.start.toISOString()) },
      // Short cache: the calendar changes, but a burst of requests from one
      // visitor paging through months should not hammer Google.
      { headers: { "Cache-Control": "private, max-age=30" } },
    );
  } catch (error) {
    console.error("availability failed", error);
    // Degrade honestly — the UI shows "email me instead", never an empty month.
    return NextResponse.json({ error: "calendar_unavailable" }, { status: 503 });
  }
}
```

- [ ] **Step 3: Verify against the real calendar**

```bash
pnpm dev
curl "http://localhost:3000/api/availability?from=$(date -u -d '+1 day' +%Y-%m-%dT%H:%M:%SZ)&to=$(date -u -d '+8 days' +%Y-%m-%dT%H:%M:%SZ)"
```

Expected: a `slots` array. Put a busy event in the calendar inside that window, re-run, confirm those slots disappear.

- [ ] **Step 4: Commit**

```bash
git add src/lib/calendar/availability.ts src/app/api/availability
git commit -m "feat: availability endpoint"
```

---

### Task 7: Booking route

**Files:**
- Create: `src/app/api/book/route.ts`, `src/lib/calendar/token.ts`, `src/lib/email/booking.ts`, `src/lib/calendar/ics.ts`

**Interfaces:**
- Produces: `POST /api/book`; `signBookingToken(id)`, `verifyBookingToken(token)`; `sendBookingEmails(booking)`; `buildIcs(booking)`

- [ ] **Step 1: Write the HMAC token module**

```ts
import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/** Opaque, unguessable handle for cancel and reschedule links. */
export function signBookingToken(id: string): string {
  const mac = createHmac("sha256", process.env.BOOKING_TOKEN_SECRET!)
    .update(id)
    .digest("base64url");
  return `${id}.${mac}`;
}

export function verifyBookingToken(token: string): string | null {
  const dot = token.lastIndexOf(".");
  if (dot < 0) return null;
  const id = token.slice(0, dot);
  const given = Buffer.from(token.slice(dot + 1));
  const expected = Buffer.from(
    createHmac("sha256", process.env.BOOKING_TOKEN_SECRET!)
      .update(id)
      .digest("base64url"),
  );
  if (given.length !== expected.length) return null;
  return timingSafeEqual(given, expected) ? id : null;
}
```

- [ ] **Step 2: Write the booking route**

The ordering matters and is the reason this is one task:

```ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { getAvailability } from "@/lib/calendar/availability";
import { insertEvent } from "@/lib/calendar/google";
import { createServiceClient } from "@/lib/supabase/service";
import { signBookingToken } from "@/lib/calendar/token";
import { sendBookingEmails } from "@/lib/email/booking";
import { SCHEDULE_CONFIG } from "@/lib/calendar/config";

export const dynamic = "force-dynamic";

const body = z.object({
  start: z.string().datetime(),
  name: z.string().min(2).max(80),
  email: z.string().email().max(160),
  topic: z.string().max(120).optional(),
  notes: z.string().max(1000).optional(),
  locale: z.enum(["en", "de", "nl", "fa"]),
  visitorTz: z.string().max(64),
  /** Honeypot. Real people leave it empty. */
  company: z.string().max(0).optional(),
});

export async function POST(request: Request) {
  const parsed = body.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const input = parsed.data;
  if (input.company) {
    // Honeypot tripped. Answer 200 so a bot learns nothing.
    return NextResponse.json({ ok: true });
  }

  const start = new Date(input.start);
  const end = new Date(start.getTime() + SCHEDULE_CONFIG.slotMinutes * 60_000);
  const supabase = createServiceClient();

  // Per-email daily cap.
  const since = new Date(Date.now() - 86_400_000).toISOString();
  const { count } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("email", input.email)
    .neq("status", "cancelled")
    .gte("created_at", since);
  if ((count ?? 0) >= SCHEDULE_CONFIG.maxBookingsPerEmailPerDay) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  // Re-check the slot. Cheap, and catches the common case before the insert.
  const free = await getAvailability(
    new Date(start.getTime() - 1000),
    new Date(end.getTime() + 1000),
  );
  if (!free.some((s) => s.start.getTime() === start.getTime())) {
    return NextResponse.json({ error: "slot_taken" }, { status: 409 });
  }

  // The insert is the real guard: the partial unique index rejects a second
  // confirmed row for this start time, whoever wins the race.
  const { data: row, error: insertError } = await supabase
    .from("bookings")
    .insert({
      start_at: start.toISOString(),
      end_at: end.toISOString(),
      name: input.name,
      email: input.email,
      topic: input.topic ?? null,
      notes: input.notes ?? null,
      locale: input.locale,
      visitor_tz: input.visitorTz,
    })
    .select()
    .single();

  if (insertError) {
    // 23505 = unique_violation: someone else took it between the check and here.
    if (insertError.code === "23505") {
      return NextResponse.json({ error: "slot_taken" }, { status: 409 });
    }
    console.error("booking insert failed", insertError);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }

  // Calendar last. If this fails the row exists, so mark it and alert rather
  // than leaving a booking the calendar has never heard of.
  try {
    const event = await insertEvent({
      start,
      end,
      summary: `${input.name} — ${input.topic ?? "intro call"}`,
      description: input.notes ?? "",
      attendeeEmail: input.email,
      attendeeName: input.name,
      requestId: randomUUID(),
    });

    await supabase
      .from("bookings")
      .update({ google_event_id: event.id, meet_url: event.hangoutLink ?? null })
      .eq("id", row.id);

    await sendBookingEmails({
      ...row,
      meet_url: event.hangoutLink ?? null,
      manageToken: signBookingToken(row.id),
    });

    return NextResponse.json({
      ok: true,
      meetUrl: event.hangoutLink ?? null,
      manageToken: signBookingToken(row.id),
    });
  } catch (error) {
    console.error("calendar write failed after booking row", row.id, error);
    await supabase.from("bookings").update({ status: "orphaned" }).eq("id", row.id);
    return NextResponse.json({ error: "calendar_write_failed" }, { status: 502 });
  }
}
```

- [ ] **Step 3: Write `ics.ts` and `booking.ts`**

`buildIcs` emits a minimal VEVENT with `UID`, `DTSTAMP`, `DTSTART`, `DTEND`, `SUMMARY`, `DESCRIPTION` and the Meet URL, CRLF line endings. `sendBookingEmails` sends two Resend messages — a confirmation to the visitor in their locale with the `.ics` attached and the manage link, and a notification to `CONTACT_TO_EMAIL`. Email failure is logged, never thrown: the booking already exists and the Google invite already went out.

- [ ] **Step 4: Test the race by hand**

Run two `curl` POSTs for the same slot concurrently. Expected: one `200`, one `409`. Confirm exactly one row and one calendar event exist.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/book src/lib/calendar/token.ts src/lib/calendar/ics.ts src/lib/email
git commit -m "feat: booking route with race and orphan paths"
```

---

### Task 8: Cancel, reschedule and health

**Files:**
- Create: `src/app/api/booking/[token]/route.ts`, `src/app/api/health/calendar/route.ts`, `src/app/[locale]/schedule/manage/[token]/page.tsx`

**Interfaces:**
- Produces: `GET`/`DELETE` on the token route; `GET /api/health/calendar` returning `{ ok: boolean }`

- [ ] **Step 1: Write the token route**

`GET` returns the booking for the manage page. `DELETE` sets `status='cancelled'`, calls `cancelEvent`, and returns `204`. An invalid token gets `404` — never a hint that the id existed.

- [ ] **Step 2: Write the health route**

Calls `getAccessToken()` and returns `{ ok: true }` or `{ ok: false, reason }` with a `503`. The booker fetches this once on mount; a failure swaps the calendar for an "email me instead" panel rather than rendering an empty month, which would read as "no availability" and lose the lead.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/booking src/app/api/health src/app/\[locale\]/schedule/manage
git commit -m "feat: cancel, reschedule and calendar health"
```

---

### Task 9: The booker UI

**Files:**
- Create: `src/components/schedule/Booker.tsx`, `MonthGrid.tsx`, `SlotList.tsx`, `BookingForm.tsx`, `TimezonePicker.tsx`, `BookingConfirmed.tsx`, `src/app/[locale]/schedule/page.tsx`

**Interfaces:**
- Consumes: `Surface`, `Button`, `Field`, `Reveal`, the API routes
- Produces: the four-step flow

- [ ] **Step 1: Build the flow**

State machine: `month → day → slot → form → confirmed`. One `Surface variant="glass"` panel; steps swap inside it with a `motion` layout transition, so the panel measures rather than jumps.

- **TimezonePicker** — defaults to `Intl.DateTimeFormat().resolvedOptions().timeZone`, shown as a plain line the visitor can change ("Times shown in Europe/Berlin — change"). Every rendered time goes through `Intl.DateTimeFormat` with that zone explicitly.
- **MonthGrid** — a `<table>` with proper header cells and `aria-label` per day. Days with no slots are `disabled`, not hidden, so the grid does not reflow. Arrow keys move between days; `dir="rtl"` swaps left/right handling.
- **SlotList** — radio group, not buttons, so arrow keys work and screen readers announce the selection count. Each label shows the visitor-local time with Mohammad's local time underneath in `font-mono`, which quietly explains why availability looks narrow.
- **BookingForm** — name, email, topic, notes, honeypot. Zod resolver shared with the route's schema.
- **BookingConfirmed** — the Meet link, an "Add to calendar" `.ics` download, and the manage link. No confetti.

- [ ] **Step 2: Handle every failure visibly**

`503` from availability → the "email me instead" panel with a mailto. `409` on submit → "That slot was taken while you were typing", refresh the day, keep the form filled. `429` → a plain explanation. Network failure → retry button. Errors state what happened and what to do; they never apologise and never say "Oops".

- [ ] **Step 3: Translate the flow**

Every string into all four locales, including the error copy and the weekday and month names (from `Intl`, not hardcoded).

- [ ] **Step 4: Test the flow**

`tests/booker.spec.ts`: mock `/api/availability` with a fixed slot list; walk month → day → slot → form → confirmed; assert the confirmed panel shows the Meet link. Add a `409` case asserting the form keeps its values. Add a keyboard-only pass. Add a `/fa` pass asserting the grid is RTL and times render in Persian digits.

- [ ] **Step 5: Commit**

```bash
git add src/components/schedule src/app/\[locale\]/schedule tests/booker.spec.ts
git commit -m "feat: booking flow ui"
```

---

## Phase exit criteria

- [ ] `pnpm test:unit -- slots` passes all 11 cases, and the buffer case has been proven able to fail
- [ ] A real busy block in Google Calendar removes the matching slots from `/schedule`
- [ ] Two concurrent bookings for one slot produce exactly one row, one event, and one `409`
- [ ] A booking creates a calendar event with a Meet link and Google emails both parties
- [ ] The cancel link frees the slot and removes the event
- [ ] Revoking the refresh token makes `/schedule` show the email fallback, never an empty month
- [ ] The whole flow is keyboard-navigable and works in all four locales, with Persian digits under `fa`
- [ ] No secret appears in any client bundle — verify with `pnpm analyze` and a grep of `.next/static`
