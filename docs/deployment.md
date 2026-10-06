# Deployment

The site runs as a Docker container on the VPS (`rdp@185.243.214.76`), behind the Caddy that
the `outreach` stack already runs, behind Cloudflare. Deploys are automatic: a push to `main`
that passes the `quality` workflow triggers `deploy.yml`.

## Topology

```
Cloudflare (registrar, DNS, proxy, SSL/TLS Full (strict))
  → VPS :443 → outreach-caddy-1   (imports ~/caddy-sites/*.caddy; origin cert)
      → portfolio:3000 over the `edge` network   (~/portfolio, Next.js standalone)
          → db:5432 over portfolio_default        (Postgres 17, volume portfolio_pgdata)
```

- **One proxy on the box.** `outreach`'s Caddy holds 80/443. Its `Caddyfile` ends with
  `import /etc/caddy/sites/*.caddy`, and `~/caddy-sites` on the host is mounted there
  read-only. This repo's site block is `deploy/fadaeixlii.dev.caddy`.
- **`edge` network.** Created by outreach's compose file. Only Caddy and the portfolio app
  are on it, so the portfolio cannot reach the outreach dashboard or bot. Postgres is not on
  it at all.
- **TLS** is a Cloudflare origin certificate (15 years, `fadaeixlii.dev` + `*.fadaeixlii.dev`),
  at `~/caddy-sites/certs/fadaeixlii.dev.{pem,key}`, mode 600. Nothing renews.
- **Nothing publishes a port.** No `ports:` in `docker-compose.prod.yml`.

## What a deploy does

`.github/workflows/deploy.yml`, after `quality` goes green on `main` (or by hand from the
Actions tab):

1. Builds the image **on the GitHub runner**, with `NEXT_PUBLIC_SITE_URL=https://fadaeixlii.dev`.
   Never on the VPS: it has 4 GB shared with two other stacks.
2. Streams it over SSH: `docker save | gzip | ssh … docker load`. No registry, so no pull
   token lives on the VPS.
3. Copies `docker-compose.prod.yml` → `~/portfolio/compose.yaml` and
   `deploy/fadaeixlii.dev.caddy` → `~/caddy-sites/`.
4. Runs `deploy/remote-deploy.sh` on the VPS: tags the running image `:previous`, runs
   migrations (`node scripts/migrate.mjs` in a one-off container), `docker compose up -d`,
   waits for the healthcheck, **rolls back to `:previous` if it never goes healthy**, then
   reloads outreach's Caddy.
5. Checks `https://fadaeixlii.dev/en` answers from the runner.

GitHub secrets: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY` (a key used only by this workflow).
Nothing else — every app secret lives on the VPS.

## Environment variables

`~/portfolio/.env` on the VPS, mode 600. Compose reads it twice: for `${…}` in
`compose.yaml` and as the app's `env_file`. **Single-quote every value** — compose expands
`$` in unquoted values, and `ADMIN_PASSWORD_HASH` is full of them.

| Variable | Purpose |
|---|---|
| `POSTGRES_PASSWORD` | database password, hex only (it goes into `DATABASE_URL` unescaped). `POSTGRES_USER`/`POSTGRES_DB` default to `portfolio` |
| `NEXT_PUBLIC_SITE_URL` | `https://fadaeixlii.dev` — also baked in at build time |
| `SESSION_SECRET` | signs the admin cookie |
| `ADMIN_EMAILS` / `ADMIN_PASSWORD_HASH` | the one admin login (`pnpm admin:hash`) |
| `BOOKING_TOKEN_SECRET` | HMAC for cancel links. Changing it breaks every link already emailed |
| `RESEND_API_KEY` / `CONTACT_TO_EMAIL` / `CONTACT_FROM_EMAIL` | contact and booking email |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REFRESH_TOKEN` / `GOOGLE_CALENDAR_ID` | booking calendar |

`DATABASE_URL` is not in the file; `compose.yaml` builds it from the `POSTGRES_*` values.

Only `NEXT_PUBLIC_SITE_URL` is a build `ARG`. Everything else is read at runtime, so changing
a value needs `docker compose up -d` in `~/portfolio`, not a rebuild.

## Reading logs

```bash
cd ~/portfolio
docker compose ps
docker compose logs -f portfolio                     # app
cd ~/outreach && docker compose logs -f caddy        # TLS/proxy, all sites
```

## Rolling back

```bash
cd ~/portfolio
docker tag portfolio:previous portfolio:latest
docker compose up -d
```

`:previous` is the image that was running before the last deploy. Migrations are
forward-only; a rollback across a schema change needs the old code to tolerate the new
schema. Or revert the commit on `main` and let the workflow redeploy.

## Rotating the Google refresh token

The OAuth app is **published** (In production, unverified). Tokens from a published app do
not expire on a timer (they still die after six months unused, or when revoked). If the app
is ever back in Testing, tokens die **7 days after they are
issued, whether used or not** — that is Google's rule, not an inactivity timeout.

1. On a machine with a browser: `pnpm calendar:auth`, sign in as the calendar's owner.
2. Put the printed `GOOGLE_REFRESH_TOKEN` into `~/portfolio/.env` (single-quoted).
3. `cd ~/portfolio && docker compose up -d`.

Full first-time setup: [`docs/google-calendar-setup.md`](./google-calendar-setup.md).

## Calendar health check down

`GET /api/health/calendar` returns `503` when `getAccessToken()` fails — expired/revoked
refresh token, wrong client id/secret, or the Calendar API unreachable. The booker degrades
to an "email me instead" panel rather than an empty month, so nobody sees a broken page, but
nobody can book either:

1. `docker compose logs portfolio | grep -i calendar` for the actual error.
2. Expired or revoked token → rotate it (above).
3. Confirm `GOOGLE_CALENDAR_ID` still matches the calendar the OAuth client can see.

## Purging the Cloudflare cache

Only after a deploy that changes static assets Cloudflare may have cached (images, fonts).
`/_next/static/*` is fingerprinted and never needs it. Dashboard: **Caching → Configuration →
Custom Purge** for the affected paths.

## Verifying no secret shipped

Before the first deploy, and after any change that touches env handling, on the built image:

```bash
docker run --rm --entrypoint sh portfolio:latest -c \
  "grep -rlE 'GOOGLE_(CLIENT_SECRET|REFRESH_TOKEN)|SESSION_SECRET|BOOKING_TOKEN_SECRET|ADMIN_PASSWORD_HASH' .next/static || echo clean"
```

Expected: `clean`. Variable *names* in server chunks are fine; anything under `.next/static`
reaches browsers. `.dockerignore` keeps `.env*` and the Google client file out of the build
context entirely.

## First-time setup on a new VPS

1. Outreach stack up with `--profile public` (it creates the `edge` network and runs Caddy).
2. `mkdir -p ~/portfolio ~/caddy-sites/certs`, origin cert + key into `certs/`, `chmod 600`.
3. `~/portfolio/.env` as above, `chmod 600`.
4. A deploy key: public half in `~/.ssh/authorized_keys`, private half in the `VPS_SSH_KEY`
   secret, plus `VPS_HOST` and `VPS_USER`.
5. Run the `deploy` workflow from the Actions tab.
