import "server-only";
import { brandIcon } from "@/lib/brand-icons";
import { readableBrand } from "@/lib/brand-contrast";
import { genericMark } from "@/lib/generic-marks";

/**
 * A technology's brand mark, resolved to everything the view needs: the path
 * to draw and the two theme-safe colours to draw it in.
 *
 * This exists because the resolution is unavoidably server-side — the
 * contrast solver reads the paper colours out of tokens.css with `node:fs`,
 * and simple-icons is a 3,453-icon package that has no business in a browser
 * bundle. `StackChip` used to call both directly, which was fine while every
 * caller was a server component and broke the build the moment a client one
 * (`StackTabs`) rendered a chip: `server-only` in a client module is a hard
 * error, not a warning.
 *
 * So the server resolves, and the chip is handed plain data.
 */
export type StackMark = {
  path: string;
  dark: string;
  light: string;
  /** Stroked category glyph rather than a filled brand logo. */
  stroke?: boolean;
} | null;

export function markFor(name: string): StackMark {
  const icon = brandIcon(name);
  if (icon) {
    const { dark, light } = readableBrand(icon.hex);
    return { path: icon.path, dark, light };
  }

  // No brand mark: fall back to a category glyph in the ink colour rather
  // than leaving the chip bare. It inherits `currentColor`, so it needs no
  // contrast solving — see lib/generic-marks.ts for why these are generic.
  const generic = genericMark(name);
  return generic
    ? { path: generic.path, dark: "currentColor", light: "currentColor", stroke: true }
    : null;
}

/** The same, for a whole group listing — the shape `StackTabs` takes. */
export function markGroups<T extends { name: string; items: string[] }>(groups: T[]) {
  return groups.map((group) => ({
    name: group.name,
    items: group.items.map((name) => ({ name, mark: markFor(name) })),
  }));
}
