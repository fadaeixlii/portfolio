"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import { locales } from "@/lib/i18n/routing";

const LABELS: Record<string, string> = {
  en: "EN",
  de: "DE",
  nl: "NL",
  fa: "فا",
  el: "EL",
};

export function LocaleSwitch() {
  const t = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  return (
    <label className="flex items-center gap-2">
      <span className="sr-only">{t("selectLanguage")}</span>
      <select
        value={params.locale as string}
        onChange={(e) =>
          router.replace(
            // @ts-expect-error pathname is a validated route string
            { pathname, params },
            { locale: e.target.value },
          )
        }
        className="bg-transparent font-mono text-xs text-dim focus-visible:text-text"
      >
        {locales.map((l) => (
          <option key={l} value={l}>
            {LABELS[l]}
          </option>
        ))}
      </select>
    </label>
  );
}
