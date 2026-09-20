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
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 hidden justify-center px-4 lg:flex">
      <Surface
        as="nav"
        variant="flat"
        aria-label={t("home")}
        /* 2px of padding, and every child stretches to the full inner
           height. The CTA used to sit inside the nav's own py-2, which left
           it floating in a band of surface rather than reading as part of
           the bar. */
        className="pointer-events-auto flex max-w-[calc(100vw-2rem)] items-stretch justify-center p-[2px]"
      >
        {ROUTES.map(({ href, key }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center px-[13px] py-[9px]",
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
            // Stretches edge to edge inside the 2px padding rather than
            // keeping its own vertical inset.
            "flex items-center self-stretch bg-signal-fill px-[13px]",
            "text-[length:11px] font-semibold uppercase tracking-wide whitespace-nowrap text-signal-ink",
            "transition-[filter] duration-[var(--dur-fast)] hover:brightness-110",
          )}
        >
          {t("schedule")}
        </Link>

        {/* Full height, not a centred 20px stub: a fixed-height rule inside
            a stretched row never lines up with the items either side of it. */}
        <Hairline orientation="vertical" className="mx-[6px] self-stretch" />

        <div className="flex items-center">
          <LocaleSwitch />
        </div>
        <ThemeToggle className="grid size-9 place-items-center self-stretch" />
      </Surface>
    </div>
  );
}
