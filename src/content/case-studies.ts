import { z } from "zod";
import type { caseStudySchema } from "./schema";

/** One per project, slugs match `projects.ts`. `figures` stays empty unless a number has a source. */
export const caseStudies: z.input<typeof caseStudySchema>[] = [
  {
    slug: "aim2balance",
    problem:
      "The product explains itself once someone is inside it. Before that, a visitor needs to know what it is and why the price includes a tree.",
    approach: [
      "Built the public site as the explanation layer: what the service does, where the data stays, and how the environmental fee is worked out.",
      "Wired the automation workflows behind it, so a sign-up, a billing event or a monthly report moves without someone running a script.",
      "Kept the marketing site and the product on separate deploys, so a copy change never waits on a platform release.",
    ],
    outcome:
      "The site carries the explanation and the sign-up path, with the routine operational steps behind it automated.",
    figures: [],
  },
  {
    slug: "aim2balance-chat",
    problem:
      "A chat that charges for energy has to show the energy, or the charge is just a line on a bill nobody believes.",
    approach: [
      "Built the conversation UI on LibreChat, with a model picker that names the gateway's own routing profile rather than the provider behind it.",
      "Put the environmental readout beside the answer, not in a settings page, so the cost of a reply arrives with the reply.",
      "Kept the usage summary aggregate — time spent and topic mix — so the panel says something without reading anyone's conversations.",
    ],
    outcome:
      "The chat shipped as the platform's front door, with per-answer environmental figures in the same view as the answer.",
    figures: [],
  },
  {
    slug: "aim2balance-ios",
    problem:
      "The platform worked in a browser, but people expect an AI assistant to be an icon on their home screen.",
    approach: [
      "Wrapped the existing web build with Capacitor rather than starting a second codebase, so the app and the site never drift apart.",
      "Added the native pieces a browser cannot give: push permissions, safe-area layout and the keyboard behaviour iOS expects.",
      "Took it through App Store review, including the disclosures a service that bills inside the app has to make.",
    ],
    outcome: "Published on the App Store, sharing one codebase with the web platform.",
    figures: [],
  },
  {
    slug: "aim2balance-android",
    problem:
      "Half the audience is on Android, and a second native codebase would have doubled the cost of every feature.",
    approach: [
      "Shipped the same Capacitor build to Android, so one change reaches web, iOS and Android together.",
      "Handled the platform differences that do not travel: back-button behaviour, Play billing disclosure and Android's permission prompts.",
      "Took it through Play Store review.",
    ],
    outcome: "Published on Google Play from the same codebase as the web platform and the iOS app.",
    figures: [],
  },
  {
    slug: "aim2balance-gateway",
    problem:
      "Three EU providers, three APIs, three pricing schemes — and a product that has to bill in one currency and keep working when one of them is down.",
    approach: [
      "Put LiteLLM in front of all three behind a single OpenAI-compatible endpoint, so the product codes against one API.",
      "Set routing and fallback so a provider outage moves traffic instead of returning an error.",
      "Normalised each provider's token price into one internal cost unit, which is what makes a single wallet possible without a per-model rate table.",
      "Metered energy and water per request at the gateway, where every call already passes through.",
    ],
    outcome:
      "One endpoint served the platform, the apps and the extension, with per-request cost and environmental figures recorded at the boundary.",
    figures: [{ value: "3", label: "EU model providers" }],
  },
  {
    slug: "aim2balance-admin",
    problem:
      "Running the service meant reading the database by hand: who signed up, which models were enabled, what the month cost.",
    approach: [
      "Built an operator console over the same API the product uses, so there is no second source of truth.",
      "Grouped it the way the work actually splits: accounts and organisations, model and gateway config, usage and finance, and the environmental ledger.",
      "Gated it behind role checks and an audit trail, because an admin panel is the one place every record is reachable.",
    ],
    outcome:
      "Day-to-day operation moved out of the database and into a console with roles and an audit trail.",
    figures: [],
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
