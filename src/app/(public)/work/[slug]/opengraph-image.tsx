import { generateOgImage, ogSize, ogContentType } from "@/lib/og/generate";
import { getCaseStudy } from "@/lib/mdx/case-studies";

export const alt = "Case Study — Mohammad M Khani";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getCaseStudy(slug);

  if (!result) {
    return generateOgImage({ title: "Case Study" });
  }

  return generateOgImage({
    title: result.frontmatter.title,
    subtitle: result.frontmatter.tagline,
  });
}
