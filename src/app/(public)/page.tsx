import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroAnimation } from "@/components/marketing/HeroAnimation";

export const metadata: Metadata = {
  title: "Mohammad Fadaei — Full-Stack Developer",
  description:
    "Senior full-stack developer building web applications with React, Next.js, and TypeScript. Based in the Netherlands.",
  openGraph: {
    type: "website",
    url: "https://fadaeixlii.com",
    title: "Mohammad Fadaei — Full-Stack Developer",
    description:
      "Senior full-stack developer building web applications with React, Next.js, and TypeScript.",
  },
  twitter: { card: "summary_large_image" },
};

export default function HomePage() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <HeroAnimation headline="I build web applications that handle real users and real money.">
        <p className="max-w-md text-lg text-muted-foreground">
          Full-stack developer. React, Next.js, TypeScript.
          <br />
          Based in the Netherlands.
        </p>

        <Button render={<Link href="/contact" />} size="lg">
          Get in touch
        </Button>
      </HeroAnimation>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: "Mohammad Fadaei",
            url: "https://fadaeixlii.com",
            jobTitle: "Senior Full-Stack Developer",
            knowsAbout: ["React", "Next.js", "TypeScript", "Node.js"],
            sameAs: ["https://github.com/fadaeixlii"],
          }),
        }}
      />
    </section>
  );
}
