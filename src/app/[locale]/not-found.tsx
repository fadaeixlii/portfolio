import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";

// Rendered inside [locale]/layout.tsx, so it inherits <html lang dir>,
// the fonts and the theme — unlike the root not-found.tsx.
export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <main id="main" className="grid min-h-dvh place-items-center p-8 text-center">
      <div>
        <h1 className="text-[length:var(--text-3xl)]">{t("heading")}</h1>
        <p className="mt-4 text-dim">{t("body")}</p>
        <Link
          href="/"
          className="mt-8 inline-block text-signal underline-offset-4 hover:underline"
        >
          {t("home")}
        </Link>
      </div>
    </main>
  );
}
