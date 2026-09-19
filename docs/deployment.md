# Deployment

The site runs as a Docker container on a VPS, behind Caddy for TLS, behind Cloudflare for
DNS/proxy. Deploys are automatic: a push to `main` that passes the `quality` workflow
triggers `deploy.yml`, which SSHes in, rebuilds the image and restarts the container.

## Topology

```
Cloudflare (DNS, proxy, Full-strict TLS)
  → VPS :443/:80 → Caddy (deploy/Caddyfile, Cloudflare origin cert)
      → portfolio:3000 (Docker, Next.js standalone server)
```

`job` and `outreach` already run on the same VPS — Caddy is the single thing holding 80/443;
each site is its own block in the same Caddyfile, not a second reverse proxy.

## Environment variables

Set in `/srv/portfolio/.env.production` on the VPS, mode `600`. Never in GitHub secrets —
only `VPS_SSH_KEY`, `VPS_USER`, `VPS_HOST` live there, for the SSH step itself.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | canonical origin, `https://mohammadmkh.dev` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key |
| `SUPABASE_SECRET_KEY` | Supabase service-role key — server only, never `NEXT_PUBLIC_` |
| `ADMIN_EMAILS` | comma-separated allowlist gating `/admin` |
| `RESEND_API_KEY` / `CONTACT_TO_EMAIL` / `CONTACT_FROM_EMAIL` | contact-form email |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REFRESH_TOKEN` / `GOOGLE_CALENDAR_ID` | booking calendar |
| `BOOKING_TOKEN_SECRET` | HMAC secret for cancel/reschedule links |

None of the secret-bearing values carry a `NEXT_PUBLIC_` prefix, so none reach a browser
bundle. `Dockerfile`'s build stage only takes the three `NEXT_PUBLIC_*` values as build
`ARG`s; everything else is read at runtime from `.env.production` via `env_file:` in
`docker-compose.yml`.

## Rotating the Google refresh token

Refresh tokens for a Testing-mode OAuth consent screen expire after 7 days of inactivity or
when the OAuth consent screen config changes. To issue a new one:

1. On a machine with a browser (not the VPS): `pnpm calendar:auth` — prints a consent URL,
   exchanges the code for a token.
2. Copy the printed `GOOGLE_REFRESH_TOKEN` into `/srv/portfolio/.env.production` on the VPS.
3. `docker compose up -d portfolio` to pick it up (no rebuild needed — env vars are read at
   runtime, not baked in).

Full first-time setup: [`docs/google-calendar-setup.md`](./google-calendar-setup.md).

## Reading logs

```bash
docker compose logs -f portfolio   # app
docker compose logs -f caddy       # TLS/proxy
```

## Rolling back

```bash
cd /srv/portfolio
git log --oneline -5               # find the last-good sha
git reset --hard <sha>
docker compose up -d --build
```

## Calendar health check down

`GET /api/health/calendar` (polled by the booker on mount) returns `503` when
`getAccessToken()` fails — expired/revoked refresh token, wrong client id/secret, or the
Calendar API being unreachable. The booker degrades to an "email me instead" panel rather
than an empty month, so this is not user-facing breakage, but it does mean no one can book
a call until it's fixed:

1. `docker compose logs portfolio | grep -i calendar` for the actual error.
2. If it's an expired/revoked token, rotate it (above).
3. Confirm `GOOGLE_CALENDAR_ID` still matches the calendar sharing it with the OAuth client.

## Purging the Cloudflare cache after a deploy

Only needed when a deploy changes static assets (images, fonts, `/tokens.css`) that
Cloudflare may have cached at the edge. HTML responses are not cached by default at
Cloudflare's standard settings for this zone.

Dashboard: **Caching → Configuration → Purge Everything**. Scope it to affected paths with
**Custom Purge** where possible rather than purging everything on every deploy.

## Port check before first deploy

`job` and `outreach` may already hold 80/443 on this VPS:

```bash
ss -tlnp | grep -E ':(80|443)\b'
```

If either is in use by a different stack, add this site as another block in that stack's
Caddyfile instead of running a second Caddy container.

## Verifying no secret shipped

Before the first deploy, and after any change that touches env handling:

```bash
docker compose build portfolio
docker compose run --rm --entrypoint sh portfolio -c \
  "grep -rE 'GOOGLE_(CLIENT_SECRET|REFRESH_TOKEN)|SUPABASE_SECRET|BOOKING_TOKEN_SECRET' .next/static || echo clean"
```

Expected output: `clean`. If it prints a match, do not deploy — a secret leaked into a
client bundle.
