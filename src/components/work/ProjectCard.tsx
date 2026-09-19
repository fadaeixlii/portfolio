"use client";
// `Surface`'s `as={Link}` passes a component reference as a prop, which an
// RSC boundary cannot serialize from a Server Component into a Client
// Component. Declaring this component client-side keeps it in the same
// client tree as `Surface` and `Link`, so the reference passes through.

import { Surface } from "@/components/primitives/Surface";
import { Link } from "@/lib/i18n/navigation";
import type { Project } from "@/content/schema";

/**
 * `variant="flat"` rather than the glass default: the summary is body-ish
 * copy, which glass surfaces must not carry, and a grid of nine repeated
 * blurred cards is the worst case for backdrop-filter cost.
 */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <Surface
      as={Link}
      href={`/work/${project.slug}`}
      variant="flat"
      className="flex h-full flex-col gap-[var(--space-3)] p-[var(--space-6)] transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] hover:-translate-y-0.5"
    >
      <h3 className="font-display text-[length:var(--text-xl)] text-text">
        {project.name}
      </h3>
      <p className="line-clamp-2 text-[length:var(--text-sm)] text-dim">
        {project.summary}
      </p>
      <div className="mt-auto flex flex-wrap items-center gap-[var(--space-3)] text-[length:var(--text-sm)] text-dim">
        <span>{project.year}</span>
        <span>{project.domain}</span>
      </div>
      <div className="flex flex-wrap gap-[var(--space-2)] text-[length:var(--text-xs)] text-dim">
        {project.stack.slice(0, 4).map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </Surface>
  );
}
