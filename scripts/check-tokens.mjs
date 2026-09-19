#!/usr/bin/env node
// Fails if a raw colour value appears outside the one file allowed to author colour.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const ALLOWED = [
  "src/styles/tokens.css",
  // OG images render through satori, which has no support for CSS custom
  // properties or oklch() — this file reads tokens.css at request time and
  // converts whatever is there, rather than hand-authoring a value, so
  // tokens.css stays the single source of truth. See its own file header.
  "src/lib/seo/og-colors.ts",
];
const EXTS = [".css", ".ts", ".tsx"];
const RAW_COLOUR = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(/;
const PHYSICAL =
  /\b(?:ml|mr|pl|pr)-(?:\d|px|auto|\[)|\b(?:left|right)-(?:\d|px|\[)|\btext-(?:left|right)\b|\b(?:margin|padding)-(?:left|right)\s*:|(?<![\w-])(?:left|right)\s*:/;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (["node_modules", ".next", ".git", "fixtures"].includes(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (EXTS.some((e) => entry.endsWith(e))) out.push(full);
  }
  return out;
}

const violations = [];
for (const file of walk(join(ROOT, "src"))) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    if (line.trimStart().startsWith("//") || line.trimStart().startsWith("*")) return;
    if (!ALLOWED.includes(rel) && RAW_COLOUR.test(line)) {
      violations.push(`${rel}:${i + 1}  raw colour — use a token`);
    }
    if (PHYSICAL.test(line)) {
      violations.push(`${rel}:${i + 1}  physical direction — use ms-/me-/ps-/pe-/start-/end-`);
    }
  });
}

if (violations.length) {
  console.error(`check-tokens: ${violations.length} violation(s)\n` + violations.join("\n"));
  process.exit(1);
}
console.log("check-tokens: clean");
