/**
 * Everything the shop sells and where it gets paid. Pure data, safe to
 * import from the client (the wallets and token contracts are public).
 *
 * Adding a product is one entry in SHOP_PRODUCTS plus its zip in
 * `private/shop/`.
 */

export type Chain = "eth" | "tron";
export type Token = "USDT" | "USDC";

export const SHOP_PRODUCTS = {
  "ink-motion": {
    name: "Ink Motion",
    /** In stablecoin units (1 USDT = 1 USDC = 1 USD). */
    priceUsd: 6,
    /** Shown beside the price only — never used for maths. */
    approxEur: 5,
    /** Served from `private/shop/<file>`, never from `public/`. */
    file: "ink-motion.zip",
  },
  "paper-trail": {
    name: "Paper Trail",
    priceUsd: 6,
    approxEur: 5,
    file: "paper-trail.zip",
  },
  "lights-on": {
    name: "Lights On",
    priceUsd: 6,
    approxEur: 5,
    file: "lights-on.zip",
  },
} satisfies Record<string, { name: string; priceUsd: number; approxEur: number; file: string }>;

export type ProductId = keyof typeof SHOP_PRODUCTS;

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
