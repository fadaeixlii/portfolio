import Image from "next/image";
import Link from "next/link";
import type { CaseStudyFrontmatter } from "@/lib/mdx/types";

interface CaseStudyHeroProps {
  frontmatter: CaseStudyFrontmatter;
}

export function CaseStudyHero({ frontmatter }: CaseStudyHeroProps) {
  return (
    <header className="flex flex-col gap-8">
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

      <div className="flex flex-col gap-6">
        <h1 className="font-serif text-4xl font-normal tracking-tight text-foreground sm:text-5xl md:text-6xl">
          {frontmatter.title}
        </h1>

        {frontmatter.tagline && (
          <blockquote className="border-l-2 border-accent/30 pl-4 font-serif text-xl italic leading-relaxed text-foreground/80 sm:text-2xl">
            {frontmatter.tagline}
          </blockquote>
        )}

        {/* Meta ledger */}
        <div className="grid grid-cols-2 gap-4 border-t border-border pt-6 sm:grid-cols-3 md:grid-cols-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Role
            </span>
            <p className="mt-1 text-sm text-foreground">{frontmatter.role}</p>
          </div>
          <div>
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Year
            </span>
            <p className="mt-1 text-sm text-foreground">{frontmatter.year}</p>
          </div>
          {frontmatter.tech.map((t) => (
            <div key={t}>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Tech
              </span>
              <p className="mt-1 text-sm text-foreground">{t}</p>
            </div>
          ))}
        </div>

        {/* Hero image */}
        {frontmatter.hero_image && (
          <div className="overflow-hidden rounded-lg border border-border">
            <Image
              src={frontmatter.hero_image}
              alt={`${frontmatter.title} — project screenshot`}
              width={1920}
              height={1080}
              className="h-auto w-full object-cover"
              priority
            />
          </div>
        )}
      </div>
    </header>
  );
}
