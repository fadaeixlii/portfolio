interface PhoneFrameProps {
  hue?: number;
  children: React.ReactNode;
}

export function PhoneFrame({ hue = 50, children }: PhoneFrameProps) {
  return (
    <div
      className="w-full overflow-hidden rounded-2xl border border-border-strong bg-card p-1.5"
      style={{
        boxShadow: "0 30px 60px -20px rgba(0,0,0,0.7)",
      }}
    >
      <div
        className="relative overflow-hidden rounded-lg aspect-9/19"
        style={{ background: `oklch(0.10 0.004 ${hue})` }}
      >
        {/* Notch */}
        <div className="absolute left-1/2 top-2 z-10 h-4.5 w-20 -translate-x-1/2 rounded-full bg-background" />
        {children}
      </div>
    </div>
  );
}
