import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { UnlocalisedShell } from "@/components/layout/UnlocalisedShell";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getUser();
  // getUser() revalidates against the auth server; getSession() trusts a
  // cookie a client could have forged.
  if (!data.user) redirect("/auth/login");

  return (
    <UnlocalisedShell>
      <div className="mx-auto max-w-5xl p-[var(--space-8)]">{children}</div>
    </UnlocalisedShell>
  );
}
