import Image from "next/image";
import { SHOTS } from "@/content/shots";
import { StackChip } from "@/components/stack/StackChip";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/cn";
import type { Project } from "@/content/schema";

/**
 * A work-grid card: 16:10 screenshot, name, year, one-line tagline, the
 * first four stack entries. Sharp corners and a 2px rule, no glass — a grid
 * of nine blurred cards is the worst case for backdrop-filter, and the
 * tagline is body copy, which never goes on glass.
 */
export function ProjectCard({ project }: { project: Project }) {
  const shot = SHOTS[project.slug];

  return (
    <Link
      href={`/work/${project.slug}`}
      className="group flex h-full flex-col border-2 border-hairline transition-[border-color] duration-[var(--dur-fast)] hover:border-signal"
    >
      {shot ? (
        <div
          className={cn(
            "relative aspect-[16/10] w-full overflow-hidden border-b-2 border-hairline",
            // A letterboxed portrait needs something behind it; a cropped
            // wide shot fills its box and never shows the backdrop.
            shot.fit === "contain" && "bg-surface",
          )}
        >
          <Image
            src={shot.src}
            alt=""
            fill
            sizes="(min-width: 768px) 420px, 100vw"
            className={cn(
              "[filter:var(--shot)]",
              shot.fit === "contain" ? "object-contain p-[var(--space-3)]" : "object-cover object-top",
            )}
          />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col gap-[var(--space-3)] p-[var(--space-6)]">
        <div className="flex flex-wrap items-baseline justify-between gap-[var(--space-3)]">
          <h3
            dir="auto"
            className="font-display text-[length:var(--text-xl)] font-extrabold uppercase leading-[var(--leading-tight)] tracking-[var(--tracking-display)] text-text"
          >
            {project.name}
          </h3>
          <span className="font-mono text-[length:var(--text-sm)] tabular-nums text-dim">
            {project.year}
          </span>
        </div>

        <p
          dir="auto"
          className="line-clamp-2 text-[length:var(--text-sm)] text-dim"
        >
          {project.summary}
        </p>

        <div className="mt-auto flex flex-wrap gap-[var(--space-2)] pt-[var(--space-3)]">
          {project.stack.slice(0, 4).map((item) => (
            <StackChip key={item} name={item} size="sm" />
          ))}
        </div>
      </div>
    </Link>
  );
}
