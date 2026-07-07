import { FadeIn } from "@/components/shared/FadeIn";
import type { Experience } from "@/lib/content";

interface ExperienceTimelineProps {
  entries: Experience[];
}

export function ExperienceTimeline({ entries }: ExperienceTimelineProps) {
  return (
    <div>
      <ol className="relative m-0 list-none p-0">
        {/* Vertical rail */}
        <div
          className="absolute left-0 top-2 bottom-2 w-px"
          style={{ background: "color-mix(in oklch, var(--accent) 30%, transparent)" }}
        />

        {entries.map((job, i) => {
          const isCurrent = i === 0;
          const highlights = (job as Record<string, unknown>).highlights as
            | string[] | undefined;
          const type = (job as Record<string, unknown>).type as string | undefined;

          return (
            <FadeIn key={i} delay={Math.min(i * 0.05, 0.3)}>
              <li
                className="relative pl-12"
                style={{ paddingBottom: i < entries.length - 1 ? 64 : 0 }}
              >
                {/* Node */}
                <span
                  className="absolute -left-1.25 top-3 size-2.75 rounded-full border-[1.5px] border-accent"
                  style={{
                    background: isCurrent ? "var(--accent)" : "var(--background)",
                    boxShadow: isCurrent ? "0 0 0 4px oklch(0.65 0.18 50 / 0.15)" : "none",
                  }}
                />

                {/* Header row: period | role | type */}
                <div className="mb-4 grid items-baseline gap-4 sm:grid-cols-[200px_1fr_auto] sm:gap-6">
                  <span
                    className="font-mono text-[11px] uppercase tracking-[0.16em]"
                    style={{ color: isCurrent ? "var(--accent)" : undefined }}
                  >
                    {job.period}
                  </span>
                  <span className="font-serif text-xl tracking-[-0.005em] leading-tight">
                    {job.role}
                  </span>
                  {type && (
                    <span className="rounded-full border border-border-strong px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      {type}
                    </span>
                  )}
                </div>

                {/* Body: company/location | description + highlights */}
                <div className="grid gap-4 sm:grid-cols-[200px_1fr] sm:gap-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[13px] text-foreground">{job.company}</span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {job.location}
                    </span>
                  </div>

                  <div>
                    <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                      {job.description}
                    </p>

                    {/* Highlights */}
                    {highlights && highlights.length > 0 && (
                      <ul className="mt-5 flex flex-col gap-2 p-0">
                        {highlights.map((h, j) => (
                          <li
                            key={j}
                            className="grid grid-cols-[24px_1fr] gap-2 text-sm leading-normal"
                          >
                            <span className="font-mono text-[11px] text-accent">↳</span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Tech tags */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {job.tech.map((t) => (
                        <span
                          key={t}
                          className="rounded-sm bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </li>
            </FadeIn>
          );
        })}
      </ol>

      {/* Resume link — hidden until PDF is available */}
    </div>
  );
}
