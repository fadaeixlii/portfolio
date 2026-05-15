import { generateOgImage, ogSize, ogContentType } from "@/lib/og/generate";
import { getBlogPost } from "@/lib/mdx/blog";

export const alt = "Blog post — Mohammad Fadaei";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getBlogPost(slug);

  if (!result) {
    return generateOgImage({ title: "Blog" });
  }

  return generateOgImage({
    title: result.frontmatter.title,
    subtitle: result.frontmatter.excerpt,
  });
}
