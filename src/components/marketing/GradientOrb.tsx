export function GradientOrb() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute -right-20 top-1/4 h-[400px] w-[400px] rounded-full bg-accent/15 blur-[120px] animate-orb-1" />
      <div className="absolute -right-32 top-1/3 h-[280px] w-[280px] rounded-full bg-accent/10 blur-[80px] animate-orb-2" />
    </div>
  );
}
