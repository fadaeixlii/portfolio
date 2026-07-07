import type { Metadata } from "next";
import { getAllBlogPosts } from "@/lib/mdx/blog";
import { BlogPostCard } from "@/components/marketing/BlogPostCard";
import { FadeIn } from "@/components/shared/FadeIn";

export const metadata: Metadata = {
  title: "Blog — Mohammad M Khani",
  description:
    "Articles on React, TypeScript, Next.js, and web architecture. Patterns and lessons from seven years of full-stack development.",
  alternates: { canonical: "https://fadaeixlii.com/blog" },
  openGraph: {
    type: "website",
    title: "Blog — Mohammad M Khani",
    description:
      "Articles on React, TypeScript, Next.js, and web architecture. Patterns and lessons from seven years of full-stack development.",
    url: "https://fadaeixlii.com/blog",
    siteName: "fadaeixlii.com",
  },
  twitter: { card: "summary_large_image" },
};

export default async function BlogPage() {
  const posts = await getAllBlogPosts();

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-16 md:px-12 lg:px-16">
      <div className="flex flex-col gap-8 sm:gap-12">
        <FadeIn>
          <div className="flex flex-col gap-4">
            <h1 className="font-serif text-4xl font-normal tracking-tight">
              Blog
            </h1>
            <p className="text-lg text-muted-foreground">
              Articles on React, TypeScript, and web architecture.
            </p>
          </div>
        </FadeIn>

        <div className="flex flex-col gap-4">
          {posts.map((post, i) => (
            <FadeIn key={post.slug} delay={Math.min(0.05 * i, 0.3)}>
              <BlogPostCard post={post} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
