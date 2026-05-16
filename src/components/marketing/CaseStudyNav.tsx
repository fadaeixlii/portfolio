import Link from "next/link";
import type { CaseStudyFrontmatter } from "@/lib/mdx/types";

interface CaseStudyNavProps {
  prev: CaseStudyFrontmatter | null;
  next: CaseStudyFrontmatter | null;
}

export function CaseStudyNav({ prev, next }: CaseStudyNavProps) {
  if (!prev && !next) return null;

  return (
    <nav
      className="mt-10 flex items-stretch border-t border-border pt-6 sm:mt-16 sm:pt-8"
      aria-label="Case study navigation"
    >
      <div className="flex-1">
        {prev && (
          <Link
            href={`/work/${prev.slug}`}
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
            href={`/work/${next.slug}`}
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
