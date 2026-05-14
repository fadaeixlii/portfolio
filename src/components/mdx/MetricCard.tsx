interface MetricCardProps {
  label: string;
  value: string;
}

export function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-card p-6 text-center">
      <span className="font-serif text-3xl tracking-tight text-foreground">
        {value}
      </span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}
