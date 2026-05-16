"use client"; // needs useReducedMotion for accessibility

import { useReducedMotion } from "motion/react";

interface MarqueeProps {
  items: string[];
  speed?: number;
  accent?: boolean;
}

/* Simple recognizable SVG icons for common tech. Falls back to a generic code icon. */
const techIcons: Record<string, React.ReactNode> = {
  React: (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 13.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm0 0" />
      <path d="M12 21.35c-1.1 0-2.13-.16-3.06-.46-1.7 1.03-3.22 1.46-4.19 1.02-.97-.44-1.33-1.87-1.1-3.73a12 12 0 0 1-1.08-1.38C1.22 14.83.5 13.13.5 12s.72-2.83 2.07-4.8c.33-.46.69-.92 1.08-1.38-.23-1.86.13-3.29 1.1-3.73.97-.44 2.49.01 4.19 1.02.93-.3 1.96-.46 3.06-.46s2.13.16 3.06.46c1.7-1.03 3.22-1.46 4.19-1.02.97.44 1.33 1.87 1.1 3.73.39.46.75.92 1.08 1.38C22.78 9.17 23.5 10.87 23.5 12s-.72 2.83-2.07 4.8c-.33.46-.69.92-1.08 1.38.23 1.86-.13 3.29-1.1 3.73-.97.44-2.49-.01-4.19-1.02-.93.3-1.96.46-3.06.46Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  "Next.js": (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1 14.5V8l7.5 9.5h-2L10 10v6.5H9Z" />
    </svg>
  ),
  TypeScript: (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
      <rect width="20" height="20" x="2" y="2" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="currentColor" fontFamily="system-ui">TS</text>
    </svg>
  ),
  "Node.js": (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <text x="12" y="15" textAnchor="middle" fontSize="7" fontWeight="600" fill="currentColor" fontFamily="system-ui">N</text>
    </svg>
  ),
  NestJS: (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.4" />
    </svg>
  ),
  PostgreSQL: (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <ellipse cx="12" cy="7" rx="8" ry="3" />
      <path d="M4 7v5c0 1.66 3.58 3 8 3s8-1.34 8-3V7" />
      <path d="M4 12v5c0 1.66 3.58 3 8 3s8-1.34 8-3v-5" />
    </svg>
  ),
  MongoDB: (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2v20" />
      <path d="M12 2c-3 3-5 6-5 10s2 7 5 10c3-3 5-6 5-10s-2-7-5-10Z" />
    </svg>
  ),
  GraphQL: (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <polygon points="12,3 20,7.5 20,16.5 12,21 4,16.5 4,7.5" />
      <circle cx="12" cy="3" r="1.5" fill="currentColor" />
      <circle cx="20" cy="7.5" r="1.5" fill="currentColor" />
      <circle cx="20" cy="16.5" r="1.5" fill="currentColor" />
      <circle cx="12" cy="21" r="1.5" fill="currentColor" />
      <circle cx="4" cy="16.5" r="1.5" fill="currentColor" />
      <circle cx="4" cy="7.5" r="1.5" fill="currentColor" />
    </svg>
  ),
  Solidity: (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2 6 12h6l-2 10 8-12h-6l2-8Z" opacity="0.7" />
    </svg>
  ),
  Docker: (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="10" width="20" height="8" rx="2" />
      <rect x="5" y="7" width="3" height="3" /><rect x="9" y="7" width="3" height="3" /><rect x="13" y="7" width="3" height="3" />
      <rect x="9" y="4" width="3" height="3" />
    </svg>
  ),
  "Tailwind CSS": (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 6c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.3.74 1.91 1.35C13.36 10.81 14.5 12 17 12c2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.3-.74-1.91-1.35C15.64 7.19 14.5 6 12 6ZM7 12c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.3.74 1.91 1.35C8.36 16.81 9.5 18 12 18c2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.3-.74-1.91-1.35C10.64 13.19 9.5 12 7 12Z" />
    </svg>
  ),
  "Motion/Framer": (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 2h16v7H12l8 7H4v-7h8L4 2Z" opacity="0.7" />
    </svg>
  ),
  Express: (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="currentColor" fontFamily="system-ui">Ex</text>
    </svg>
  ),
  "REST APIs": (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M4 12h16M8 8l-4 4 4 4M16 8l4 4-4 4" />
    </svg>
  ),
  Redis: (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <ellipse cx="12" cy="12" rx="8" ry="4" />
      <path d="M4 12v4c0 2.2 3.58 4 8 4s8-1.8 8-4v-4" />
      <path d="M4 8v4c0 2.2 3.58 4 8 4s8-1.8 8-4V8" />
    </svg>
  ),
  Supabase: (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2 4 14h8l-1 8 9-12h-8l1-8Z" opacity="0.7" />
    </svg>
  ),
  Cloudflare: (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 17h18c1.1-3-1.5-6-5-6-.5-3-3-5-6-5-3.5 0-6.2 2.5-6.5 5.5C2 12 1.5 14.5 3 17Z" />
    </svg>
  ),
  "Ethers.js": (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" opacity="0.7">
      <polygon points="12,2 22,12 12,22 2,12" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <polygon points="12,6 18,12 12,18 6,12" fill="currentColor" opacity="0.3" />
    </svg>
  ),
  Web3: (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 8h8M6 12h12M8 16h8" />
    </svg>
  ),
  "Smart Contracts": (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 9h8M8 12h5M8 15h6" />
    </svg>
  ),
  Git: (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="6" cy="6" r="2" /><circle cx="18" cy="6" r="2" /><circle cx="6" cy="18" r="2" />
      <path d="M6 8v10M8 6h8M18 8v4c0 2-2 4-4 4h-4" />
    </svg>
  ),
  "CI/CD": (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
      <circle cx="12" cy="12" r="5" />
      <path d="m10 12 2 2 4-4" />
    </svg>
  ),
  Linux: (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 4c-2 0-4 3-4 7 0 2-2 3-2 5s1 3 3 3h6c2 0 3-1 3-3s-2-3-2-5c0-4-2-7-4-7Z" />
      <circle cx="10" cy="10" r="1" fill="currentColor" />
      <circle cx="14" cy="10" r="1" fill="currentColor" />
    </svg>
  ),
};

/* Fallback icon for unrecognized tech */
const defaultIcon = (
  <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
  </svg>
);

export function Marquee({
  items,
  speed = 60,
  accent = false,
}: MarqueeProps) {
  const reduced = useReducedMotion();

  const row = (
    <div className="flex shrink-0 items-center gap-10 pr-10 sm:gap-14 sm:pr-14">
      {items.map((item, i) => (
        <span
          key={`${item}-${i}`}
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] sm:text-sm sm:gap-2.5"
        >
          <span className={accent && i % 4 === 0 ? "text-accent" : "text-muted-foreground/60"}>
            {techIcons[item] ?? defaultIcon}
          </span>
          <span className={accent && i % 4 === 0 ? "text-accent" : "text-muted-foreground"}>
            {item}
          </span>
          <span className="ml-4 size-1 rounded-full bg-border-strong sm:ml-6" />
        </span>
      ))}
    </div>
  );

  return (
    <div className="overflow-hidden border-y border-border py-4 sm:py-5">
      <div
        className="flex w-max"
        style={{
          animation: reduced
            ? "none"
            : `marquee ${speed}s linear infinite`,
        }}
      >
        {row}
        {row}
      </div>
    </div>
  );
}
