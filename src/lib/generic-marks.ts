/**
 * Marks for the technologies that have no brand icon.
 *
 * Roughly a quarter of the stack is not a product with a logo: RAG and MCP
 * are techniques, "REST APIs" is a style, and pgvector, LiteLLM, EcoLogits
 * and Gnosis Conditional Tokens are projects simple-icons does not carry.
 * Leaving those chips bare made the rows look half-finished next to the
 * branded ones.
 *
 * These are deliberately *generic* glyphs grouped by what the thing is —
 * a store, an interface, a model, a chain, a tool. Inventing a logo for
 * LiteLLM and passing it off as the project's own mark would be worse than
 * no icon: a reader would take it for the real thing. A shared category
 * glyph reads as a category, which is what it is.
 *
 * Paths are 24x24 to match simple-icons, stroked rather than filled so they
 * sit apart from the brand marks at a glance.
 */
export type GenericMark = { path: string; stroke: true };

const STORE =
  "M4 6c0-1.1 3.6-2 8-2s8 .9 8 2-3.6 2-8 2-8-.9-8-2Zm0 0v12c0 1.1 3.6 2 8 2s8-.9 8-2V6";
const INTERFACE = "M9 4 4 12l5 8M15 4l5 8-5 8";
const MODEL = "M12 3v5m0 8v5M5.6 7.5 10 10m4 4 4.4 2.5M18.4 7.5 14 10m-4 4-4.4 2.5";
const CHAIN = "M12 2.5 20 7v10l-8 4.5L4 17V7Z";
const TOOL = "M4 20 20 4M9 4H4v5M20 15v5h-5";

/**
 * Explicit, not inferred. A keyword match would quietly give the wrong
 * glyph to the next thing added to the stack, and nobody would notice.
 */
const MARKS: Record<string, string> = {
  // Stores and indexes
  pgvector: STORE,
  postgis: STORE,
  "service worker": STORE,

  // Interfaces and protocols
  "rest apis": INTERFACE,
  mcp: INTERFACE,
  "chrome extensions": INTERFACE,

  // Models and retrieval
  rag: MODEL,
  litellm: MODEL,
  langgraph: MODEL,
  ecologits: MODEL,

  // On-chain
  "gnosis conditional tokens": CHAIN,

  // Tooling
  playwright: TOOL,
  zustand: TOOL,
  xcode: TOOL,
  gradle: TOOL,
};

export function genericMark(name: string): GenericMark | null {
  const path = MARKS[name.toLowerCase()];
  return path ? { path, stroke: true } : null;
}
