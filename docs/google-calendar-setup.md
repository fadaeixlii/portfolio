# Connecting your Google Calendar

You do this **once**, by hand, before the booking page can work. It takes about ten minutes.
At the end you will have three values in `.env.local`, and the site will be able to read your
free/busy times and create events with a Meet link.

Nothing here costs money. The Calendar API is free at this volume.

---

## What you are actually setting up

The site needs permission to look at your calendar and add events to it. Google grants that
through OAuth. Because the site is a server rather than a person clicking a button, it needs a
**refresh token** — a long-lived credential it can exchange for short-lived access tokens
whenever it needs one.

So: create a project → turn on the Calendar API → declare who is allowed to use it (just you)
→ create a client → grant consent once → keep the refresh token.

---

## Step 1 · Create a project

1. Go to **https://console.cloud.google.com/projectcreate**
2. **Project name:** `mohammadmkh-portfolio`
3. **Location:** leave as *No organization*
4. Click **Create**, wait for the notification, then make sure the project picker at the top
   of the page shows `mohammadmkh-portfolio`. Everything after this happens inside it.

> If the picker still shows another project, click it and select the new one. Every later
> step silently applies to whatever project is selected.

---

## Step 2 · Enable the Calendar API

1. Go to **https://console.cloud.google.com/apis/library/calendar-json.googleapis.com**
2. Confirm the project name at the top is right.
3. Click **Enable**.

You should land on a "Google Calendar API" overview page. If you see a blue **Enable** button
still, it did not take — click it again.

---

## Step 3 · Configure the consent screen

This is the screen you will see when you grant access. Google requires it even for an app with
one user.

1. Go to **https://console.cloud.google.com/auth/overview**
2. Click **Get started**.
3. **App name:** `Portfolio Booking` · **User support email:** your Gmail.
4. **Audience:** choose **External**.
   *Internal is only available with a Google Workspace organisation. External is correct for a
   personal Gmail account.*
5. **Contact information:** your Gmail again.
6. Agree to the policy, click **Create**.

### Add yourself as a test user — do not skip this

1. Go to **https://console.cloud.google.com/auth/audience**
2. Under **Test users**, click **Add users**.
3. Enter the Gmail address whose calendar you want to book — `mmohammadkhani408@gmail.com`.
4. Click **Save**.

Leave **Publishing status** as **Testing**. Do not click "Publish app".

> **Why stay in Testing?** Publishing sends the app for Google's verification review, which
> takes weeks and exists to protect other people's data. Your app has exactly one user — you.
> Testing mode is the correct setting, not a shortcut.
>
> **The one cost:** a refresh token issued in Testing mode can expire after **seven days** if
> unused. In practice a live booking page uses it constantly and it keeps working. If bookings
> ever stop, re-run Step 6. The site's health check surfaces this and shows visitors an
> "email me instead" panel rather than an empty calendar, so a dead token never looks like
> "no availability".

---

## Step 4 · Create the OAuth client

1. Go to **https://console.cloud.google.com/auth/clients**
2. Click **Create client**.
3. **Application type:** **Web application**
4. **Name:** `Portfolio server`
5. Under **Authorised redirect URIs**, click **Add URI** and enter exactly:

   ```
   http://localhost:4321/callback
   ```

   No trailing slash. It must match character for character or Step 6 fails with
   `redirect_uri_mismatch`.
6. Click **Create**.
7. A dialog shows **Client ID** and **Client secret**. Copy both now — the secret is harder to
   retrieve later.

---

## Step 5 · Put them in `.env.local`

In the portfolio repo, open `.env.local` (create it if missing — it is gitignored) and add:

```bash
GOOGLE_CLIENT_ID=<the client id you just copied>
GOOGLE_CLIENT_SECRET=<the client secret you just copied>
GOOGLE_CALENDAR_ID=primary
```

`primary` means your main calendar. If you would rather keep bookings in a separate calendar,
create one in Google Calendar, open its settings, scroll to **Integrate calendar**, and paste
the **Calendar ID** here instead. A separate calendar is tidier but means your other
appointments will not block bookings — so only do it if you will keep both in sync.

---

## Step 6 · Grant consent and capture the refresh token

From the portfolio repo:

```bash
pnpm calendar:auth
```

If that reports `Command "calendar:auth" not found`, you are on a checkout from before
2026-09-19 — `git pull` and try again.

If it reports `.env.local is missing GOOGLE_CLIENT_ID`, go back to step 5.

The script prints a long `https://accounts.google.com/...` URL.

1. Open it in a browser signed in as the account you added as a test user.
2. You will see **"Google hasn't verified this app"**. This is expected — it is your own
   unverified app. Click **Advanced**, then **Go to Portfolio Booking (unsafe)**.
3. Grant the calendar permission.
4. The browser lands on a blank-ish localhost page saying it is done.
5. Back in the terminal, the script prints:

   ```
   GOOGLE_REFRESH_TOKEN=1//0g...
   ```

6. Paste that whole line into `.env.local`.

Done. Four variables, one calendar connected.

---

## Verify it worked

```bash
pnpm dev
```

Then in another terminal:

```bash
curl "http://localhost:3000/api/health/calendar"
```

Expected: `{"ok":true}`.

Then check real availability:

```bash
curl "http://localhost:3000/api/availability?from=$(date -u -d '+1 day' +%Y-%m-%dT00:00:00Z)&to=$(date -u -d '+8 days' +%Y-%m-%dT00:00:00Z)"
```

Expected: a `slots` array of ISO timestamps. Now put a busy event in your Google Calendar
inside that week, re-run the command, and confirm those slots have disappeared. If they have,
the whole chain works.

---

## When something goes wrong

| What you see | What it means | Fix |
|---|---|---|
| `redirect_uri_mismatch` | The URI in Step 4 does not match the script's | Must be exactly `http://localhost:4321/callback` — no trailing slash, `http` not `https` |
| Script prints "No refresh_token returned" | Google only issues one on first consent | Revoke at **https://myaccount.google.com/permissions**, find "Portfolio Booking", remove access, run `pnpm calendar:auth` again |
| `403 access_denied` at the consent screen | The account is not a test user | Step 3's "Add yourself as a test user" — check the address matches exactly |
| `401` from the API later | Refresh token expired or revoked | Re-run Step 6. The health check will already be showing the email fallback |
| `Calendar API has not been used in project...` | Step 2 did not take | Re-enable, wait a minute, retry |
| Health check returns `ok:false` | Any of the above | Read the `reason` field — it names which call failed |

---

## Security notes

- `GOOGLE_CLIENT_SECRET` and `GOOGLE_REFRESH_TOKEN` are **server-only**. They must never carry
  a `NEXT_PUBLIC_` prefix, or Next.js inlines them into the browser bundle.
- `.env.local` is gitignored and the pre-commit hook blocks both patterns. Do not paste either
  value into a chat, an issue, or a commit message.
- The refresh token is equivalent to standing access to your calendar. If it ever leaks, revoke
  it at **https://myaccount.google.com/permissions** — that invalidates it immediately — then
  re-run Step 6 for a new one.
- On the production server the same four variables live in `/srv/portfolio/.env.production`,
  mode `600`, root-owned.
