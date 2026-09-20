"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Link, usePathname, useRouter } from "@/lib/i18n/navigation";
import { locales } from "@/lib/i18n/routing";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { cn } from "@/lib/cn";

/**
 * Tab icons, drawn as single stroked paths at 24x24 so they inherit
 * `currentColor` and need no icon dependency for five glyphs.
 */
const TABS = [
  { href: "/", key: "home", d: "M3 10.6 12 3.4l9 7.2V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" },
  { href: "/work", key: "work", d: "M3.5 3.5h7v7h-7zM13.5 3.5h7v7h-7zM3.5 13.5h7v7h-7zM13.5 13.5h7v7h-7z" },
  { href: "/experience", key: "experience", d: "M6 3v18M6 7h14M6 13h10M6 19h12" },
  { href: "/stack", key: "stack", d: "M12 3.2 3 8l9 4.8L21 8ZM3 14l9 4.8L21 14" },
  { href: "/schedule", key: "schedule", d: "M3.5 5h17v14h-17zM3.5 6.2 12 13l8.5-6.8" },
] as const;

const LANG_NAMES: Record<string, string> = {
  en: "English",
  de: "Deutsch",
  nl: "Nederlands",
  fa: "فارسی",
  el: "Ελληνικά",
};

/**
 * The mobile shell: a 56px header, a fixed five-tab bar on the bottom edge,
 * and a bottom sheet for language.
 *
 * It replaces the desktop nav below `lg` rather than restyling it. The nav
 * box wraps to two rows under ~420px and a dropdown inside a wrapped pill is
 * a poor target on a phone; tabs on the bottom edge are reachable with one
 * thumb and mark the current section without a hover state.
 */
export function MobileChrome() {
  const t = useTranslations("nav");
  const tHero = useTranslations("home.hero");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const current = params.locale as string;
  const [sheet, setSheet] = useState(false);

  // Escape closes it, as it would any dialog.
  useEffect(() => {
    if (!sheet) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSheet(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheet]);

  return (
    <div className="lg:hidden">
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-2 border-b-2 border-hairline bg-paper px-[var(--space-4)]">
        <Link href="/" className="flex min-w-0 items-center gap-[var(--space-3)]">
          <span
            aria-hidden
            className="flex size-[30px] shrink-0 items-center justify-center bg-signal-fill text-[length:12px] font-extrabold text-signal-ink"
          >
            MK
          </span>
          <span dir="auto" className="truncate text-[length:13px] font-extrabold text-text">
            {tHero("name")}
          </span>
        </Link>

        <div className="flex shrink-0 items-center">
          <button
            type="button"
            onClick={() => setSheet(true)}
            aria-haspopup="dialog"
            aria-expanded={sheet}
            aria-label={tCommon("selectLanguage")}
            className="h-11 min-w-[48px] border-2 border-hairline text-[length:11px] font-extrabold uppercase tracking-wide text-text"
          >
            {current.toUpperCase()}
          </button>
          <ThemeToggle className="h-11 min-w-[56px] border-2 border-s-0 border-hairline" />
        </div>
      </header>

      {sheet ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={tCommon("selectLanguage")}
          className="fixed inset-0 z-[60] flex items-end bg-[color-mix(in_oklab,var(--paper)_70%,transparent)]"
          onClick={() => setSheet(false)}
        >
          <div
            className="w-full border-t-2 border-hairline bg-surface pb-[env(safe-area-inset-bottom)]"
            onClick={(e) => e.stopPropagation()}
          >
            {locales.map((locale) => {
              const on = locale === current;
              return (
                <button
                  key={locale}
                  type="button"
                  dir={locale === "fa" ? "rtl" : "ltr"}
                  onClick={() => {
                    // Closed here rather than in an effect on `pathname`: the
                    // sheet covers the tab bar, so its own buttons are the
                    // only navigation that can happen while it is open.
                    setSheet(false);
                    router.replace(
                      // @ts-expect-error pathname is a validated route string
                      { pathname, params },
                      { locale },
                    );
                  }}
                  className={cn(
                    "flex min-h-[56px] w-full items-center justify-between border-b-2 border-hairline px-[var(--space-5)] text-start",
                    on ? "text-signal-text" : "text-text",
                  )}
                >
                  <span className="text-[length:var(--text-base)]">{LANG_NAMES[locale]}</span>
                  <span className="font-mono text-[length:11px] uppercase tracking-wide text-dim">
                    {locale}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <nav
        aria-label={t("home")}
        className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t-2 border-hairline bg-paper pb-[env(safe-area-inset-bottom)]"
      >
        {TABS.map(({ href, key, d }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-[60px] flex-col items-center justify-center gap-1 border-t-[3px] px-1 py-1.5",
                active ? "border-signal text-text" : "border-transparent text-dim",
              )}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="square"
                aria-hidden="true"
              >
                <path d={d} />
              </svg>
              <span className="text-center text-[length:9px] font-bold uppercase leading-none tracking-wide">
                {t(key)}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
