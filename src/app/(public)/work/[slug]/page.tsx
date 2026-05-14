import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getCaseStudy,
  getAllCaseStudySlugs,
  getAdjacentCaseStudies,
} from "@/lib/mdx/case-studies";
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
    title: `${frontmatter.title} — Mohammad Fadaei`,
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

  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-16">
      <FadeIn>
        <CaseStudyHero frontmatter={frontmatter} />
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
            author: { "@type": "Person", name: "Mohammad Fadaei" },
            dateCreated: String(frontmatter.year),
            url: `https://fadaeixlii.com/work/${slug}`,
          }),
        }}
      />

      <CaseStudyNav prev={adjacent.prev} next={adjacent.next} />
    </article>
  );
}
