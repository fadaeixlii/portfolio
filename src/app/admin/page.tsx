import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service";
import { Surface } from "@/components/primitives/Surface";
import { Hairline } from "@/components/primitives/Hairline";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

async function loadMessages(): Promise<ContactMessage[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("id, name, email, message, created_at")
    .order("created_at", { ascending: false })
    // See src/lib/supabase/service.ts — without this a wedged Supabase host
    // retries past the 5s fetch timeout instead of failing at it.
    .retry(false);
  if (error) throw new Error(`contact_messages lookup failed: ${error.message}`);
  return (data as ContactMessage[] | null) ?? [];
}

const formatReceived = (iso: string) =>
  new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));

export default async function AdminMessagesPage() {
  const messages = await loadMessages();

  return (
    <div className="flex flex-col gap-[var(--space-8)]">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-[length:var(--text-2xl)]">Messages</h1>
        <Link href="/admin/bookings" className="text-[length:var(--text-sm)] text-signal hover:underline">
          Bookings
        </Link>
      </div>

      {messages.length === 0 ? (
        <p className="text-[length:var(--text-sm)] text-dim">No messages yet.</p>
      ) : (
        <ul className="flex flex-col gap-[var(--space-4)]">
          {messages.map((m) => (
            <li key={m.id}>
              <Surface variant="flat" className="flex flex-col gap-2 p-[var(--space-4)]">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-[length:var(--text-base)]">
                    {m.name} <span className="text-dim">— {m.email}</span>
                  </p>
                  <p className="font-mono text-[length:var(--text-xs)] tabular-nums text-dim">
                    {formatReceived(m.created_at)}
                  </p>
                </div>
                <Hairline />
                <p className="whitespace-pre-wrap text-dim">{m.message}</p>
              </Surface>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
