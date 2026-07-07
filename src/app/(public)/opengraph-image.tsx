import { generateOgImage, ogSize, ogContentType } from "@/lib/og/generate";

export const alt = "Mohammad M Khani — Full-Stack Developer · AI & Web3";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return generateOgImage({
    title: "Mohammad M Khani",
    subtitle: "Full-stack developer · AI & Web3. React, Next.js, TypeScript. Based between Athens & Mashhad.",
  });
}
