import "server-only";

let cached: ArrayBuffer | null | undefined;

/**
 * Archivo Bold for the OG image display face. `next/font` runs at the
 * Next.js build pipeline level and has no bearing on `ImageResponse`, which
 * needs raw font bytes handed to satori directly — so this fetches the same
 * family from Google Fonts instead. Falls back to satori's built-in font if
 * that fetch fails (offline, blocked): a plainer OG image beats a build
 * failure over a font.
 */
export async function loadDisplayFont(): Promise<ArrayBuffer | null> {
  if (cached !== undefined) return cached;
  try {
    const css = await fetch(
      "https://fonts.googleapis.com/css2?family=Archivo:wght@700&display=swap",
      { headers: { "User-Agent": "Mozilla/5.0" } },
    ).then((res) => res.text());
    const url = /src:\s*url\(([^)]+)\)\s*format\('(?:truetype|woff2?)'\)/.exec(css)?.[1];
    if (!url) throw new Error("no font url in Google Fonts CSS response");
    cached = await fetch(url).then((res) => res.arrayBuffer());
  } catch (error) {
    console.error("OG font fetch failed, falling back to satori's default", error);
    cached = null;
  }
  return cached ?? null;
}
