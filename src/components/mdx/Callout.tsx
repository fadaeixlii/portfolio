import { cn } from "@/lib/utils";

interface CalloutProps {
  type?: "info" | "warning" | "tip";
  children: React.ReactNode;
}

const borderColors = {
  info: "border-l-accent",
  warning: "border-l-amber-500",
  tip: "border-l-emerald-500",
};

export function Callout({ type = "info", children }: CalloutProps) {
  return (
    <aside
      className={cn(
        "my-8 rounded-lg border border-border bg-card p-6 pl-5 border-l-4",
        borderColors[type]
      )}
    >
      <div className="text-sm leading-relaxed text-foreground [&>p]:m-0">
        {children}
      </div>
    </aside>
  );
}
