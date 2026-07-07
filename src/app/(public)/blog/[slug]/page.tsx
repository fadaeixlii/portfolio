import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getBlogPost,
  getAllBlogSlugs,
  getAdjacentBlogPosts,
} from "@/lib/mdx/blog";
import { BlogPostHeader } from "@/components/marketing/BlogPostHeader";
import { BlogPostNav } from "@/components/marketing/BlogPostNav";
import { FadeIn } from "@/components/shared/FadeIn";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getBlogPost(slug);
  if (!result) return {};

  const { frontmatter } = result;
  return {
    title: `${frontmatter.title} — Mohammad M Khani`,
    description: frontmatter.excerpt,
    alternates: { canonical: `https://fadaeixlii.com/blog/${slug}` },
    openGraph: {
      type: "article",
      title: frontmatter.title,
      description: frontmatter.excerpt,
      url: `https://fadaeixlii.com/blog/${slug}`,
      publishedTime: frontmatter.date,
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const result = await getBlogPost(slug);
  if (!result) notFound();

  const { content, frontmatter } = result;
  const adjacent = await getAdjacentBlogPosts(slug);

  return (
    <article className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-16 md:px-12 lg:px-16">
      <FadeIn>
        <BlogPostHeader frontmatter={frontmatter} />
      </FadeIn>

      <FadeIn delay={0.08}>
        <div className="mt-12">{content}</div>
      </FadeIn>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: frontmatter.title,
            description: frontmatter.excerpt,
            datePublished: frontmatter.date,
            author: { "@type": "Person", name: "Mohammad M Khani" },
            url: `https://fadaeixlii.com/blog/${slug}`,
            keywords: frontmatter.tags.join(", "),
          }),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://fadaeixlii.com" },
              { "@type": "ListItem", position: 2, name: "Blog", item: "https://fadaeixlii.com/blog" },
              { "@type": "ListItem", position: 3, name: frontmatter.title, item: `https://fadaeixlii.com/blog/${slug}` },
            ],
          }),
        }}
      />

      <BlogPostNav prev={adjacent.prev} next={adjacent.next} />
    </article>
  );
}
