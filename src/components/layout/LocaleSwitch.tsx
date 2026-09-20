"use client";

import * as Select from "@radix-ui/react-select";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import { locales } from "@/lib/i18n/routing";

/**
 * Full language names, not two-letter codes. "EL" means nothing to a Greek
 * reader and "FA" means nothing to a Persian one; each language names itself
 * the way its own speakers write it.
 */
const LABELS: Record<string, { short: string; full: string }> = {
  en: { short: "EN", full: "English" },
  de: { short: "DE", full: "Deutsch" },
  nl: { short: "NL", full: "Nederlands" },
  fa: { short: "فا", full: "فارسی" },
  el: { short: "EL", full: "Ελληνικά" },
};

/**
 * A native `<select>` renders its popup as an OS widget that no stylesheet
 * can reach — a white list with rounded corners and a system scrollbar, in
 * the middle of a square-cornered dark page. Radix renders the list as real
 * DOM, so it takes the design's tokens, while keeping the listbox semantics,
 * typeahead, arrow-key navigation and focus return that a hand-built
 * dropdown usually loses.
 */
export function LocaleSwitch() {
  const t = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const current = params.locale as string;

  return (
    <Select.Root
      value={current}
      onValueChange={(next) =>
        router.replace(
          // @ts-expect-error pathname is a validated route string
          { pathname, params },
          { locale: next },
        )
      }
    >
      <Select.Trigger
        aria-label={t("selectLanguage")}
        className="group flex items-center gap-1 px-1 font-mono text-xs uppercase text-dim transition-[color] duration-[var(--dur-fast)] hover:text-text focus-visible:text-text data-[state=open]:text-text"
      >
        {/* The trigger stays a short code so the nav does not reflow when
            the language changes; the full name lives in the list. */}
        <Select.Value>{LABELS[current]?.short ?? current.toUpperCase()}</Select.Value>
        <Select.Icon>
          <svg
            viewBox="0 0 10 6"
            aria-hidden="true"
            className="h-[5px] w-[9px] transition-transform duration-[var(--dur-fast)] group-data-[state=open]:rotate-180"
          >
            <path d="M0 0 L5 6 L10 0 Z" fill="currentColor" />
          </svg>
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={8}
          className="z-50 min-w-[var(--radix-select-trigger-width)] border-2 border-hairline bg-surface shadow-[var(--glass-shadow)]"
        >
          <Select.Viewport>
            {locales.map((locale) => (
              <Select.Item
                key={locale}
                value={locale}
                dir={locale === "fa" ? "rtl" : "ltr"}
                className="flex cursor-pointer select-none items-center justify-between gap-[var(--space-4)] px-[var(--space-3)] py-[var(--space-2)] text-[length:var(--text-sm)] text-dim outline-none data-[highlighted]:bg-paper data-[highlighted]:text-text data-[state=checked]:text-signal-text"
              >
                <Select.ItemText>{LABELS[locale].full}</Select.ItemText>
                <span className="font-mono text-[length:11px] uppercase opacity-70">
                  {LABELS[locale].short}
                </span>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
