import type { BlogPostFrontmatter } from "@/lib/mdx/types";

interface BlogPostHeaderProps {
  frontmatter: BlogPostFrontmatter;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function BlogPostHeader({ frontmatter }: BlogPostHeaderProps) {
  return (
    <header className="flex flex-col gap-4">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <time dateTime={frontmatter.date}>{formatDate(frontmatter.date)}</time>
        <span className="text-border">·</span>
        <span>{frontmatter.reading_time} min read</span>
      </div>

      <h1 className="font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
        {frontmatter.title}
      </h1>

      <p className="text-lg leading-relaxed text-muted-foreground">
        {frontmatter.excerpt}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {frontmatter.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-sm border border-border px-2 py-0.5 text-xs text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
    </header>
  );
}
