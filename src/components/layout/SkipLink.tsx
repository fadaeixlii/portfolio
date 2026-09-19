import { useTranslations } from "next-intl";

export function SkipLink() {
  const t = useTranslations("common");
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[60] focus:rounded-[var(--radius-md)] focus:bg-signal focus:px-4 focus:py-2 focus:text-signal-ink"
    >
      {t("skipToContent")}
    </a>
  );
}
