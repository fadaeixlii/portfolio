import { generateOgImage, ogSize, ogContentType } from "@/lib/og/generate";

export const alt = "About — Mohammad M Khani";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return generateOgImage({
    title: "About",
    subtitle: "Seven years shipping React applications to production.",
  });
}
