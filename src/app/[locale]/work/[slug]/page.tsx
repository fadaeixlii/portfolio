import { use } from "react";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getProject, getProjects, getCaseStudy } from "@/content";
import { routing } from "@/lib/i18n/routing";
import { CaseStudyLayout } from "@/components/work/CaseStudyLayout";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getProjects().map((project) => ({ locale, slug: project.slug })),
  );
}

export default function WorkSlugPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = use(params);
  setRequestLocale(locale);

  const project = getProject(slug);
  const caseStudy = getCaseStudy(slug);
  if (!project || !caseStudy) notFound();

  return (
    <main id="main" className="min-h-dvh">
      <CaseStudyLayout project={project} caseStudy={caseStudy} />
    </main>
  );
}
