import * as simpleIcons from "simple-icons";

export type BrandIcon = {
  /** The 24x24 path data. */
  path: string;
  /** Brand hex, without the leading `#`. */
  hex: string;
  title: string;
};

/**
 * simple-icons exports one object per brand, keyed by its own slug rules
 * (`siNextdotjs`, `siTailwindcss`). Deriving that slug from a display name is
 * guesswork that gets `Next.js` and `Node.js` wrong, so index by title
 * instead — the title is the human name and matches what `stack.ts` writes.
 *
 * This module is only imported from server components, so the 3,453-icon
 * package never reaches the browser bundle; only the paths actually rendered
 * end up in the RSC payload.
 */
const byTitle = new Map<string, BrandIcon>();
for (const icon of Object.values(simpleIcons)) {
  if (
    icon &&
    typeof icon === "object" &&
    "title" in icon &&
    "path" in icon &&
    "hex" in icon
  ) {
    const { title, path, hex } = icon as BrandIcon;
    byTitle.set(title.toLowerCase(), { title, path, hex });
  }
}

/**
 * Names in `stack.ts` that simple-icons files under a different title.
 * Anything absent from both is rendered as a plain word — see `StackChip`.
 * A missing icon is not a problem to paper over with a generic glyph: "RAG",
 * "MCP" and "REST APIs" are techniques, not products, and have no logo.
 */
const ALIASES: Record<string, string> = {
  "ethers.js": "ethers",
  "express.js": "express",
  "socket.io": "socket.io",
  "github actions": "github actions",
  motion: "framer",
};

export function brandIcon(name: string): BrandIcon | null {
  const key = name.toLowerCase();
  return byTitle.get(ALIASES[key] ?? key) ?? null;
}
