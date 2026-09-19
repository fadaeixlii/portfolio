import { z } from "zod";
import type { stackGroupSchema } from "./schema";

/** Only what has shipped in a production codebase here. Nothing read-about. */
export const stack: z.input<typeof stackGroupSchema>[] = [
  {
    name: "Frontend",
    items: [
      "React",
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "React Query",
      "Zustand",
      "Motion",
    ],
  },
  {
    name: "Backend",
    items: [
      "Node.js",
      "NestJS",
      "Express",
      "Python",
      "FastAPI",
      "REST APIs",
      "GraphQL",
      "Socket.io",
      "Stripe",
    ],
  },
  {
    name: "Data",
    items: [
      "PostgreSQL",
      "pgvector",
      "PostGIS",
      "MongoDB",
      "Redis",
      "Supabase",
    ],
  },
  {
    name: "AI and LLM",
    items: ["LiteLLM", "LangChain", "LangGraph", "RAG", "MCP", "EcoLogits"],
  },
  {
    name: "Web3",
    items: [
      "Solidity",
      "Polygon",
      "Ethers.js",
      "WalletConnect",
      "Gnosis Conditional Tokens",
    ],
  },
  {
    name: "Build and ship",
    items: [
      "Docker",
      "GitHub Actions",
      "Turborepo",
      "Playwright",
      "Capacitor",
      "Git",
      "Linux",
    ],
  },
];
