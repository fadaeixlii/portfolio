import { generateOgImage, ogSize, ogContentType } from "@/lib/og/generate";

export const alt = "Blog — Mohammad M Khani";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return generateOgImage({
    title: "Blog",
    subtitle: "Articles on React, TypeScript, and web architecture.",
  });
}
