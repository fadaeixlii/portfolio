import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/content";
import { SpotlightCard } from "@/components/marketing/SpotlightCard";
import { BrowserFrame } from "@/components/marketing/BrowserFrame";
import { PhoneFrame } from "@/components/marketing/PhoneFrame";
import { MockShot } from "@/components/marketing/MockShot";

interface ProjectCardProps {
  project: Project;
  index?: number;
  total?: number;
}

export function ProjectCard({ project, index = 0, total = 3 }: ProjectCardProps) {
  const href = project.links.caseStudy || `/work/${project.slug}`;
  const padIndex = `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
  const { hue = 50, pullQuote, duration, client, team, domain, kpis } = project;
  const mockType = project.mockType as "chat" | "analytics" | "commerce";

  return (
    <SpotlightCard className="overflow-hidden rounded-2xl">
      {/* ── Header row ── */}
      <header className="flex flex-wrap items-baseline gap-x-4 gap-y-2 border-b border-border px-5 pb-4 pt-5 sm:px-8">
        <span className="font-mono text-[11px] tracking-[0.05em] text-muted-foreground">
          {padIndex}
        </span>
        <h3 className="flex-1 font-serif text-xl font-normal tracking-tight sm:text-2xl">
          <Link href={href} className="transition-colors hover:text-accent">
            {project.title}
          </Link>
          {domain && (
            <span className="ml-2 text-base italic text-muted-foreground">
              — {domain}
            </span>
          )}
        </h3>
        <span
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]"
          style={{ color: project.status === "published" ? "var(--emerald)" : undefined }}
        >
          <span className="size-1.5 rounded-full" style={{ background: project.status === "published" ? "var(--emerald)" : "var(--color-muted-foreground)" }} />
          {project.status === "published" ? "live" : project.status}
        </span>
        <span className="font-mono text-[11px] text-muted-foreground">{project.year}</span>
      </header>

      {/* ── Body ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr]">
        {/* Left — content */}
        <div className="flex flex-col p-5 sm:p-8">
          {/* Pull quote */}
          {pullQuote && (
            <blockquote className="mb-5 border-l-2 border-accent/40 pl-4 font-serif text-[15px] leading-[1.5] tracking-[-0.005em] text-foreground/90">
              {pullQuote}
            </blockquote>
          )}

          <p className="text-[13px] leading-relaxed text-muted-foreground">
            {project.description}
          </p>

          {/* Metadata grid */}
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border pt-5">
            <MetaField label="Role" value={project.role} />
            {duration && <MetaField label="Duration" value={duration} />}
            {client && <MetaField label="Client" value={client} />}
            {team && <MetaField label="Team" value={team} />}
          </div>

          {/* Tech tags */}
          <div className="mt-5">
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
              Stack · {project.tech.length}
            </span>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="rounded border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="flex-1" />

          {/* CTA — single prominent button */}
          <div className="mt-8 flex items-center gap-3">
            <Link
              href={href}
              className="group/btn inline-flex items-center gap-3 rounded-lg bg-accent px-5 py-3 font-mono text-[12px] uppercase tracking-[0.08em] text-background transition-all duration-200 hover:bg-accent/90 hover:shadow-[0_4px_20px_oklch(0.64_0.09_65_/_0.25)]"
            >
              Read case study
              <span className="transition-transform duration-200 group-hover/btn:translate-x-0.5">→</span>
            </Link>
            {project.links.live && (
              <a
                href={project.links.live}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-3 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
              >
                Live <span className="text-[9px]">↗</span>
                <span className="sr-only"> (opens in new tab)</span>
              </a>
            )}
            {project.links.github && (
              <a
                href={project.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-3 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
              >
                GitHub <span className="text-[9px]">↗</span>
                <span className="sr-only"> (opens in new tab)</span>
              </a>
            )}
          </div>
        </div>

        {/* Right — screenshot or device mockups */}
        {(project.image || mockType) && (
          <div
            aria-hidden="true"
            className="hidden border-l border-border lg:block"
            style={{
              background: `radial-gradient(ellipse at 30% 20%, oklch(0.65 0.18 ${hue} / 0.08), transparent 60%), oklch(0.12 0.005 ${hue})`,
            }}
          >
            {project.image ? (
              <div className="flex h-full items-center justify-center p-6">
                <BrowserFrame url={domain} hue={hue}>
                  <Image
                    src={project.image}
                    alt={`${project.title} screenshot`}
                    width={800}
                    height={500}
                    sizes="(max-width: 1024px) 100vw, 480px"
                    className="h-auto w-full object-cover"
                  />
                </BrowserFrame>
              </div>
            ) : mockType ? (
              <div className="grid h-full grid-cols-[1fr_148px] items-center gap-4 p-6">
                <BrowserFrame url={domain} hue={hue}>
                  <MockShot type={mockType} variant="desktop" hue={hue} />
                </BrowserFrame>
                <div className="translate-y-4">
                  <PhoneFrame hue={hue}>
                    <MockShot type={mockType} variant="mobile" hue={hue} />
                  </PhoneFrame>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* ── KPI strip ── */}
      {kpis && kpis.length > 0 && (
        <div className="grid grid-cols-3 border-t border-border sm:grid-cols-none" style={{ gridTemplateColumns: `repeat(${kpis.length}, 1fr)` }}>
          {kpis.map((kpi, i) => (
            <div
              key={kpi.label}
              className={`flex flex-col gap-1 px-5 py-4 sm:px-8 ${i < kpis.length - 1 ? "border-r border-border" : ""}`}
            >
              <span className="font-serif text-lg leading-none tracking-tight sm:text-xl">
                {kpi.value}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                {kpi.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </SpotlightCard>
  );
}

function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      <p className="mt-1 text-[13px] text-foreground/80">{value}</p>
    </div>
  );
}
