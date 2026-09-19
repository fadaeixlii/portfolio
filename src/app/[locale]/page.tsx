import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LocaleSwitch } from "@/components/layout/LocaleSwitch";

export default function HomePage() {
  const t = useTranslations("nav");

  return (
    <main id="main" className="min-h-dvh p-8">
      <header className="flex items-center justify-between">
        <span className="font-mono text-xs text-dim">v2 · foundation</span>
        <div className="flex items-center gap-4">
          <LocaleSwitch />
          <ThemeToggle />
        </div>
      </header>
      <h1 className="mt-24 text-[length:var(--text-display)] tracking-[var(--tracking-display)] leading-[var(--leading-display)]">
        {t("home")}
      </h1>
    </main>
  );
}
