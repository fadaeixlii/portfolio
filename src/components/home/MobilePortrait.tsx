import Image from "next/image";
import { getTranslations } from "next-intl/server";

/**
 * The portrait as the first thing on the phone: full-bleed, 4:5, with the
 * availability strip sitting on its bottom inline-start corner.
 *
 * The desktop identity card does not survive the narrow viewport — a 320px
 * bordered box stacked under the content is a card nobody scrolls to. Here
 * the face is the opening, and the name and role it used to carry live in
 * the mobile header and the hero respectively.
 *
 * Bleeds past the page gutter with negative inline margins so the image
 * meets both screen edges while the copy below keeps its measure.
 */
export async function MobilePortrait() {
  const s = await getTranslations("sidebar");

  return (
    <div className="relative -mx-[var(--space-6)] mb-[var(--space-8)] aspect-[4/5] w-[calc(100%+2*var(--space-6))] overflow-hidden border-b-2 border-hairline lg:hidden">
      <Image
        src="/images/portrait.jpg"
        alt=""
        fill
        // The block is `lg:hidden`, so above lg it is laid out at zero width
        // and next/image warns that 100vw overstates it. Bounding the hint at
        // the breakpoint tells the truth for both cases.
        sizes="(min-width: 1024px) 1px, 100vw"
        className="object-cover [filter:var(--portrait)]"
        priority
      />
      <p className="absolute bottom-0 start-0 flex items-center gap-[var(--space-2)] bg-signal-fill px-[var(--space-4)] py-[var(--space-3)] text-signal-ink">
        <span aria-hidden className="size-[7px] shrink-0 bg-signal-ink" />
        <span
          dir="auto"
          className="text-[length:10px] font-extrabold uppercase tracking-[0.14em]"
        >
          {s("available")}
        </span>
      </p>
    </div>
  );
}
