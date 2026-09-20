#!/usr/bin/env node
// Answers one question: can this machine book a call, and if not, which of the
// two independent faults is in the way?
//
//   1. DNS   — Hiddify (sing-box) hijacks port 53, so *.supabase.co can fail
//              to resolve even when you pass an explicit server to nslookup.
//   2. Schema — the bookings table only exists once supabase/PENDING.sql has
//              been run in the SQL editor.
//
// Each is checked separately, because fixing one does not fix the other and
// the app's own error can only ever show you the first one it hits.
//
//   pnpm check:supabase

import { readFileSync } from "node:fs";
import { lookup } from "node:dns/promises";
import { request as httpsRequest } from "node:https";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SECRET_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY missing from .env.local");
  process.exit(1);
}
const host = new URL(url).host;

const pass = (m) => console.log(`  PASS  ${m}`);
const fail = (m) => console.log(`  FAIL  ${m}`);

/** What the OS resolver — the one the app itself uses — can see. */
async function checkDns() {
  console.log("\n1. DNS, as the app resolves it");
  try {
    const { address } = await lookup(host);
    pass(`${host} -> ${address}`);
    return address;
  } catch (error) {
    fail(`${host} did not resolve (${error.code ?? error.message})`);
    console.log("        Hiddify hijacks port 53, so passing a server to");
    console.log("        nslookup does not bypass it. Either set Hiddify's own");
    console.log("        DNS to 1.1.1.1, or add a hosts entry (see below).");
    return null;
  }
}

/** The public truth, over DNS-over-HTTPS, which nothing on the box can intercept. */
async function checkPublic() {
  console.log("\n2. DNS, as the rest of the world sees it");
  try {
    const res = await fetch(`https://1.1.1.1/dns-query?name=${host}&type=A`, {
      headers: { accept: "application/dns-json" },
      signal: AbortSignal.timeout(10_000),
    });
    const body = await res.json();
    const ips = (body.Answer ?? []).filter((a) => a.type === 1).map((a) => a.data);
    if (ips.length) {
      pass(`resolves publicly to ${ips.join(", ")}`);
      return ips;
    }
    fail(`does not resolve publicly (status ${body.Status}) — the project may be paused or deleted`);
    return [];
  } catch (error) {
    fail(`could not reach the DoH resolver: ${error.message}`);
    return [];
  }
}

/**
 * A GET straight to an IP, with the real hostname in SNI and the Host header
 * — the equivalent of `curl --resolve`. Node's fetch always goes through the
 * OS resolver, so on a machine whose DNS is broken it can only ever report
 * "fetch failed", which tells you nothing about the schema underneath.
 */
function getByIp(ip, path) {
  return new Promise((resolve, reject) => {
    const req = httpsRequest(
      {
        host: ip,
        servername: host,
        path,
        method: "GET",
        timeout: 15_000,
        headers: { Host: host, apikey: key, Authorization: `Bearer ${key}` },
      },
      (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => resolve({ status: res.statusCode ?? 0, body }));
      },
    );
    req.on("timeout", () => req.destroy(new Error("timed out")));
    req.on("error", reject);
    req.end();
  });
}

/** Whether the schema is there, reached by IP so a broken resolver cannot hide it. */
async function checkSchema(ip) {
  console.log("\n3. Schema (reached by IP, so DNS cannot mask it)");
  if (!ip) {
    console.log("  SKIP  no address to try");
    return;
  }
  for (const table of ["contact_messages", "bookings"]) {
    try {
      const res = await getByIp(ip, `/rest/v1/${table}?select=*&limit=1`);
      if (res.status >= 200 && res.status < 300) pass(`${table} exists`);
      else if (res.body.includes("PGRST205")) {
        fail(`${table} is missing — run supabase/PENDING.sql in the SQL editor`);
      } else {
        fail(`${table} -> HTTP ${res.status} ${res.body.slice(0, 120)}`);
      }
    } catch (error) {
      fail(`${table} unreachable: ${error.message}`);
    }
  }
}

const local = await checkDns();
const publicIps = await checkPublic();
await checkSchema(publicIps[0] ?? local);

if (!local && publicIps.length) {
  console.log("\nTo make the app itself work on this machine, one of:");
  console.log("  a) Hiddify > Settings > DNS  ->  1.1.1.1   (then reconnect)");
  console.log("  b) run as Administrator, appending to");
  console.log("     C:\\Windows\\System32\\drivers\\etc\\hosts :");
  console.log(`       ${publicIps[0]}  ${host}`);
  console.log("     Remove that line once Hiddify's DNS is fixed — the address");
  console.log("     is Cloudflare's and will not stay correct forever.");
}
console.log("");
