"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { Surface } from "@/components/primitives/Surface";
import { Hairline } from "@/components/primitives/Hairline";
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
 * A bordered box, not a floating pill: 2px rule, flat --surface fill,
 * uppercase links. Small on purpose — a full-width header over a scrolling
 * page is the worst case for layout, blurred or not.
 */
export function NavPill() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <Surface
        as="nav"
        variant="flat"
        aria-label={t("home")}
        className="pointer-events-auto flex max-w-[calc(100vw-2rem)] flex-wrap items-center justify-center gap-x-1 gap-y-2 px-3 py-2"
      >
        {ROUTES.map(({ href, key }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "px-3 py-1.5",
                "text-[length:11px] font-semibold uppercase tracking-wide whitespace-nowrap",
                "transition-[color] duration-[var(--dur-fast)]",
                active ? "text-text" : "text-dim hover:text-text",
              )}
            >
              {t(key)}
            </Link>
          );
        })}

        <Link
          href="/schedule"
          className={cn(
            "bg-signal px-4 py-1.5",
            "text-[length:11px] font-semibold uppercase tracking-wide whitespace-nowrap text-signal-ink",
            "transition-[filter] duration-[var(--dur-fast)] hover:brightness-110",
          )}
        >
          {t("schedule")}
        </Link>

        <Hairline orientation="vertical" className="mx-1 h-5" />

        <LocaleSwitch />
        <ThemeToggle />
      </Surface>
    </div>
  );
}
