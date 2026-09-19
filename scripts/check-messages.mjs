#!/usr/bin/env node
import { readFileSync } from "node:fs";

const load = (l) =>
  JSON.parse(readFileSync(`src/messages/${l}.json`, "utf8"));

const flatten = (obj, prefix = "") =>
  Object.entries(obj).flatMap(([k, v]) =>
    k.startsWith("_")
      ? []
      : typeof v === "object" && v !== null
        ? flatten(v, `${prefix}${k}.`)
        : [`${prefix}${k}`],
  );

const base = flatten(load("en"));
let bad = 0;

for (const locale of ["de", "nl", "fa", "el"]) {
  const keys = new Set(flatten(load(locale)));
  const missing = base.filter((k) => !keys.has(k));
  if (missing.length) {
    console.error(`${locale}: ${missing.length} missing\n  ${missing.join("\n  ")}`);
    bad = 1;
  }
}

if (!bad) console.log("check-messages: clean");
process.exit(bad);
