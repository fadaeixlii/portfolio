import { generateOgImage, ogSize, ogContentType } from "@/lib/og/generate";

export const alt = "Contact — Mohammad Fadaei";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return generateOgImage({
    title: "Get in touch",
    subtitle: "Freelance projects, consulting, or collaboration opportunities.",
  });
}
