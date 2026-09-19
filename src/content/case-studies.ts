import { z } from "zod";
import type { caseStudySchema } from "./schema";

/** One per project, slugs match `projects.ts`. `figures` stays empty unless a number has a source. */
export const caseStudies: z.input<typeof caseStudySchema>[] = [
  {
    slug: "aim2balance",
    problem:
      "European teams wanted one AI chat tool that kept their data in the EU and showed what each answer cost the planet.",
    approach: [
      "Forked LibreChat and rehosted the stack on EU infrastructure so no chat left the region.",
      "Put a LiteLLM gateway in front of three EU model providers behind one OpenAI-compatible API, with fallback when a provider went down.",
      "Rewrote each provider's token price into one internal cost unit, so the wallet billed every model without a per-model rate table.",
      "Metered energy, water and CO2 per request with EcoLogits formulas and folded the reforestation fee into the price.",
      "Built the EUR billing backend with Stripe wallet top-ups that recharge exactly once.",
    ],
    outcome:
      "The service ran in production with billing, agents and environmental metering in one system.",
    figures: [{ value: "3", label: "EU model providers" }],
  },
  {
    slug: "ai-cost-extension",
    problem:
      "People using ChatGPT, Claude or Gemini had no idea what a conversation cost in energy or water.",
    approach: [
      "Read the token counts of each conversation from the chat site in the browser.",
      "Applied the same EcoLogits formulas the platform uses for its own billing.",
      "Showed energy, water and CO2 next to the conversation as it runs.",
    ],
    outcome:
      "A user sees the environmental cost of their chat on any of the three sites.",
    figures: [],
  },
  {
    slug: "jeofferte",
    problem:
      "Dutch customers gave up on quote sites because getting three prices meant making an account first.",
    approach: [
      "Let customers post a request with no account and no login.",
      "Matched each request to suppliers by location and trade in a background job, so the match was ready before anyone asked for it.",
      "Charged suppliers per lead through Stripe.",
      "Pushed every new match out over WhatsApp and email.",
    ],
    outcome:
      "A customer posts a request and suppliers can answer it the same minute.",
    figures: [],
  },
  {
    slug: "roofcast",
    problem:
      "Trading on where property values go meant trusting a company to hold the money and call the result.",
    approach: [
      "Wrote Solidity contracts on Polygon using Gnosis conditional tokens for threshold outcomes.",
      "Settled every position in USDC on-chain, so nobody held the pot.",
      "Added wallet login, which removed the account and the password.",
      "Fed live property market data into the trading screens.",
    ],
    outcome:
      "Users trade property-value outcomes and the chain pays out the winners.",
    figures: [],
  },
  {
    slug: "meshi",
    problem:
      "Meshi's ordering screens were legacy code, and people could not tell which kitchens near them were open.",
    approach: [
      "Designed the ordering flow in Figma, then rebuilt it in React and Tailwind.",
      "Matched users to nearby kitchens with PostGIS location queries.",
      "Tracked availability so a closed kitchen never showed as orderable.",
    ],
    outcome:
      "Ordering pages load faster and list only kitchens that can cook right now.",
    figures: [],
  },
  {
    slug: "exmodules",
    problem:
      "Buying property with crypto asked one side to send money before the paperwork was checked.",
    approach: [
      "Held the funds in a smart contract until document verification passed.",
      "Added WalletConnect login and on-chain signing, so there was no separate account.",
      "Built token creation into the same flow.",
      "Shipped a generic data hook and a CRUD table so new screens took less code.",
    ],
    outcome: "Money only moves once the documents check out.",
    figures: [],
  },
  {
    slug: "intex-exchange",
    problem:
      "The exchange opened slowly, and every new trading screen was built from copied markup.",
    approach: [
      "Profiled the load path and cleared the biggest blockers.",
      "Added a PWA caching layer: cache-first for static assets, network-first for market data.",
      "Wired TradingView charts to a WebSocket feed for live prices and orders.",
      "Standardised the team's patterns behind a shared component library.",
    ],
    outcome: "Pages opened faster and a feature reached traders in fewer days.",
    figures: [
      { value: "4.2s → 2.9s", label: "Page load" },
      { value: "8 days → 5 days", label: "Feature cycle" },
    ],
  },
  {
    slug: "panikar-assessment",
    problem:
      "The academy assessed students on paper, so results came back too late to guide a choice.",
    approach: [
      "Built the test interface, the results view and the admin dashboard in React.",
      "Served the questions and results over a GraphQL API.",
      "Tuned the Webpack build so the test opened faster on slow connections.",
      "Pulled the shared parts into an internal design system the team reused.",
    ],
    outcome:
      "Students finish the test and read their result in the same sitting.",
    figures: [{ value: "5,000+", label: "Students" }],
  },
  {
    slug: "3gaam",
    problem:
      "Students could not find the right study material, and the GraphQL layer feeding the app was broken.",
    approach: [
      "Built the interactive learning screens in React.",
      "Fixed the GraphQL schema and resolver bugs that were blocking the team.",
      "Moved the codebase to TypeScript, the first production TypeScript at the company.",
    ],
    outcome: "The platform shipped and the team kept building on TypeScript.",
    figures: [],
  },
];
