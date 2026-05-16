import { generateOgImage, ogSize, ogContentType } from "@/lib/og/generate";

export const alt = "Mohammad M Khani — Senior Full-Stack Developer";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return generateOgImage({
    title: "Mohammad M Khani",
    subtitle: "Full-stack developer. React, Next.js, TypeScript. Based in the Netherlands.",
  });
}
