/**
 * Everything the shop sells and where it gets paid. Pure data, safe to
 * import from the client (the wallets and token contracts are public).
 *
 * One structure for every skill video's product, free or paid: a paid entry
 * has a price and a zip in `private/shop/`, sold through the crypto checkout;
 * a free entry has `free: true` and a PDF in `public/shop/<slug>/` that anyone
 * can download. Adding a product is one entry in SHOP_PRODUCTS plus its page
 * under `src/app/[locale]/skills/<slug>/`; the /skills list picks it up from
 * here (newest last in this object, first on the list).
 */

export type Chain = "eth" | "tron";
export type Token = "USDT" | "USDC";

type PaidProduct = {
  name: string;
  /** In stablecoin units (1 USDT = 1 USDC = 1 USD). */
  priceUsd: number;
  /** Shown beside the price only — never used for maths. */
  approxEur: number;
  /** Served from `private/shop/<file>`, never from `public/`. */
  file: string;
  /** Card image on /skills, a file under `public/`. */
  poster: string;
};

type FreeProduct = {
  name: string;
  free: true;
  /** Public URL path of the PDF (a file under `public/`). */
  pdf: string;
  /** Card image on /skills, a file under `public/`. */
  poster: string;
};

export const isFree = (product: PaidProduct | FreeProduct): product is FreeProduct => "free" in product;

export const SHOP_PRODUCTS = {
  "ink-motion": {
    name: "Ink Motion",
    priceUsd: 6,
    approxEur: 5,
    file: "ink-motion.zip",
    poster: "/shop/ink-motion/ferry.jpg",
  },
  "paper-trail": {
    name: "Paper Trail",
    priceUsd: 6,
    approxEur: 5,
    file: "paper-trail.zip",
    poster: "/shop/paper-trail/reel.jpg",
  },
  "lights-on": {
    name: "Lights On",
    priceUsd: 6,
    approxEur: 5,
    file: "lights-on.zip",
    poster: "/shop/lights-on/after-phone.webp",
  },
  "trail-reel": {
    name: "Trail Reel",
    priceUsd: 6,
    approxEur: 5,
    file: "trail-reel.zip",
    poster: "/shop/trail-reel/dolomites-atlas.jpg",
  },
  "one-folder-studio": {
    name: "One Folder Studio",
    priceUsd: 12,
    approxEur: 10,
    file: "one-folder-studio.zip",
    poster: "/shop/one-folder-studio/reel.jpg",
  },
  "first-skim": {
    name: "First Skim",
    priceUsd: 6,
    approxEur: 5,
    file: "first-skim.zip",
    poster: "/shop/first-skim/reel.jpg",
  },
  "motion-tips": {
    name: "4 Motion Tips for Claude Videos",
    free: true,
    pdf: "/shop/motion-tips/4-motion-tips.pdf",
    poster: "/shop/motion-tips/page-1.webp",
  },
} satisfies Record<string, PaidProduct | FreeProduct>;

export type ProductId = keyof typeof SHOP_PRODUCTS;
/** What the crypto checkout sells: passing it a free product does not compile. */
export type PaidProductId = {
  [K in ProductId]: (typeof SHOP_PRODUCTS)[K] extends FreeProduct ? never : K;
}[ProductId];

type ChainConfig = {
  /** Receiving wallet. Tron in base58, Ethereum in 0x hex. */
  wallet: string;
  /** Blocks on top of the payment's block before it counts. */
  minConfirmations: number;
  tokens: Partial<Record<Token, { contract: string; decimals: number }>>;
};

export const SHOP_CHAINS: Record<Chain, ChainConfig> = {
  eth: {
    wallet: "0x7f09CbbFcF4C4da5Af810734a5687Fb458c26fb3",
    minConfirmations: 6,
    tokens: {
      USDT: { contract: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6 },
      USDC: { contract: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
    },
  },
  tron: {
    wallet: "TMchjoJ4uSYekSrQea95jAfEJkhSPFhd3W",
    minConfirmations: 19,
    tokens: {
      USDT: { contract: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", decimals: 6 },
    },
  },
};

export const SHOP_RULES = {
  maxOrdersPerIpPerDay: 10,
  /** Buyers retry while confirmations land, so this is looser than orders. */
  maxVerifiesPerIpPerDay: 30,
  /** Visits + WhatsApp taps one visitor can log per day; reloads past it are ignored. */
  maxEventsPerVisitorPerDay: 20,
  /** Visit and WhatsApp alert emails per day. Resend's free plan sends 100 a
   *  day, and sale emails must still get through. */
  maxAlertEmailsPerDay: 50,
  maxDownloads: 5,
  downloadDays: 14,
  /** A payment may predate its order by this much (clock skew, or the buyer
   *  sending before pressing the button). Anything older is someone else's. */
  paymentBeforeOrderGraceMs: 10 * 60_000,
} as const;
