interface BrowserFrameProps {
  url?: string;
  children: React.ReactNode;
}

export function BrowserFrame({ url = "fadaeixlii.com", children }: BrowserFrameProps) {
  return (
    <div
      className="overflow-hidden rounded-lg border border-border-strong"
      style={{
        background: "var(--browser-frame)",
        boxShadow: "0 30px 80px -30px oklch(0 0 0 / 0.35), 0 0 0 1px var(--border)",
      }}
    >
      {/* Chrome bar */}
      <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-2">
        {/* intentional: macOS traffic-light replica — hardcoded hex is correct */}
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full" style={{ background: "#ff5f57", opacity: 0.85 }} />
          <span className="size-2.5 rounded-full" style={{ background: "#febc2e", opacity: 0.85 }} />
          <span className="size-2.5 rounded-full" style={{ background: "#28c840", opacity: 0.85 }} />
        </div>
        <div className="ml-4 flex flex-1 items-center gap-2 rounded-md bg-muted px-3 py-1">
          <span className="text-accent">●</span>
          <span className="font-mono text-[11px] text-muted-foreground">{url}</span>
        </div>
      </div>
      {/* Viewport — 16:10 aspect ratio */}
      <div className="relative aspect-16/10 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
