import { generateOgImage, ogSize, ogContentType } from "@/lib/og/generate";

export const alt = "Playground — Mohammad Fadaei";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return generateOgImage({
    title: "Playground",
    subtitle: "Interactive experiments and creative coding demos.",
  });
}
