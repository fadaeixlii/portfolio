interface MockShotProps {
  type: "chat" | "analytics" | "commerce";
  variant?: "desktop" | "mobile";
  hue?: number;
}

function Bar({ w, bg }: { w: string; bg: string }) {
  return <div className="rounded-sm" style={{ height: 5, width: w, background: bg }} />;
}

function ChatDesktop({ hue }: { hue: number }) {
  const accent = `oklch(0.65 0.18 ${hue})`;
  const card = `oklch(0.14 0.006 ${hue})`;
  const line = `oklch(0.20 0.008 ${hue})`;
  const stripe = `oklch(0.16 0.008 ${hue})`;

  return (
    <div className="absolute inset-0 flex gap-2.5 p-4 font-sans">
      {/* Sidebar */}
      <div className="flex w-[22%] flex-col gap-1.5 rounded-lg p-2.5" style={{ background: card }}>
        <Bar w="60%" bg={accent} />
        <div className="mt-1.5 flex flex-col gap-1.5">
          <Bar w="100%" bg={line} />
          <Bar w="100%" bg={line} />
          <Bar w="70%" bg={line} />
          <Bar w="85%" bg={line} />
        </div>
        <div className="flex-1" />
        <div className="h-3.5 rounded-sm" style={{ background: stripe }} />
      </div>
      {/* Main */}
      <div className="flex flex-1 flex-col gap-2">
        {/* Top bar */}
        <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5" style={{ background: card }}>
          <div className="size-3.5 rounded-full" style={{ background: accent }} />
          <Bar w="100px" bg={line} />
          <div className="flex-1" />
          <Bar w="40px" bg={line} />
        </div>
        {/* Messages */}
        <div className="flex flex-1 flex-col gap-2.5 rounded-lg p-3" style={{ background: card }}>
          {/* User message */}
          <div className="ml-auto max-w-[70%] rounded-lg px-2.5 py-1.5" style={{ background: stripe }}>
            <Bar w="140px" bg={line} />
            <div className="mt-1"><Bar w="90px" bg={line} /></div>
          </div>
          {/* AI message */}
          <div className="max-w-[78%] rounded-lg border-l-2 px-2.5 py-1.5" style={{ background: `oklch(0.65 0.18 ${hue} / 0.16)`, borderColor: accent }}>
            <Bar w="160px" bg={`oklch(0.65 0.18 ${hue} / 0.5)`} />
            <div className="mt-1"><Bar w="200px" bg={`oklch(0.65 0.18 ${hue} / 0.35)`} /></div>
            <div className="mt-1"><Bar w="110px" bg={`oklch(0.65 0.18 ${hue} / 0.3)`} /></div>
          </div>
          {/* User message */}
          <div className="ml-auto max-w-[60%] rounded-lg px-2.5 py-1.5" style={{ background: stripe }}>
            <Bar w="90px" bg={line} />
          </div>
          <div className="flex-1" />
          {/* Input */}
          <div className="flex h-6 items-center gap-2 rounded-lg px-2.5" style={{ background: stripe }}>
            <Bar w="80px" bg={line} />
            <div className="flex-1" />
            <div className="size-3.5 rounded-sm" style={{ background: accent }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsDesktop({ hue }: { hue: number }) {
  const accent = `oklch(0.65 0.18 ${hue})`;
  const card = `oklch(0.14 0.006 ${hue})`;
  const line = `oklch(0.20 0.008 ${hue})`;
  const stripe = `oklch(0.16 0.008 ${hue})`;

  return (
    <div className="absolute inset-0 flex flex-col gap-2.5 p-4 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <Bar w="120px" bg={line} />
          <div className="h-1 w-20 rounded-sm" style={{ background: stripe }} />
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-4.5 w-12 rounded-md" style={{ background: i === 0 ? accent : stripe }} />
          ))}
        </div>
      </div>
      {/* KPI row */}
      <div className="grid grid-cols-3 gap-2">
        {["€ 482k", "+18%", "12.3k"].map((n, i) => (
          <div key={i} className="rounded-lg p-2.5" style={{ background: card }}>
            <Bar w="50px" bg={line} />
            <div className="mt-2 font-serif text-lg leading-none" style={{ color: i === 0 ? accent : "var(--fg)" }}>
              {n}
            </div>
          </div>
        ))}
      </div>
      {/* Chart */}
      <div className="flex-1 overflow-hidden rounded-lg p-3" style={{ background: card }}>
        <Bar w="100px" bg={line} />
        <svg viewBox="0 0 300 120" preserveAspectRatio="none" className="mt-2.5 h-[calc(100%-18px)] w-full">
          <defs>
            <linearGradient id={`g-${hue}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accent} stopOpacity={0.5} />
              <stop offset="100%" stopColor={accent} stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d="M0,90 L25,72 L50,80 L75,55 L100,60 L125,40 L150,48 L175,28 L200,38 L225,20 L250,30 L275,12 L300,18 L300,120 L0,120 Z" fill={`url(#g-${hue})`} />
          <path d="M0,90 L25,72 L50,80 L75,55 L100,60 L125,40 L150,48 L175,28 L200,38 L225,20 L250,30 L275,12 L300,18" fill="none" stroke={accent} strokeWidth="1.5" />
          {[[25,72],[75,55],[125,40],[175,28],[225,20],[275,12]].map(([x,y], i) => (
            <circle key={i} cx={x} cy={y} r="2" fill={accent} />
          ))}
        </svg>
      </div>
    </div>
  );
}

function CommerceDesktop({ hue }: { hue: number }) {
  const accent = `oklch(0.65 0.18 ${hue})`;
  const card = `oklch(0.14 0.006 ${hue})`;
  const line = `oklch(0.20 0.008 ${hue})`;
  const stripe = `oklch(0.16 0.008 ${hue})`;

  return (
    <div className="absolute inset-0 flex gap-2.5 p-4 font-sans">
      {/* Sidebar */}
      <div className="flex w-[20%] flex-col gap-1.5 rounded-lg p-2.5" style={{ background: card }}>
        <Bar w="70%" bg={accent} />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-sm" style={{ height: 5, background: i === 1 ? accent : line, opacity: i === 1 ? 0.8 : 1, width: `${80 - i * 8}%` }} />
        ))}
      </div>
      {/* Main */}
      <div className="flex flex-1 flex-col gap-2">
        {/* Status pills */}
        <div className="flex gap-2">
          {["draft", "sent", "won"].map((s, i) => (
            <div key={s} className="flex-1 rounded-lg p-2.5" style={{ background: card }}>
              <Bar w="30px" bg={i === 2 ? accent : line} />
              <div className="mt-1.5 font-serif text-lg leading-none" style={{ color: i === 2 ? accent : "var(--fg)" }}>
                {[24, 18, 9][i]}
              </div>
            </div>
          ))}
        </div>
        {/* Table */}
        <div className="flex flex-1 flex-col gap-1.5 rounded-lg p-2.5" style={{ background: card }}>
          <div className="grid grid-cols-[1fr_80px_60px_24px] gap-2 border-b pb-1.5" style={{ borderColor: line }}>
            <div className="h-1 w-[30%] rounded-sm" style={{ background: line }} />
            <div className="h-1 rounded-sm" style={{ background: line }} />
            <div className="h-1 rounded-sm" style={{ background: line }} />
            <div />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-[1fr_80px_60px_24px] items-center gap-2 py-1">
              <div className="h-1.5 rounded-sm" style={{ background: stripe, width: `${50 + (i * 7) % 30}%` }} />
              <div className="h-1.5 rounded-sm" style={{ background: stripe }} />
              <div className="h-1.5 rounded-sm" style={{ background: stripe }} />
              <div className="size-1.5 rounded-full" style={{ background: i % 2 === 0 ? accent : line }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MobileMock({ hue }: { hue: number }) {
  const accent = `oklch(0.65 0.18 ${hue})`;
  const card = `oklch(0.14 0.006 ${hue})`;
  const line = `oklch(0.22 0.008 ${hue})`;
  const stripe = `oklch(0.17 0.008 ${hue})`;

  return (
    <div className="absolute inset-0 flex flex-col gap-2 px-3 pb-4 pt-10">
      {/* Top bar */}
      <div className="flex items-center justify-between px-1">
        <div className="size-3.5 rounded-full" style={{ background: accent }} />
        <div className="h-1 w-16 rounded-sm" style={{ background: line }} />
        <div className="size-3.5 rounded-sm" style={{ background: stripe }} />
      </div>
      {/* Hero card */}
      <div className="flex flex-col gap-2 rounded-xl p-3" style={{ background: card }}>
        <div className="flex items-center justify-between">
          <Bar w="60px" bg={line} />
          <div className="h-4 w-10 rounded-full" style={{ background: accent, opacity: 0.9 }} />
        </div>
        <div className="font-serif text-2xl leading-none">Ask</div>
        <div className="h-1 w-3/4 rounded-sm" style={{ background: stripe }} />
      </div>
      {/* List */}
      <div className="flex flex-1 flex-col gap-2.5 rounded-xl p-3" style={{ background: card }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="size-7 rounded-lg" style={{ background: i === 0 ? accent : stripe, opacity: i === 0 ? 0.9 : 1 }} />
            <div className="flex flex-1 flex-col gap-1">
              <div className="rounded-sm" style={{ height: 5, width: `${60 + (i * 13) % 30}%`, background: line }} />
              <div className="rounded-sm" style={{ height: 4, width: `${40 + (i * 17) % 20}%`, background: stripe }} />
            </div>
            {i === 0 && <div className="size-1.5 rounded-full" style={{ background: accent }} />}
          </div>
        ))}
      </div>
      {/* Bottom nav */}
      <div className="flex justify-between rounded-xl px-3.5 py-2.5" style={{ background: card }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="size-4.5 rounded-sm" style={{ background: i === 0 ? accent : stripe, opacity: i === 0 ? 1 : 0.7 }} />
        ))}
      </div>
    </div>
  );
}

export function MockShot({ type, variant = "desktop", hue = 50 }: MockShotProps) {
  if (variant === "mobile") return <MobileMock hue={hue} />;

  const desktopMocks = {
    chat: ChatDesktop,
    analytics: AnalyticsDesktop,
    commerce: CommerceDesktop,
  } as const;

  const Mock = desktopMocks[type];
  return <Mock hue={hue} />;
}
