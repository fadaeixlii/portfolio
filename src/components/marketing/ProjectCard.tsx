import Link from "next/link";
import type { Project } from "@/lib/content";
import { SpotlightCard } from "@/components/marketing/SpotlightCard";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <SpotlightCard>
      <Link
        href={project.links.caseStudy || `/work/${project.slug}`}
        className="group flex flex-col gap-3 p-4 sm:gap-4 sm:p-6"
      >
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-serif text-xl font-normal tracking-tight transition-colors group-hover:text-accent">
            {project.title}
          </h3>
          <span className="shrink-0 text-sm text-muted-foreground">
            {project.year}
          </span>
        </div>

        <p className="text-sm text-muted-foreground">{project.tagline}</p>

        <p className="leading-relaxed text-muted-foreground">
          {project.description}
        </p>

        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-wrap gap-2">
            {project.tech.slice(0, 4).map((t) => (
              <span
                key={t}
                className="rounded-sm bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
          <span className="inline-flex items-center gap-1 text-xs text-accent transition-colors group-hover:text-foreground">
            Read case study
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
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
          </span>
        </div>
      </Link>
    </SpotlightCard>
  );
}
