import { use } from "react";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getProjects } from "@/content";
import { ProjectCard } from "@/components/work/ProjectCard";
import { PageHead } from "@/components/layout/PageHead";
import { Stagger, StaggerItem } from "@/components/primitives/Reveal";
import { buildMetadata } from "@/lib/seo/metadata";
import type { Locale } from "@/lib/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "work.index" });
  return buildMetadata({
    title: t("heading"),
    description: t("subheading"),
    path: "/work",
    locale: locale as Locale,
  });
}

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
      className="min-h-dvh px-[var(--space-6)] pt-[var(--shell-top)] pb-[var(--space-22)]"
    >
      <PageHead line1={t("line1")} line2={t("line2")} sub={t("subheading")} />

      <Stagger className="mt-[var(--space-22)] grid grid-cols-1 gap-[var(--space-4)] md:grid-cols-2">
        {projects.map((project) => (
          <StaggerItem key={project.slug}>
            <ProjectCard project={project} />
          </StaggerItem>
        ))}
      </Stagger>
    </main>
  );
}
