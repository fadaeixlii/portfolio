export type Shot = {
  src: string;
  /** Intrinsic size of the file, so next/image never guesses. */
  width: number;
  height: number;
  alt: string;
  /**
   * `cover` crops to fill the card, which is right for a wide screenshot.
   * `contain` letterboxes instead — a portrait shot (a phone, an extension
   * panel) cropped to 16:10 shows a meaningless horizontal strip of its top
   * edge. Defaults to `cover`.
   */
  fit?: "cover" | "contain";
};

/**
 * Best existing screenshot per project, from the 47 already shot into
 * `public/images/projects/`. A project with no suitable shot is simply
 * absent here — no placeholder graphic, no fake browser chrome.
 *
 * One map, three readers: the home project rows, the work grid and the case
 * study. It used to be two maps that had already drifted apart by five
 * entries.
 */
export const SHOTS: Partial<Record<string, Shot>> = {
  aim2balance: {
    // Was platform-desktop.png — a real logged-in session (wallet balance,
    // account name, chat titles, usage stats). This is the public marketing
    // page instead; see docs/decisions.md.
    src: "/images/projects/aim2balance/landing.png",
    width: 1920,
    height: 1080,
    alt: "aim2balance marketing landing page",
  },
  "ai-cost-extension": {
    // The panel itself rather than a mockup: it is 378px wide in the browser,
    // so a laptop mockup would render it smaller than life and add furniture
    // that is not part of the product.
    src: "/images/projects/aim2balance/aim2balance_plugin.png",
    width: 378,
    height: 603,
    alt: "Browser extension panel breaking token cost down by AI platform",
    fit: "contain",
  },
  jeofferte: {
    src: "/images/projects/jeofferte/landing.png",
    width: 1920,
    height: 1080,
    alt: "Jeofferte marketplace landing page",
  },
  roofcast: {
    src: "/images/projects/roofcast/landing.png",
    width: 1920,
    height: 1080,
    alt: "Roofcast property prediction market trading screen",
  },
  meshi: {
    src: "/images/projects/meshi/landing.png",
    width: 1920,
    height: 1080,
    alt: "Meshi food-ordering landing page",
  },
  exmodules: {
    src: "/images/projects/dapp-solutions/login.png",
    width: 1920,
    height: 868,
    alt: "Exmodules property DApp wallet login screen",
  },
  "intex-exchange": {
    src: "/images/projects/intex-exchange/hero.png",
    width: 1920,
    height: 1080,
    alt: "Intex exchange trading dashboard with live charts",
  },
  "panikar-assessment": {
    src: "/images/projects/panikar-assessment/hero.png",
    width: 1920,
    height: 1080,
    alt: "Panikar assessment test interface",
  },
  "3gaam": {
    src: "/images/projects/3gaam/hero.png",
    width: 1920,
    height: 1080,
    alt: "3gaam study-resource platform interface",
  },
};

/**
 * Store and product shots that show a project running, beside the single
 * `SHOTS` hero. These are the publisher's own App Store and Play Store
 * assets — already composed, already public, and safe to publish in a way a
 * raw screenshot of a signed-in session is not.
 *
 * `aichat.png` is deliberately absent. It is a logged-in session: the
 * account name, the weekly balance, the personal usage summary and a
 * sidebar of real conversation titles including a client name and an
 * invoice reference. That is the same class of leak that took
 * `platform-desktop.png` out of `SHOTS`, and it is invisible to a text
 * audit. See docs/decisions.md.
 */
export const GALLERIES: Partial<Record<string, Shot[]>> = {
  aim2balance: [
    {
      src: "/images/projects/aim2balance/ios1.webp",
      width: 230,
      height: 498,
      alt: "aim2balance iOS app showing the environmental impact of a conversation",
    },
    {
      src: "/images/projects/aim2balance/ios2.webp",
      width: 230,
      height: 498,
      alt: "aim2balance iOS app chat screen",
    },
    {
      src: "/images/projects/aim2balance/android1.webp",
      width: 810,
      height: 1440,
      alt: "aim2balance Android app store listing screen",
    },
    {
      src: "/images/projects/aim2balance/android2.webp",
      width: 784,
      height: 1440,
      alt: "aim2balance Android app showing restoration contributions",
    },
  ],
  "ai-cost-extension": [
    {
      src: "/images/projects/aim2balance/aim2balance_plugin.png",
      width: 378,
      height: 603,
      alt: "Browser extension panel breaking token cost down by AI platform",
    },
  ],
  meshi: [
    {
      src: "/images/projects/meshi/IOS.webp",
      width: 230,
      height: 498,
      alt: "Meshi iOS app restaurant list",
    },
    {
      src: "/images/projects/meshi/IOS2.webp",
      width: 230,
      height: 498,
      alt: "Meshi iOS app order screen",
    },
    {
      src: "/images/projects/meshi/android1.webp",
      width: 720,
      height: 1280,
      alt: "Meshi Android app location prompt",
    },
    {
      src: "/images/projects/meshi/android2.webp",
      width: 720,
      height: 1280,
      alt: "Meshi Android app restaurant browsing screen",
    },
  ],
};
