import Link from "next/link";
import type { BlogPostFrontmatter } from "@/lib/mdx/types";

interface BlogPostNavProps {
  prev: BlogPostFrontmatter | null;
  next: BlogPostFrontmatter | null;
}

export function BlogPostNav({ prev, next }: BlogPostNavProps) {
  if (!prev && !next) return null;

  return (
    <nav
      className="mt-16 flex items-stretch border-t border-border pt-8"
      aria-label="Blog post navigation"
    >
      <div className="flex-1">
        {prev && (
          <Link
            href={`/blog/${prev.slug}`}
            className="group flex flex-col gap-1 text-left"
          >
            <span className="text-xs text-muted-foreground">Previous</span>
            <span className="text-sm font-medium text-foreground transition-colors group-hover:text-accent">
              ← {prev.title}
            </span>
          </Link>
        )}
      </div>
      <div className="flex-1 text-right">
        {next && (
          <Link
            href={`/blog/${next.slug}`}
            className="group flex flex-col items-end gap-1"
          >
            <span className="text-xs text-muted-foreground">Next</span>
            <span className="text-sm font-medium text-foreground transition-colors group-hover:text-accent">
              {next.title} →
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
}
