import { ImageResponse } from "next/og";
import { getOgColors } from "@/lib/seo/og-colors";

// Node runtime, not edge: getOgColors() reads tokens.css off disk (see its
// file header for why satori can't just take var(--signal) or oklch()).
export const runtime = "nodejs";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** The only favicon the site needs: the signal colour on paper, the same
 *  pairing the opengraph images use. No separate icon design system. */
export default async function Icon() {
  const colors = getOgColors();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: colors.paper,
          color: colors.signal,
          fontSize: 22,
          fontWeight: 700,
        }}
      >
        M
      </div>
    ),
    size,
  );
}
