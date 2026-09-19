import type { Metadata } from "next";
import { UnlocalisedShell } from "@/components/layout/UnlocalisedShell";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <UnlocalisedShell>
      <div className="mx-auto flex min-h-dvh max-w-sm items-center p-[var(--space-8)]">{children}</div>
    </UnlocalisedShell>
  );
}
