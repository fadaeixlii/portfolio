import Image from "next/image";
import { useFormatter, useTranslations } from "next-intl";
import { PageHead } from "@/components/layout/PageHead";
import { Stagger, StaggerItem } from "@/components/primitives/Reveal";
import { Link } from "@/lib/i18n/navigation";
import { SHOP_PRODUCTS, isFree, type ProductId } from "@/content/shop";
import { cn } from "@/lib/cn";

export const PER_PAGE = 6;
/** Newest first: products are added at the end of SHOP_PRODUCTS. */
const IDS = (Object.keys(SHOP_PRODUCTS) as ProductId[]).reverse();
export const PAGES = Math.ceil(IDS.length / PER_PAGE);
const pageHref = (n: number) => (n === 1 ? "/skills" : `/skills/page/${n}`);
/** "one-folder-studio" -> "oneFolderStudio": each product page's message namespace. */
const ns = (id: string) => id.replace(/-(\w)/g, (_, c: string) => c.toUpperCase());

const CELL =
  "flex min-h-11 min-w-11 items-center justify-center border-2 px-[13px] text-[length:11px] font-semibold uppercase tracking-wide whitespace-nowrap transition-[color,border-color] duration-[var(--dur-fast)]";

/**
 * Every skill and free guide, paid or free, as the work grid's cards: a 4:5
 * frame from the product's own result, name, price or "Free", one line of what
 * it does. Paged at PER_PAGE so the list stays one screen of choices as it grows.
 */
export function SkillsList({ page }: { page: number }) {
  const t = useTranslations();
  const format = useFormatter();
  const ids = IDS.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <main
      id="main"
      className="min-h-dvh px-[var(--space-6)] pt-[var(--shell-top)] pb-[var(--space-22)]"
    >
      <PageHead line1={t("skills.line1")} line2={t("skills.line2")} sub={t("skills.sub")} />

      <Stagger className="mt-[var(--space-22)] grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 xl:grid-cols-3">
        {ids.map((id) => {
          const product = SHOP_PRODUCTS[id];
          const free = isFree(product);
          return (
            <StaggerItem key={id}>
              <Link
                href={`/skills/${id}`}
                className="group flex h-full flex-col border-2 border-hairline transition-[border-color] duration-[var(--dur-fast)] hover:border-signal"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden border-b-2 border-hairline bg-surface">
                  <Image
                    src={product.poster}
                    alt=""
                    fill
                    sizes="(min-width: 1280px) 340px, (min-width: 640px) 45vw, 100vw"
                    className="object-cover object-top"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-[var(--space-3)] p-[var(--space-6)]">
                  <div className="flex flex-wrap items-baseline justify-between gap-[var(--space-3)]">
                    <h2
                      dir="auto"
                      className="font-display text-[length:var(--text-xl)] font-extrabold uppercase leading-[var(--leading-tight)] tracking-[var(--tracking-display)] text-text"
                    >
                      {t(`${ns(id)}.line1`)}
                    </h2>
                    <span
                      className={cn(
                        "font-mono text-[length:var(--text-sm)] font-semibold uppercase tabular-nums",
                        free ? "text-signal-text" : "text-dim",
                      )}
                    >
                      {free
                        ? t("skills.free")
                        : format.number(product.approxEur, { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <p dir="auto" className="line-clamp-3 text-[length:var(--text-sm)] text-dim">
                    {t(`${ns(id)}.sub`)}
                  </p>
                </div>
              </Link>
            </StaggerItem>
          );
        })}
      </Stagger>

      {PAGES > 1 ? (
        <nav aria-label={t("skills.pagination")} className="mt-[var(--space-12)] flex flex-wrap gap-[var(--space-2)]">
          {page > 1 ? (
            <Link href={pageHref(page - 1)} rel="prev" className={cn(CELL, "border-hairline text-dim hover:border-signal hover:text-text")}>
              {t("skills.previous")}
            </Link>
          ) : null}
          {Array.from({ length: PAGES }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={pageHref(n)}
              aria-label={t("skills.page", { n })}
              aria-current={n === page ? "page" : undefined}
              className={cn(
                CELL,
                n === page
                  ? "border-signal bg-signal-fill text-signal-ink"
                  : "border-hairline text-dim hover:border-signal hover:text-text",
              )}
            >
              {format.number(n)}
            </Link>
          ))}
          {page < PAGES ? (
            <Link href={pageHref(page + 1)} rel="next" className={cn(CELL, "border-hairline text-dim hover:border-signal hover:text-text")}>
              {t("skills.next")}
            </Link>
          ) : null}
        </nav>
      ) : null}
    </main>
  );
}
