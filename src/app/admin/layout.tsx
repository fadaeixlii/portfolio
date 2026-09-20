import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isSignedIn } from "@/lib/auth";
import { UnlocalisedShell } from "@/components/layout/UnlocalisedShell";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Signed out and "signed in but not allowed" take the same exit — a
  // distinct forbidden page would confirm the route exists. The allowlist
  // itself is enforced at login; this only asks whether the cookie is valid.
  if (!(await isSignedIn())) redirect("/auth/login");

  return (
    <UnlocalisedShell>
      <div className="mx-auto max-w-5xl p-[var(--space-8)]">{children}</div>
    </UnlocalisedShell>
  );
}
