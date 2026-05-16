import { generateOgImage, ogSize, ogContentType } from "@/lib/og/generate";

export const alt = "Work — Mohammad M Khani";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return generateOgImage({
    title: "Work",
    subtitle: "Selected projects and case studies from six years of full-stack development.",
  });
}
