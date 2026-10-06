# Launch checklist

Everything between "the code is written" and "the site is live", in order. First written
2026-09-19; rewritten 2026-10-06 when the domain became `fadaeixlii.dev` and the database
moved from Supabase to Postgres in Docker. How the deploy itself works:
[`deployment.md`](./deployment.md).

---

## Done — 2026-10-06

- [x] **Domain.** `fadaeixlii.dev`, registered at Cloudflare Registrar (Cloudflare
      nameservers, so DNS, proxy and TLS are one account).
- [x] **DNS.** `A @` and `A www` → `185.243.214.76`, both proxied. No AAAA — the VPS has no
      public IPv6.
- [x] **SSL/TLS → Full (strict).** Anything weaker lets Cloudflare reach the origin
      unencrypted.
- [x] **Origin certificate.** 15 years, `fadaeixlii.dev` + `*.fadaeixlii.dev`, valid to
      2041. On the VPS at `~/caddy-sites/certs/`, mode 600.

## 1. Server and secrets

- [ ] Outreach deployed with the `import` line and the `edge` network (its Caddy serves this
      site — see `deployment.md`).
- [ ] `~/portfolio/.env` on the VPS, mode 600, every value single-quoted.
- [ ] Deploy key + `VPS_HOST` / `VPS_USER` / `VPS_SSH_KEY` in this repo's secrets.
- [ ] The "verifying no secret shipped" check in `deployment.md` prints `clean`.

## 2. Google Calendar — publish the OAuth app

A refresh token from an app in **Testing** dies 7 days after it is issued, whether or not it
is used. A live booking page needs the app **published**:

1. Launch on a fresh Testing token (`pnpm calendar:auth`) — it buys a week.
2. Once `https://fadaeixlii.dev/en/privacy` is live: Google Auth Platform → **Branding**:
   app name (no "Google" in it), support email, **no logo** (a logo forces a review),
   home page `https://fadaeixlii.dev`, privacy policy `https://fadaeixlii.dev/en/privacy`,
   authorised domain `fadaeixlii.dev`, developer contact.
3. **Audience → Publish app.** It goes to production as *unverified*: fine for one calendar
   owner, who clicks through one warning screen at consent.
4. `pnpm calendar:auth` again, put the new token in `~/portfolio/.env`, `docker compose up -d`.

**Check:** `curl https://fadaeixlii.dev/api/health/calendar` → `200`.

## 3. Email — verify the domain in Resend

Resend is in sandbox mode: it delivers **only to the account owner's address**. Booking
confirmations and contact-form notifications to visitors silently never arrive until the
domain is verified.

Resend → Domains → add `fadaeixlii.dev` → add its records in Cloudflare DNS → wait for
verification. Then `CONTACT_FROM_EMAIL` → an address on the domain (`mo@fadaeixlii.dev`).
Inbound mail for that address: Cloudflare Email Routing → your Gmail.

**Check:** send yourself a test from an address *other than* the Resend account owner's.

## 4. Walk the whole thing on the real domain

- All five locales (en, de, nl, fa, el), both themes, every route
- `http://` → `https://`, `www` → apex, `/` → `/en`
- The contact form stores a message and notifies you
- **One real booking**, end to end: the event appears in your calendar with a Meet link, both
  emails arrive, and the cancel link frees the slot. Delete the test booking afterwards.

That booking is the test that matters: the double-booking 409, the orphan path when the
calendar write fails after the row is written, and cancellation have only run against mocks.

## 5. Known limitations, deliberately shipped

| | |
|---|---|
| German, Dutch, Greek and Farsi copy is machine-translated | Each file carries `"_status": "machine"`. A native speaker should read the Farsi before you lean on it. |
| Reschedule is not implemented | Cancel then re-book is the flow. |
| The 404's server-rendered payload lacks `lang`/`dir` until hydration | A crawler or a JS-disabled client sees an unstyled 404. |
| Playwright runs Chromium only | Firefox and WebKit are unverified. |
| Lighthouse thresholds were set on localhost | No CDN, no HTTP/2 there. Re-measure against the live domain and raise `lighthouserc.json` from real numbers. |

## 6. After launch

- Re-run Lighthouse against `https://fadaeixlii.dev` and set `lighthouserc.json` from it.
- `/en/styleguide` is `noindex` and absent from nav and sitemap, but publicly reachable.
  Leave it or remove the route; do not leave it half-hidden by accident.
