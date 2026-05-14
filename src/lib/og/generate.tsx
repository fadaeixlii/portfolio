import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

interface OgParams {
  title: string;
  subtitle?: string;
}

export async function generateOgImage({ title, subtitle }: OgParams) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#1a1917",
        }}
      >
        {/* Accent line */}
        <div
          style={{
            width: "64px",
            height: "4px",
            borderRadius: "2px",
            backgroundColor: "#b89a60",
            marginBottom: "40px",
          }}
        />

        {/* Title */}
        <div
          style={{
            fontSize: title.length > 30 ? 56 : 72,
            color: "#ece8e0",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            fontWeight: 600,
            marginBottom: subtitle ? "24px" : "0",
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <div
            style={{
              fontSize: 24,
              color: "#918e88",
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: "48px",
            left: "80px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#b89a60",
            }}
          />
          <div
            style={{
              fontSize: 18,
              color: "#918e88",
            }}
          >
            fadaeixlii.com
          </div>
        </div>
      </div>
    ),
    { ...ogSize }
  );
}
