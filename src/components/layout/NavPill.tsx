"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { Surface } from "@/components/primitives/Surface";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LocaleSwitch } from "@/components/layout/LocaleSwitch";
import { cn } from "@/lib/cn";

const ROUTES = [
  { href: "/", key: "home" },
  { href: "/work", key: "work" },
  { href: "/experience", key: "experience" },
  { href: "/stack", key: "stack" },
] as const;

/**
 * N5 floating pill. Small on purpose: backdrop blur costs scale with area,
 * and a full-width blurred header over a scrolling page is the worst case.
 */
export function NavPill() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <Surface
        as="nav"
        variant="glass-refracted"
        aria-label={t("home")}
        className="pointer-events-auto flex items-center gap-1 rounded-[var(--radius-full)] px-2 py-2"
      >
        {ROUTES.map(({ href, key }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-[var(--radius-full)] px-3 py-1.5",
                "text-[length:var(--text-sm)] whitespace-nowrap",
                "transition-colors duration-[var(--dur-fast)]",
                active ? "bg-surface-raised text-text" : "text-dim hover:text-text",
              )}
            >
              {t(key)}
            </Link>
          );
        })}

        <span className="mx-1 h-5 w-px bg-hairline" aria-hidden />

        <Link
          href="/schedule"
          className={cn(
            "rounded-[var(--radius-full)] bg-signal px-4 py-1.5",
            "text-[length:var(--text-sm)] whitespace-nowrap text-signal-ink",
            "transition-[filter] duration-[var(--dur-fast)] hover:brightness-110",
          )}
        >
          {t("schedule")}
        </Link>

        <LocaleSwitch />
        <ThemeToggle />
      </Surface>
    </div>
  );
}
