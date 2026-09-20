# Database

Postgres in a container, replacing Supabase.

## Why the change

Supabase was two products: a database and an auth provider. Only the
database half did anything this site needed, and it brought problems that
were not about storing bookings — a hosted host name that one machine's VPN
resolver could not see, and migrations that had to be applied through a web
console. The auth half guarded one route for one person.

So the database moved into a container the VPS already knows how to run, and
the admin login became a signed cookie with a scrypt hash.

What did **not** change is the part that enforces a rule: the partial unique
index on `bookings (start_at) where status <> 'cancelled'`. Two visitors
submitting the same slot in the same second are still arbitrated by Postgres,
not by application code that reads then writes and loses the race.

## Local

```bash
pnpm db:up        # docker compose up -d
pnpm db:migrate   # apply db/migrations/*.sql, once each
pnpm dev
```

`.env.local` needs:

```
POSTGRES_USER / POSTGRES_PASSWORD / POSTGRES_DB / POSTGRES_PORT
DATABASE_URL=postgres://user:pass@127.0.0.1:5433/portfolio
SESSION_SECRET=<48+ random chars>
ADMIN_EMAILS=you@example.com
ADMIN_PASSWORD_HASH=<pnpm admin:hash>
```

Port 5433 because this machine already runs other Postgres containers on
5432.

## Admin login

```bash
pnpm admin:hash   # prompts, prints the ADMIN_PASSWORD_HASH line
```

The hash is scrypt. There is no session table: the cookie carries
`expiry.hmac(expiry)`, so changing `SESSION_SECRET` or the password hash
invalidates every existing session. For a single admin that is the whole of
what revocation needs to be.

## VPS

The same compose file. Point `DATABASE_URL` at the container, keep the port
closed to the outside (the app and the database share a host), and back up
with `pg_dump`. Nothing in the app assumes a managed provider.

## Timeouts, and why they differ

The database gets 5s and Google Calendar gets 12s. The database is a
container on loopback that answers in tens of milliseconds; Google is a third
party over the open internet, and over a VPN the token exchange alone was
measured at 5.4s — which sat right on the old 5s abort and made availability
fail intermittently with an error that named the wrong component.

`getAvailability` tags each half's failure, so a slow Google call can never
again be logged as a database problem.
