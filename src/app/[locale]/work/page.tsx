import { use } from "react";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { getProjects } from "@/content";
import { ProjectCard } from "@/components/work/ProjectCard";
import { Stagger, StaggerItem } from "@/components/primitives/Reveal";

export default function WorkIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const t = useTranslations("work.index");
  const projects = getProjects();

  return (
    <main
      id="main"
      className="mx-auto min-h-dvh max-w-5xl px-[var(--space-6)] pt-[var(--space-32)] pb-[var(--space-24)]"
    >
      <h1 className="font-display text-[length:var(--text-4xl)] leading-[var(--leading-tight)]">
        {t("heading")}
      </h1>
      <p className="mt-[var(--space-4)] max-w-[var(--measure)] text-dim">
        {t("subheading")}
      </p>

      <Stagger className="mt-[var(--space-8)] grid grid-cols-1 gap-[var(--space-4)] md:grid-cols-2">
        {projects.map((project) => (
          <StaggerItem key={project.slug}>
            <ProjectCard project={project} />
          </StaggerItem>
        ))}
      </Stagger>
    </main>
  );
}
