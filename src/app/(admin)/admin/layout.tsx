import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    redirect("/auth/login");
  }

  return (
    <div className="flex min-h-dvh">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-border bg-card md:block">
        <div className="flex h-14 items-center gap-2 border-b border-border px-4">
          <div className="h-2 w-2 rounded-full bg-accent" />
          <span className="font-mono text-xs tracking-wide">admin</span>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          <Link
            href="/admin/messages"
            className="rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
          >
            Messages
          </Link>
        </nav>
        <div className="mt-auto border-t border-border p-3">
          <p className="mb-2 truncate font-mono text-[11px] text-muted-foreground">
            {user.email}
          </p>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex flex-1 flex-col">
        {/* Mobile header */}
        <header className="flex h-14 items-center justify-between border-b border-border px-4 md:hidden">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-accent" />
            <span className="font-mono text-xs tracking-wide">admin</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/messages" className="text-sm">
              Messages
            </Link>
            <form action="/auth/signout" method="post">
              <button type="submit" className="text-sm text-muted-foreground">
                Sign out
              </button>
            </form>
          </div>
        </header>
        <div className="flex-1 p-4 sm:p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
