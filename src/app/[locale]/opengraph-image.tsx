import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { getOgColors } from "@/lib/seo/og-colors";
import { loadDisplayFont } from "@/lib/seo/og-font";

// Node runtime, not edge: getOgColors() reads tokens.css off disk (see its
// file header for why satori can't just take var(--signal) or oklch()).
export const runtime = "nodejs";

export const alt = "Mohammad M. Khani";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home.hero" });
  const colors = getOgColors();
  const font = await loadDisplayFont();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: colors.paper,
        }}
      >
        {/* The orange signal — a single rule, never a gradient or a shape. */}
        <div style={{ display: "flex", width: 96, height: 4, background: colors.signal }} />
        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.05,
            color: colors.ink,
          }}
        >
          {t("name")}
        </div>
        <div style={{ display: "flex", marginTop: 24, fontSize: 32, color: colors.dim }}>
          {t("role")} — {t("location")}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font ? [{ name: "Archivo", data: font, weight: 700 as const }] : undefined,
    },
  );
}
