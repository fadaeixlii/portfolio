import { fontVariables } from "@/lib/fonts";
import "@/styles/globals.css";

/**
 * Document shell for the two route trees outside `[locale]` — `/admin` and
 * `/auth` — which the proxy matcher deliberately excludes from next-intl.
 * The real root layout (`src/app/layout.tsx`) is a pass-through, so
 * whichever tree renders owns the one `<html>`/`<body>` pair; `[locale]`'s
 * layout does that for the site, this does it for these two.
 *
 * No `ThemeProvider`: tokens.css's bare `:root` is already the dark theme,
 * so an internal tool with no light/dark toggle needs nothing else here.
 */
export function UnlocalisedShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
