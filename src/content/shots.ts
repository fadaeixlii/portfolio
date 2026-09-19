export type Shot = {
  src: string;
  /** Intrinsic size of the file, so next/image never guesses. */
  width: number;
  height: number;
  alt: string;
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
