import Image from "next/image";
import { useTranslations } from "next-intl";

const LINKS = [
  { href: "https://github.com/fadaeixlii", label: "GitHub" },
  { href: "https://www.linkedin.com/in/mohammadmkh/", label: "LinkedIn" },
] as const;

const EMAIL = "mmohammadkhani408@gmail.com";

/**
 * The identity column. Sticky beside the content on wide viewports, stacked
 * under it below `lg` — DOM order is content-then-aside so the reading and
 * tab order never depends on the breakpoint; `order` does the visual swap.
 *
 * Sticky only works here because the flex parent sets `items-start`: a
 * stretched flex item is already as tall as its container and has nowhere
 * to stick to. The top offset is a margin rather than padding, or
 * the offset would sit inside the sticky box and the column would start
 * out already pinned.
 */
export function SiteAside() {
  const t = useTranslations("home.hero");
  const s = useTranslations("sidebar");

  return (
    <aside className="order-2 w-full min-w-0 px-[var(--space-6)] pb-[var(--space-22)] lg:sticky lg:top-[86px] lg:order-1 lg:mt-[var(--space-32)] lg:w-auto lg:max-w-[320px] lg:flex-[0_1_320px]">
      <div className="mx-auto flex max-w-[320px] flex-col gap-[var(--space-4)] border-2 border-hairline bg-surface p-[var(--space-4)]">
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          <Image
            src="/images/portrait.jpg"
            alt=""
            fill
            sizes="288px"
            className="object-cover [filter:var(--portrait)]"
            priority
          />
        </div>

        {/* `items-start` plus the nudge, not `items-center`: the label wraps to
            two lines in every locale, and centring floats the dot into the gap
            between them instead of marking the first line. */}
        <p className="flex items-start gap-[var(--space-2)] text-[length:var(--text-xs)] font-semibold uppercase tracking-wide text-dim">
          <span
            aria-hidden
            className="mt-[0.45em] size-2 shrink-0 rounded-[var(--radius-full)] bg-signal"
          />
          <span dir="auto">{s("available")}</span>
        </p>

        <div className="flex flex-col gap-1">
          <p
            dir="auto"
            className="font-display text-[length:var(--text-xl)] font-extrabold uppercase leading-[var(--leading-tight)] tracking-[var(--tracking-display)] text-text"
          >
            {t("name")}
          </p>
          <p dir="auto" className="text-[length:var(--text-sm)] text-dim">
            {t("role")}
          </p>
          <p dir="auto" className="text-[length:var(--text-sm)] text-dim">
            {t("location")}
          </p>
        </div>

        <div className="flex flex-col gap-2 border-t-2 border-hairline pt-[var(--space-4)]">
          {LINKS.map(({ href, label }) => (
            <a
              key={label}
              href={href}
              className="text-[length:12px] font-semibold uppercase tracking-wide text-dim transition-[color] duration-[var(--dur-fast)] hover:text-text"
            >
              {label}
            </a>
          ))}
          <a
            href={`mailto:${EMAIL}`}
            className="text-[length:12px] font-semibold uppercase tracking-wide text-dim transition-[color] duration-[var(--dur-fast)] hover:text-text"
          >
            {s("email")}
          </a>
        </div>
      </div>
    </aside>
  );
}
