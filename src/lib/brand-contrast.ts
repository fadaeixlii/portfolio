/**
 * Brand hexes are chosen against a white marketing page, so a lot of them are
 * unusable as-is here. Next.js is #000000, Express #0A0A0A and Socket.io
 * #010101 — all invisible on the dark paper. Tailwind #06B6D4 and
 * Android #3DDC84 wash out on the light one.
 *
 * A single fixed blend cannot fix both: the amount of lift #000000 needs
 * would wreck #61DAFB. So solve per brand, at build time, for the smallest
 * blend toward the theme's ink that clears the 3:1 WCAG floor for non-text
 * graphics (1.4.11). Below that floor the mark is decoration; above it, it
 * is still recognisably the brand.
 */

import { readTokenRgb } from "@/lib/seo/og-colors";

type Rgb = [number, number, number];

/**
 * The two papers the marks sit on, read from tokens.css rather than copied.
 * Hardcoding them would put two more colours outside the one file allowed to
 * author colour, and they would drift silently the first time the paper is
 * retuned — which is exactly what `check-tokens` exists to prevent.
 */
const DARK_PAPER = (): Rgb => readTokenRgb("slate-900");
const LIGHT_PAPER = (): Rgb => readTokenRgb("slate-50");

function parseHex(hex: string): Rgb {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  return [
    Number.parseInt(full.slice(0, 2), 16),
    Number.parseInt(full.slice(2, 4), 16),
    Number.parseInt(full.slice(4, 6), 16),
  ];
}

function toHex([r, g, b]: Rgb): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0"))
      .join("")
  );
}

function luminance([r, g, b]: Rgb): number {
  const f = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function ratio(a: Rgb, b: Rgb): number {
  const [l1, l2] = [luminance(a), luminance(b)];
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function mix(from: Rgb, to: Rgb, amount: number): Rgb {
  return [
    from[0] + (to[0] - from[0]) * amount,
    from[1] + (to[1] - from[1]) * amount,
    from[2] + (to[2] - from[2]) * amount,
  ];
}

/**
 * Walk the brand toward `towards` in 5% steps until it clears 3:1 against
 * `paper`. Steps rather than a binary search because the answer is a colour a
 * human will look at, and 5% is already below the just-noticeable difference
 * — a more precise blend buys nothing visible.
 */
function solve(brand: Rgb, paper: Rgb, towards: Rgb): string {
  for (let amount = 0; amount <= 1.0001; amount += 0.05) {
    const candidate = mix(brand, towards, amount);
    if (ratio(candidate, paper) >= 3) return toHex(candidate);
  }
  return toHex(towards);
}

export type BrandColors = { dark: string; light: string };

const cache = new Map<string, BrandColors>();

/** `hex` is the bare simple-icons value, no leading `#`. */
export function readableBrand(hex: string): BrandColors {
  const cached = cache.get(hex);
  if (cached) return cached;

  const brand = parseHex(hex);
  const result: BrandColors = {
    // Lift toward white on the dark paper, deepen toward black on the light.
    dark: solve(brand, DARK_PAPER(), [255, 255, 255]),
    light: solve(brand, LIGHT_PAPER(), [0, 0, 0]),
  };
  cache.set(hex, result);
  return result;
}
