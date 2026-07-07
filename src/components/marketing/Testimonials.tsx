import { testimonials } from "@/lib/content";

export function Testimonials() {
  if (!testimonials.enabled) return null;
  const items = testimonials.items.filter((t) => t.quote?.trim());
  if (items.length === 0) return null;

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {items.map((t) => (
        <figure
          key={`${t.name}-${t.project}`}
          className="flex flex-col gap-4 rounded-lg border border-border p-6"
        >
          <blockquote className="font-serif text-lg italic leading-relaxed text-foreground/90">
            “{t.quote}”
          </blockquote>
          <figcaption className="mt-auto flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">{t.name}</span>
            {t.title && (
              <span className="text-xs leading-snug text-muted-foreground">
                {t.title}
              </span>
            )}
            {t.project && (
              <span className="mt-1 font-mono text-[10px] uppercase tracking-widest text-accent">
                {t.project}
              </span>
            )}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
