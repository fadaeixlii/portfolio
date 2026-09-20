#!/usr/bin/env node
// Prints the ADMIN_PASSWORD_HASH line for a password you type.
//
//   pnpm admin:hash
//
// Reads from stdin rather than argv so the password never lands in shell
// history or a process list.
import { scryptSync, randomBytes } from "node:crypto";
import { createInterface } from "node:readline/promises";

const rl = createInterface({ input: process.stdin, output: process.stderr });
const password = await rl.question("New admin password: ");
rl.close();

if (password.length < 12) {
  console.error("\nToo short — use at least 12 characters.");
  process.exit(1);
}

const salt = randomBytes(16);
const key = scryptSync(password, salt, 64);
console.log(`\nADMIN_PASSWORD_HASH=scrypt$${salt.toString("hex")}$${key.toString("hex")}`);
console.error("\nPaste that into .env.local (and your VPS environment).");
