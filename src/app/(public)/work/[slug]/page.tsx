import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getCaseStudy,
  getAllCaseStudySlugs,
  getAdjacentCaseStudies,
} from "@/lib/mdx/case-studies";
import { getProjectBySlug } from "@/lib/content";
import { CaseStudyHero } from "@/components/marketing/CaseStudyHero";
import { CaseStudyNav } from "@/components/marketing/CaseStudyNav";
import { FadeIn } from "@/components/shared/FadeIn";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllCaseStudySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getCaseStudy(slug);
  if (!result) return {};

  const { frontmatter } = result;
  return {
    title: `${frontmatter.title} — Mohammad M Khani`,
    description: frontmatter.tagline,
    alternates: { canonical: `https://fadaeixlii.com/work/${slug}` },
    openGraph: {
      type: "article",
      title: frontmatter.title,
      description: frontmatter.tagline,
      url: `https://fadaeixlii.com/work/${slug}`,
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const result = await getCaseStudy(slug);
  if (!result) notFound();

  const { content, frontmatter } = result;
  const adjacent = await getAdjacentCaseStudies(slug);
  const liveUrl = getProjectBySlug(slug)?.links.live || undefined;

  return (
    <article className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-16 md:px-12 lg:px-16">
      <FadeIn>
        <CaseStudyHero frontmatter={frontmatter} liveUrl={liveUrl} />
      </FadeIn>

      <FadeIn delay={0.08}>
        <div className="mt-16">{content}</div>
      </FadeIn>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            name: frontmatter.title,
            description: frontmatter.tagline,
            author: { "@type": "Person", name: "Mohammad M Khani" },
            dateCreated: String(frontmatter.year),
            url: `https://fadaeixlii.com/work/${slug}`,
          }),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://fadaeixlii.com" },
              { "@type": "ListItem", position: 2, name: "Work", item: "https://fadaeixlii.com/work" },
              { "@type": "ListItem", position: 3, name: frontmatter.title, item: `https://fadaeixlii.com/work/${slug}` },
            ],
          }),
        }}
      />

      <CaseStudyNav prev={adjacent.prev} next={adjacent.next} />
    </article>
  );
}
