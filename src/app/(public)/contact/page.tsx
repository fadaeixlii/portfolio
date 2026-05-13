import type { Metadata } from "next";
import { ContactForm } from "@/components/marketing/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch for freelance projects, consulting, or collaboration opportunities.",
  alternates: { canonical: "https://fadaeixlii.com/contact" },
};

export default function ContactPage() {
  return (
    <section className="flex flex-1 flex-col items-center px-6 py-16">
      <div className="flex w-full max-w-2xl flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="font-serif text-4xl font-normal tracking-tight">
            Get in touch
          </h1>
          <p className="max-w-md text-lg text-muted-foreground">
            Have a project in mind? Send me a message and I&apos;ll get back to
            you within 48 hours.
          </p>
        </div>

        <ContactForm />
      </div>
    </section>
  );
}
