import Link from "next/link";
import type { BlogPostFrontmatter } from "@/lib/mdx/types";

interface BlogPostCardProps {
  post: BlogPostFrontmatter;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col gap-3 rounded-lg border border-border bg-card p-6 transition-colors hover:border-accent/30"
    >
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <span className="text-border">·</span>
        <span>{post.reading_time} min read</span>
      </div>

      <h2 className="font-serif text-xl font-normal tracking-tight text-foreground transition-colors group-hover:text-accent">
        {post.title}
      </h2>

      <p className="text-sm leading-relaxed text-muted-foreground">
        {post.excerpt}
      </p>

      <div className="flex flex-wrap gap-1.5 pt-1">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-sm bg-muted px-2 py-0.5 text-xs text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
