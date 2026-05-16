import { site } from "@/lib/content";

export function Footer() {
  return (
    <footer aria-label="Site footer" className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-6 font-mono text-[11px] text-muted-foreground sm:flex-row sm:justify-between sm:px-6 sm:py-8 md:px-12 lg:px-16">
        <span>© {new Date().getFullYear()} · {site.name}</span>
        <span>Edition {site.numbers.footerEdition} / Awwwards-grade portfolio</span>
        <span>Built with Next.js · MDX</span>
      </div>
    </footer>
  );
}
