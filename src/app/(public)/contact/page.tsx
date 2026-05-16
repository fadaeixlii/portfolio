import type { Metadata } from "next";
import { ContactForm } from "@/components/marketing/ContactForm";
import { site } from "@/lib/content";
import { FadeIn } from "@/components/shared/FadeIn";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch for freelance projects, consulting, or collaboration opportunities.",
  alternates: { canonical: "https://fadaeixlii.com/contact" },
};

export default function ContactPage() {
  return (
    <section className="flex flex-1 flex-col items-center px-4 py-10 sm:px-6 sm:py-16 md:px-12 lg:px-16">
      <FadeIn>
        <div className="flex w-full max-w-2xl flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="font-serif text-4xl font-normal tracking-tight">
              {site.contact.heading}
            </h1>
            <p className="max-w-md text-lg text-muted-foreground">
              {site.contact.description}
            </p>
          </div>

          <ContactForm />
        </div>
      </FadeIn>
    </section>
  );
}
