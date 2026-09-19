#!/usr/bin/env node
/**
 * One-time Google OAuth consent.
 *
 * Spins a throwaway localhost server, prints the consent URL, catches the
 * redirect, exchanges the code for a refresh token, prints it.
 *
 * Run with:  pnpm calendar:auth
 *
 * Never run this in CI. Never commit its output.
 * Full walkthrough: docs/google-calendar-setup.md
 */
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";

const REDIRECT = "http://localhost:4321/callback";
const ENV_FILES = [".env.local", ".env"];

function loadEnv() {
  const file = ENV_FILES.find((f) => existsSync(f));
  if (!file) {
    fail(
      `No ${ENV_FILES.join(" or ")} found in ${process.cwd()}.`,
      "Create .env.local with GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET first.",
      "See docs/google-calendar-setup.md steps 1-5.",
    );
  }
  const env = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    // Strip surrounding quotes; people paste them in without noticing.
    env[trimmed.slice(0, eq).trim()] = trimmed
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
  }
  return { env, file };
}

function fail(...lines) {
  console.error("\n  " + lines.join("\n  ") + "\n");
  process.exit(1);
}

const { env, file } = loadEnv();
const CLIENT_ID = env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  fail(
    `${file} is missing GOOGLE_CLIENT_ID and/or GOOGLE_CLIENT_SECRET.`,
    "Get them from https://console.cloud.google.com/auth/clients",
    "See docs/google-calendar-setup.md step 4.",
  );
}

const authUrl =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/calendar",
    // access_type=offline AND prompt=consent are both required, or Google
    // returns an access token with no refresh token and this is pointless.
    access_type: "offline",
    prompt: "consent",
  });

console.log("\n  Open this URL in a browser signed in as your test user:\n");
console.log("  " + authUrl + "\n");
console.log('  Google will warn "this app is not verified" — that is your own');
console.log('  unverified app. Click Advanced, then "Go to ... (unsafe)".\n');
console.log("  Waiting on http://localhost:4321 ...\n");

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost:4321");
  if (url.pathname !== "/callback") {
    res.statusCode = 404;
    return res.end();
  }

  const error = url.searchParams.get("error");
  if (error) {
    res.end("Denied. Check the terminal.");
    console.error(`\n  Consent denied: ${error}`);
    if (error === "access_denied") {
      console.error("  Add your Gmail as a test user:");
      console.error("  https://console.cloud.google.com/auth/audience\n");
    }
    server.close();
    process.exitCode = 1;
    return;
  }

  const code = url.searchParams.get("code");
  if (!code) {
    res.end("No code in the callback. Check the terminal.");
    server.close();
    process.exitCode = 1;
    return;
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT,
      grant_type: "authorization_code",
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    res.end("Token exchange failed. Check the terminal.");
    console.error(`\n  Token exchange failed (${response.status}):`);
    console.error("  " + JSON.stringify(data));
    if (data.error === "redirect_uri_mismatch") {
      console.error(`\n  The authorised redirect URI must be exactly:`);
      console.error(`  ${REDIRECT}`);
      console.error("  No trailing slash, http not https.");
      console.error("  https://console.cloud.google.com/auth/clients\n");
    }
    server.close();
    process.exitCode = 1;
    return;
  }

  if (!data.refresh_token) {
    res.end("No refresh token returned. Check the terminal.");
    console.error("\n  Google returned an access token but no refresh token.");
    console.error("  It only issues one on the FIRST consent for a client.");
    console.error("  Revoke and retry:");
    console.error("  1. https://myaccount.google.com/permissions");
    console.error('  2. Find your app, click "Remove access"');
    console.error("  3. Run pnpm calendar:auth again\n");
    server.close();
    process.exitCode = 1;
    return;
  }

  res.end("Done. Close this tab and return to the terminal.");
  console.log(`  Success. Add this line to ${file}:\n`);
  console.log(`GOOGLE_REFRESH_TOKEN=${data.refresh_token}\n`);
  console.log("  Also make sure these are set:");
  console.log("GOOGLE_CALENDAR_ID=primary\n");
  console.log("  This value grants standing access to your calendar.");
  console.log("  Never commit it. Never paste it into a chat.\n");
  server.close();
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    fail(
      "Port 4321 is already in use.",
      "Close whatever is using it and run again.",
    );
  }
  fail(`Server error: ${err.message}`);
});

server.listen(4321);
