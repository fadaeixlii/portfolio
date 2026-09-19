import { ImageResponse } from "next/og";
import { getProject } from "@/content";
import { getOgColors } from "@/lib/seo/og-colors";
import { loadDisplayFont } from "@/lib/seo/og-font";

// Node runtime, not edge: getOgColors() reads tokens.css off disk (see its
// file header for why satori can't just take var(--signal) or oklch()).
export const runtime = "nodejs";

export const alt = "Project — Mohammad M. Khani";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
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
        <div style={{ display: "flex", width: 96, height: 4, background: colors.signal }} />
        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.1,
            color: colors.ink,
          }}
        >
          {project?.name ?? "Mohammad M. Khani"}
        </div>
        {project ? (
          <div style={{ display: "flex", marginTop: 24, fontSize: 30, color: colors.dim }}>
            {project.summary}
          </div>
        ) : null}
      </div>
    ),
    {
      ...size,
      fonts: font ? [{ name: "Archivo", data: font, weight: 700 as const }] : undefined,
    },
  );
}
