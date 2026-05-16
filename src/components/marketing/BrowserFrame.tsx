interface BrowserFrameProps {
  url?: string;
  hue?: number;
  children: React.ReactNode;
}

export function BrowserFrame({ url = "fadaeixlii.com", hue = 50, children }: BrowserFrameProps) {
  return (
    <div
      className="overflow-hidden rounded-lg border border-border-strong"
      style={{
        background: `oklch(0.10 0.004 ${hue})`,
        boxShadow: "0 30px 80px -30px rgba(0,0,0,0.6), 0 0 0 1px oklch(0.20 0.006 50 / 0.6)",
      }}
    >
      {/* Chrome bar */}
      <div className="flex items-center gap-2 border-b border-border bg-card px-3.5 py-2.5">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full" style={{ background: "#ff5f57", opacity: 0.85 }} />
          <span className="size-2.5 rounded-full" style={{ background: "#febc2e", opacity: 0.85 }} />
          <span className="size-2.5 rounded-full" style={{ background: "#28c840", opacity: 0.85 }} />
        </div>
        <div className="ml-3.5 flex flex-1 items-center gap-2 rounded-md bg-muted px-3 py-1">
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
