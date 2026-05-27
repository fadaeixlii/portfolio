import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { MessageList } from "@/components/admin/MessageList";

export const metadata: Metadata = {
  title: "Messages — Admin",
  robots: "noindex, nofollow",
};

export default async function MessagesPage() {
  const supabase = await createClient();

  const { data: messages, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-medium">Messages</h1>
        <p className="text-sm text-destructive">
          Failed to load messages: {error.message}
        </p>
      </div>
    );
  }

  const unreadCount = messages?.filter((m) => m.status === "unread").length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-medium">
          Messages
          {unreadCount > 0 && (
            <span className="ml-2 inline-flex items-center rounded-full bg-accent/10 px-2 py-0.5 font-mono text-xs text-accent">
              {unreadCount} unread
            </span>
          )}
        </h1>
      </div>

      {messages && messages.length > 0 ? (
        <MessageList messages={messages} />
      ) : (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No messages yet. They'll appear here when someone uses the contact form.
        </p>
      )}
    </div>
  );
}
