// Test-only stand-in for the "server-only" marker package (see vitest.config.ts).
// Vitest runs pure Node, which is a legitimate server context, so this is a
// deliberate no-op rather than a workaround for a real restriction.
export {};
