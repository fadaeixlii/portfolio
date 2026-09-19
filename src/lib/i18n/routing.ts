import { defineRouting } from "next-intl/routing";

export const locales = ["en", "de", "nl", "fa", "el"] as const;
export type Locale = (typeof locales)[number];

/** Right-to-left locales. Drives the html dir attribute and icon mirroring. */
const RTL: ReadonlySet<string> = new Set(["fa"]);

export function isRtl(locale: string): boolean {
  return RTL.has(locale);
}

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  localePrefix: "always",
});
