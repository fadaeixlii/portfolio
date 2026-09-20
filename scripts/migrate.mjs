#!/usr/bin/env node
// Applies db/migrations/*.sql in filename order, once each.
//
// Deliberately about thirty lines: a migration tool's job is to run files in
// order and remember which ones it ran. Everything past that — rollbacks,
// checksums, branching — is machinery this project would carry and never use.
//
//   pnpm db:migrate

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const here = dirname(fileURLToPath(import.meta.url));
const dir = join(here, "..", "db", "migrations");

// Read .env.local the same way the app does, so `pnpm db:migrate` needs no
// exported environment.
const envPath = join(here, "..", ".env.local");
for (const line of readFileSync(envPath, "utf8").split("\n")) {
  if (!line.includes("=") || line.trimStart().startsWith("#")) continue;
  const i = line.indexOf("=");
  const key = line.slice(0, i).trim();
  if (!process.env[key]) process.env[key] = line.slice(i + 1).trim();
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set (looked in .env.local)");
  process.exit(1);
}

const sql = postgres(url, { max: 1, connect_timeout: 10, onnotice: () => {} });

try {
  await sql`
    create table if not exists _migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    )
  `;

  const applied = new Set(
    (await sql`select name from _migrations`).map((r) => r.name),
  );
  const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();

  let ran = 0;
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`  skip   ${file}`);
      continue;
    }
    // `sql.begin` wraps each file in a transaction: a migration that fails
    // half way leaves nothing behind and can simply be re-run.
    await sql.begin(async (tx) => {
      await tx.unsafe(readFileSync(join(dir, file), "utf8"));
      await tx`insert into _migrations ${tx({ name: file })}`;
    });
    console.log(`  applied ${file}`);
    ran += 1;
  }

  console.log(ran ? `\n${ran} migration(s) applied.` : "\nUp to date.");
} catch (error) {
  console.error(`\nmigration failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await sql.end();
}
