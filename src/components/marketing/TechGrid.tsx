"use client";

import { useRef } from "react";
import { useInView, useReducedMotion } from "motion/react";

/* ── Recognizable SVG icons for each tech ── */
const icons: Record<string, React.ReactNode> = {
  React: (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 13.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" />
      <path d="M12 21.35c-1.1 0-2.13-.16-3.06-.46-1.7 1.03-3.22 1.46-4.19 1.02-.97-.44-1.33-1.87-1.1-3.73a12 12 0 0 1-1.08-1.38C1.22 14.83.5 13.13.5 12s.72-2.83 2.07-4.8c.33-.46.69-.92 1.08-1.38-.23-1.86.13-3.29 1.1-3.73.97-.44 2.49.01 4.19 1.02.93-.3 1.96-.46 3.06-.46s2.13.16 3.06.46c1.7-1.03 3.22-1.46 4.19-1.02.97.44 1.33 1.87 1.1 3.73.39.46.75.92 1.08 1.38C22.78 9.17 23.5 10.87 23.5 12s-.72 2.83-2.07 4.8c-.33.46-.69.92-1.08 1.38.23 1.86-.13 3.29-1.1 3.73-.97.44-2.49-.01-4.19-1.02-.93.3-1.96.46-3.06.46Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  "Next.js": (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1 14.5V8l7.5 9.5h-2L10 10v6.5H9Z" />
    </svg>
  ),
  TypeScript: (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
      <rect width="20" height="20" x="2" y="2" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="currentColor" fontFamily="system-ui">TS</text>
    </svg>
  ),
  "Tailwind CSS": (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 6c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.3.74 1.91 1.35C13.36 10.81 14.5 12 17 12c2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.3-.74-1.91-1.35C15.64 7.19 14.5 6 12 6ZM7 12c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.3.74 1.91 1.35C8.36 16.81 9.5 18 12 18c2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.3-.74-1.91-1.35C10.64 13.19 9.5 12 7 12Z" />
    </svg>
  ),
  "Motion/Framer": (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 2h16v7H12l8 7H4v-7h8L4 2Z" opacity="0.7" />
    </svg>
  ),
  "Node.js": (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <text x="12" y="15" textAnchor="middle" fontSize="7" fontWeight="600" fill="currentColor" fontFamily="system-ui">N</text>
    </svg>
  ),
  NestJS: (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.4" />
    </svg>
  ),
  Express: (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="currentColor" fontFamily="system-ui">Ex</text>
    </svg>
  ),
  "REST APIs": (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M4 12h16M8 8l-4 4 4 4M16 8l4 4-4 4" />
    </svg>
  ),
  GraphQL: (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <polygon points="12,3 20,7.5 20,16.5 12,21 4,16.5 4,7.5" />
      <circle cx="12" cy="3" r="1.5" fill="currentColor" />
      <circle cx="20" cy="7.5" r="1.5" fill="currentColor" />
      <circle cx="20" cy="16.5" r="1.5" fill="currentColor" />
      <circle cx="12" cy="21" r="1.5" fill="currentColor" />
      <circle cx="4" cy="16.5" r="1.5" fill="currentColor" />
      <circle cx="4" cy="7.5" r="1.5" fill="currentColor" />
    </svg>
  ),
  PostgreSQL: (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <ellipse cx="12" cy="7" rx="8" ry="3" />
      <path d="M4 7v5c0 1.66 3.58 3 8 3s8-1.34 8-3V7" />
      <path d="M4 12v5c0 1.66 3.58 3 8 3s8-1.34 8-3v-5" />
    </svg>
  ),
  MongoDB: (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2v20" />
      <path d="M12 2c-3 3-5 6-5 10s2 7 5 10c3-3 5-6 5-10s-2-7-5-10Z" />
    </svg>
  ),
  Supabase: (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2 4 14h8l-1 8 9-12h-8l1-8Z" opacity="0.7" />
    </svg>
  ),
  Redis: (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <ellipse cx="12" cy="12" rx="8" ry="4" />
      <path d="M4 12v4c0 2.2 3.58 4 8 4s8-1.8 8-4v-4" />
      <path d="M4 8v4c0 2.2 3.58 4 8 4s8-1.8 8-4V8" />
    </svg>
  ),
  Solidity: (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2 6 12h6l-2 10 8-12h-6l2-8Z" opacity="0.7" />
    </svg>
  ),
  "Ethers.js": (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" opacity="0.7">
      <polygon points="12,2 22,12 12,22 2,12" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <polygon points="12,6 18,12 12,18 6,12" fill="currentColor" opacity="0.3" />
    </svg>
  ),
  Web3: (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 8h8M6 12h12M8 16h8" />
    </svg>
  ),
  "Smart Contracts": (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 9h8M8 12h5M8 15h6" />
    </svg>
  ),
  Git: (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="6" cy="6" r="2" /><circle cx="18" cy="6" r="2" /><circle cx="6" cy="18" r="2" />
      <path d="M6 8v10M8 6h8M18 8v4c0 2-2 4-4 4h-4" />
    </svg>
  ),
  Docker: (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="10" width="20" height="8" rx="2" />
      <rect x="5" y="7" width="3" height="3" /><rect x="9" y="7" width="3" height="3" /><rect x="13" y="7" width="3" height="3" />
      <rect x="9" y="4" width="3" height="3" />
    </svg>
  ),
  "CI/CD": (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
      <circle cx="12" cy="12" r="5" />
      <path d="m10 12 2 2 4-4" />
    </svg>
  ),
  Cloudflare: (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 17h18c1.1-3-1.5-6-5-6-.5-3-3-5-6-5-3.5 0-6.2 2.5-6.5 5.5C2 12 1.5 14.5 3 17Z" />
    </svg>
  ),
  Linux: (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 4c-2 0-4 3-4 7 0 2-2 3-2 5s1 3 3 3h6c2 0 3-1 3-3s-2-3-2-5c0-4-2-7-4-7Z" />
      <circle cx="10" cy="10" r="1" fill="currentColor" />
      <circle cx="14" cy="10" r="1" fill="currentColor" />
    </svg>
  ),
  Python: (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2c-2.5 0-4.5.5-4.5 2.5V7h5v1H5C3.5 8 2 9.5 2 12s1.5 4 3 4h2v-2.5C7 11.5 8.5 10 10.5 10h3C15 10 16 9 16 7.5v-3C16 2.5 14.5 2 12 2Z" />
      <path d="M12 22c2.5 0 4.5-.5 4.5-2.5V17h-5v-1h7.5c1.5 0 3-1.5 3-4s-1.5-4-3-4h-2v2.5c0 2-1.5 3.5-3.5 3.5h-3C9 14 8 15 8 16.5v3c0 2 1.5 2.5 4 2.5Z" />
      <circle cx="10" cy="5.5" r="1" fill="currentColor" />
      <circle cx="14" cy="18.5" r="1" fill="currentColor" />
    </svg>
  ),
  Zustand: (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9v6M15 9v6M9 12h6" />
    </svg>
  ),
  "React Query": (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.4" />
      <path d="M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20M2 12h20" />
    </svg>
  ),
  LiteLLM: (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" opacity="0.7">
      <path d="M12 2 9 9h6L12 2ZM4 11h16v2H4zM7 15h10l-2 7H9l-2-7Z" />
    </svg>
  ),
  RAG: (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="8" y="14" width="8" height="7" rx="1" />
      <path d="M6.5 10v2l5 2M17.5 10v2l-5 2" />
    </svg>
  ),
  "OpenAI API": (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  ),
  LangChain: (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="6" cy="12" r="2" /><circle cx="18" cy="12" r="2" /><circle cx="12" cy="6" r="2" /><circle cx="12" cy="18" r="2" />
      <path d="M8 11l2-3M14 9l2 2M14 13l2 2M8 13l2 3" />
    </svg>
  ),
  "Prompt Engineering": (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M4 6h16M4 10h10M4 14h12M4 18h8" />
      <path d="M18 14l3 2-3 2" />
    </svg>
  ),
  Hardhat: (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" opacity="0.7">
      <path d="M4 14h16v3H4zM6 11h12l2 3H4l2-3Z" />
      <path d="M8 8h8a2 2 0 0 1 2 2v1H6v-1a2 2 0 0 1 2-2Z" />
    </svg>
  ),
  Foundry: (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2L8 8h8l-4-6Z" fill="currentColor" opacity="0.3" />
      <rect x="6" y="8" width="12" height="10" rx="2" />
      <path d="M9 12h6M9 15h4" />
    </svg>
  ),
  Viem: (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="currentColor" fontFamily="system-ui">V</text>
    </svg>
  ),
  Wagmi: (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 12l3-6 3 6 3-6 3 6 3-6 3 6" />
    </svg>
  ),
  WalletConnect: (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6.5 9.5C9.5 6.5 14.5 6.5 17.5 9.5" />
      <path d="M8.5 12C10.5 10 13.5 10 15.5 12" />
      <circle cx="12" cy="14.5" r="1.5" fill="currentColor" />
    </svg>
  ),
  Turborepo: (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  "GitHub Actions": (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="3" /><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  ),
  "AWS S3": (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 8l8-4 8 4v8l-8 4-8-4V8Z" />
      <path d="M4 8l8 4 8-4M12 12v8" />
    </svg>
  ),
  Sentry: (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M12 3L4 19h6M12 3l8 16h-6" />
      <circle cx="12" cy="16" r="1.5" fill="currentColor" />
    </svg>
  ),
  "Web3.js": (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 8h8M6 12h12M8 16h8" />
    </svg>
  ),
};

const defaultIcon = (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
  </svg>
);

type SkillCategory = { name: string; skills: string[] };

/* ── Animated category row ── */
function CategoryRow({
  category,
  index,
}: {
  category: SkillCategory;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduced = useReducedMotion();

  return (
    <div
      ref={ref}
      className="grid gap-4 sm:grid-cols-[140px_1fr] sm:gap-8 md:grid-cols-[180px_1fr]"
      style={{
        opacity: reduced || inView ? 1 : 0,
        transform: reduced || inView ? "none" : "translateY(12px)",
        transition: reduced
          ? "none"
          : `opacity 0.2s ease, transform 0.2s ease`,
      }}
    >
      {/* Category label */}
      <div className="flex items-start gap-2 pt-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
          0{index + 1}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
          {category.name}
        </span>
      </div>

      {/* Skill pills */}
      <div className="flex flex-wrap gap-2.5">
        {category.skills.map((skill, i) => (
          <div
            key={skill}
            className="group inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 transition-colors duration-200 hover:border-accent/40 hover:bg-accent/5"
            style={{
              opacity: reduced || inView ? 1 : 0,
              transition: reduced
                ? "none"
                : "opacity 0.2s ease, background-color 0.2s, border-color 0.2s",
            }}
          >
            <span className="size-4 shrink-0 text-muted-foreground transition-colors duration-200 group-hover:text-accent">
              {icons[skill] ?? defaultIcon}
            </span>
            <span className="font-mono text-xs tracking-wide text-foreground">
              {skill}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TechGrid({ categories }: { categories: SkillCategory[] }) {
  return (
    <section className="border-t border-border px-4 py-14 sm:px-6 sm:py-20 md:px-12 lg:px-16">
      <div className="mx-auto w-full max-w-7xl">
        {/* Section header */}
        <div className="mb-10 grid gap-4 sm:grid-cols-[140px_1fr] sm:gap-8 md:grid-cols-[180px_1fr]">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
            Stack
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            Tools I reach for daily. Not a skill wall — just what I actually ship with.
          </p>
        </div>

        {/* Category rows */}
        <div className="flex flex-col gap-6">
          {categories.map((cat, i) => (
            <CategoryRow key={cat.name} category={cat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
