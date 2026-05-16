interface SectionLabelProps {
  index: string;
  label?: string;
}

export function SectionLabel({ index, label }: SectionLabelProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-xs uppercase tracking-widest text-accent">
        § {index}
      </span>
      {label && (
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
      )}
    </div>
  );
}
