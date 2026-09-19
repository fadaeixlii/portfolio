import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * OG images are drawn with satori (via `next/og`'s `ImageResponse`), which
 * has no support for CSS custom properties or the `oklch()` function
 * tokens.css authors colour in — so `var(--signal)` or a literal
 * `oklch(...)` both fail to render there. This file is the one sanctioned
 * exception to "only tokens.css authors a colour" (see the ALLOWED list in
 * scripts/check-tokens.mjs): it never hand-picks a value, it reads
 * tokens.css at request time and converts whatever is there, so tokens.css
 * stays the single source of truth.
 */

/** OKLCH -> sRGB, the standard conversion from the CSS Color Module 4 spec
 *  (Björn Ottosson's OKLab reference matrices). */
function oklchToRgb(l: number, c: number, hDeg: number): [number, number, number] {
  const hRad = (hDeg * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const l3 = l_ ** 3;
  const m3 = m_ ** 3;
  const s3 = s_ ** 3;

  const rLin = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const gLin = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const bLin = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

  const gamma = (x: number) =>
    x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
  const clamp = (x: number) => Math.max(0, Math.min(1, x));
  const to255 = (x: number) => Math.round(clamp(gamma(x)) * 255);

  return [to255(rLin), to255(gLin), to255(bLin)];
}

let cachedCss: string | null = null;

/** Node runtime only — see the `runtime = "nodejs"` export on the
 *  opengraph-image routes. Edge has no filesystem access, and the source
 *  .css needs to be readable at request time (not bundled) for this to stay
 *  a *read* of tokens.css rather than a copy of its values. */
function tokensCss(): string {
  if (cachedCss) return cachedCss;
  cachedCss = readFileSync(join(process.cwd(), "src/styles/tokens.css"), "utf8");
  return cachedCss;
}

function readTokenColor(name: string): string {
  const pattern = new RegExp(`--${name}:\\s*oklch\\(([\\d.]+)%\\s+([\\d.]+)\\s+([\\d.]+)\\)`);
  const match = pattern.exec(tokensCss());
  if (!match) throw new Error(`token --${name} not found in tokens.css`);
  const [, lPct, c, h] = match;
  const [r, g, b] = oklchToRgb(Number(lPct) / 100, Number(c), Number(h));
  return `rgb(${r}, ${g}, ${b})`;
}

export function getOgColors() {
  return {
    paper: readTokenColor("slate-900"),
    ink: readTokenColor("slate-50"),
    dim: readTokenColor("slate-400"),
    signal: readTokenColor("orange-500"),
    hairline: readTokenColor("slate-700"),
  };
}
