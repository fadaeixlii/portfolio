# Launch checklist

Everything between "the code is written" and "the site is live". Written 2026-09-19 at the
end of the v2 rebuild. Items are ordered so that each one's prerequisites come before it.

The code lives on `feat/v2`. `main` still serves v1, and v1 is recoverable at the
`v1-archive` tag and the `archive/v1` branch, both on the remote.

---

## 1. Fix local DNS — do this first, everything below is easier with it

Your active network adapter resolves through `fdfe:dcba:9876::2` / `172.19.0.2`, which
returns NXDOMAIN for `*.supabase.co`. It intercepts UDP DNS, so even setting `1.1.1.1`
explicitly in Node does not help — only DNS-over-HTTPS got through.

Set that adapter's DNS servers to `1.1.1.1` and `8.8.8.8`, or disconnect the VPN while
working on this project.

Until you do, Supabase calls fail on your machine while working perfectly in production —
which is a confusing class of bug to debug later.

**Check:** `nslookup gmxarjxpsuwnpxobvruv.supabase.co` returns an address rather than
"Non-existent domain".

---

## 2. Apply the two migrations

The booking system cannot work without these, and the contact form returns a 500 without the
second. They are written and reviewed but have never been applied, because this workstation
could not reach Supabase.

Open the Supabase dashboard → SQL Editor, and run in order:

1. `supabase/migrations/20260919120000_create_bookings.sql`
2. `supabase/migrations/20260919140000_contact_messages_add_ip.sql`

The dashboard's SQL editor runs server-side at Supabase, so it works even while your machine
cannot resolve the project host.

**Check:** in the Table Editor, `bookings` exists and has a unique index named
`bookings_slot_unique`. That index is what prevents two people booking the same slot — the
application code deliberately does not arbitrate that race.

---

## 3. Verify the domain in Resend

Resend is in sandbox mode. **It can only deliver to the account owner's address.** That means
booking confirmations and contact-form notifications silently never reach a visitor — the
feature looks like it works right up until nobody turns up to a call.

Resend dashboard → Domains → add `mohammadmkh.dev` → add the DNS records it gives you to
Cloudflare → wait for verification. Then set `CONTACT_FROM_EMAIL` to an address on that
domain.

**Check:** send yourself a test from a *different* address than the Resend account owner's.

---

## 4. Buy the domain and point it at Cloudflare

`mohammadmkh.dev`. Cloudflare Registrar sells at cost with no markup; Porkbun was $8.75 the
first year and $12.87 to renew when this was written.

Whichever registrar takes the payment, **set the nameservers to Cloudflare's**. That single
step gets you the edge cache, TLS, the 15-year origin certificate and free email routing.

| Record | Name | Content | Proxy |
|---|---|---|---|
| A | `@` | your VPS IPv4 | Proxied (orange) |
| A | `www` | your VPS IPv4 | Proxied (orange) |

Then **SSL/TLS → Overview → Full (strict)**. Anything less lets Cloudflare reach your origin
unencrypted, which defeats the point of the certificate below.

---

## 5. Issue the origin certificate

Cloudflare → SSL/TLS → Origin Server → Create Certificate. Fifteen-year validity, covering
`mohammadmkh.dev` and `*.mohammadmkh.dev`.

Save both files on the VPS at `/etc/ssl/cloudflare/origin.pem` and `origin.key`, mode `600`,
owned by root. `deploy/Caddyfile` expects exactly those paths.

---

## 6. Check the VPS ports before deploying

`job` and `outreach` already run on that box. Caddy wants 80 and 443.

```bash
ss -tlnp | grep -E ':(80|443)\b'
```

If something already holds them, that service becomes another site block in the same
`deploy/Caddyfile` rather than a second reverse proxy fighting for the port.

---

## 7. Put the secrets on the server

`/srv/portfolio/.env.production`, mode `600`, root-owned. Every variable from
`.env.local.example`, with real values.

`GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `SUPABASE_SECRET_KEY`, `BOOKING_TOKEN_SECRET`,
`RESEND_API_KEY` and `ADMIN_EMAILS` are **server-only**. None may gain a `NEXT_PUBLIC_`
prefix — that would inline it into the browser bundle.

In GitHub repo secrets, only: `VPS_SSH_KEY`, `VPS_USER`, `VPS_HOST`.

**Check:** after the first build on the server,

```bash
grep -rE "GOOGLE_(CLIENT_SECRET|REFRESH_TOKEN)|SUPABASE_SECRET|BOOKING_TOKEN_SECRET" .next/static && echo LEAK || echo clean
```

If that prints LEAK, stop and do not deploy.

---

## 8. Deploy and walk the whole thing

`docs/deployment.md` has the commands. After it is up, on the real domain:

- All four locales, both themes, every route
- The contact form stores a message and notifies you
- **One real booking**, end to end: the event appears in your calendar with a Meet link, both
  emails arrive, and the cancel link in the confirmation email actually frees the slot
- Delete the test booking afterwards
- `http://` redirects to `https://`, `www` redirects to the apex, `/` resolves to `/en`

That booking test is the one that matters. Three of its paths — the double-booking 409, the
orphan path when the calendar write fails after the row is written, and cancellation — have
only ever run against mocks, because Supabase was unreachable from the machine this was built
on.

---

## 9. Known limitations, deliberately shipped

None of these block launch. They are written down so they are decisions rather than surprises.

| | |
|---|---|
| German, Dutch and Farsi copy is machine-translated | Each file carries `"_status": "machine"`. The UI chrome is translated; project summaries and stack items stay English in every locale. A native speaker should read the Farsi before you lean on it. |
| Reschedule is not implemented | Cancel then re-book is the flow. `patchEvent` exists in the calendar client if you want to add it. |
| The 404's server-rendered payload lacks `lang`/`dir` until hydration | A browser renders it correctly; a crawler or a JS-disabled client sees an unstyled 404. One unindexed error page. |
| Playwright runs Chromium only | Firefox and WebKit are unverified. The glass refraction probe is the untested path — it degrades to the universal frosted tier everywhere it is unsupported. |
| Lighthouse Performance measured locally | Localhost has no CDN, no HTTP/2 multiplexing and no Cloudflare cache, so LCP there is pessimistic against what the VPS will serve. Re-measure against the real domain and set the CI threshold from that. |

---

## 10. After launch

- Re-run Lighthouse against the live domain and set `lighthouserc.json` from real numbers.
- A Google refresh token issued from a **Testing**-mode consent screen can expire after seven
  days of disuse. A live booking page uses it constantly, so it keeps working — but if
  bookings ever stop, re-run `pnpm calendar:auth`. `/api/health/calendar` surfaces this and
  the booker shows an "email me instead" panel rather than an empty calendar, so a dead token
  never looks like "no availability".
- The styleguide lives at `/en/styleguide`. It is `noindex` and absent from the nav, footer
  and sitemap, but it is publicly reachable. Leave it or remove the route; do not leave it
  half-hidden by accident.
