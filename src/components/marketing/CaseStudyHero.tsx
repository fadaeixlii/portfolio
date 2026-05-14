import Link from "next/link";
import type { CaseStudyFrontmatter } from "@/lib/mdx/types";

interface CaseStudyHeroProps {
  frontmatter: CaseStudyFrontmatter;
}

export function CaseStudyHero({ frontmatter }: CaseStudyHeroProps) {
  return (
    <header className="flex flex-col gap-6">
      <Link
        href="/work"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="rotate-180"
          aria-hidden="true"
        >
          <path
            d="M6 3l5 5-5 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back to Work
      </Link>

      <div className="flex flex-col gap-4">
        <h1 className="font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
          {frontmatter.title}
        </h1>

        <p className="text-lg leading-relaxed text-muted-foreground">
          {frontmatter.tagline}
        </p>

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="rounded-sm bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
            {frontmatter.role}
          </span>
          <span>{frontmatter.year}</span>
          <span className="text-border">·</span>
          <div className="flex flex-wrap gap-1.5">
            {frontmatter.tech.slice(0, 5).map((t) => (
              <span
                key={t}
                className="rounded-sm border border-border px-2 py-0.5 text-xs"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
