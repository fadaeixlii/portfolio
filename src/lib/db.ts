import "server-only";
import postgres from "postgres";

/**
 * The database connection, and the only one.
 *
 * Replaces the Supabase client. `postgres` is a driver, not an ORM — the
 * queries in this app are half a dozen statements and were already being
 * written out longhand through the Supabase query builder, so there is
 * nothing for a schema layer to earn here.
 *
 * Held on `globalThis` so Next's dev server, which re-evaluates modules on
 * every edit, does not open a new pool per reload until Postgres runs out of
 * connections.
 */
const globalForDb = globalThis as unknown as { sql?: postgres.Sql };

function connect() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  return postgres(url, {
    // Small on purpose: this is a portfolio, and the VPS runs other things.
    max: 5,
    idle_timeout: 20,
    // A wedged database must not hang a request forever — the route's catch
    // block has to run so the booker can offer the email fallback. This is
    // the same ceiling the Supabase client had, for the same reason.
    connect_timeout: 5,
    // Belt and braces on the server side: a query that somehow gets past the
    // connect timeout still cannot run longer than this.
    connection: { statement_timeout: 5000 },
    // The app formats every date itself; returning strings rather than
    // JS Dates keeps that one-way and avoids a second timezone conversion.
    types: {},
    onnotice: () => {},
  });
}

/**
 * Lazy on purpose. Connecting at module scope means merely *importing*
 * anything downstream of this needs DATABASE_URL — which broke a unit test
 * that imports a route only to read one exported helper, and would break a
 * build step for the same reason. The connection is made on first query.
 */
function client(): postgres.Sql {
  globalForDb.sql ??= connect();
  return globalForDb.sql;
}

export const sql: postgres.Sql = new Proxy((() => {}) as unknown as postgres.Sql, {
  // Both `sql\`select ...\`` and the `sql({ col: value })` insert helper
  // arrive here as a call.
  apply: (_target, _thisArg, args: unknown[]) =>
    (client() as unknown as (...a: unknown[]) => unknown)(...args),
  // `.begin`, `.end`, `.unsafe` and friends.
  get: (_target, prop) => (client() as unknown as Record<string | symbol, unknown>)[prop],
});

/** Postgres's unique-violation SQLSTATE — the double-booking guard firing. */
export const UNIQUE_VIOLATION = "23505";

export function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === UNIQUE_VIOLATION
  );
}
