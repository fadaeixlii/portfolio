"use client";

import { useState, useTransition } from "react";
import { updateMessageStatus, deleteMessage } from "@/app/(admin)/admin/messages/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  created_at: string;
};

const statusColors: Record<string, string> = {
  unread: "bg-accent/15 text-accent",
  read: "bg-muted text-muted-foreground",
  replied: "bg-emerald/15 text-emerald",
  archived: "bg-muted text-muted-foreground/60",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageList({ messages }: { messages: Message[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all"
    ? messages
    : messages.filter((m) => m.status === filter);

  return (
    <div className="flex flex-col gap-4">
      {/* Filter tabs */}
      <div className="flex gap-2">
        {["all", "unread", "read", "replied", "archived"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-md px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide transition-colors",
              filter === f
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {f}
            {f !== "all" && (
              <span className="ml-1 opacity-60">
                {messages.filter((m) => f === "all" || m.status === f).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Message list */}
      <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No messages in this category.
          </p>
        ) : (
          filtered.map((msg) => (
            <MessageRow
              key={msg.id}
              message={msg}
              isExpanded={expandedId === msg.id}
              onToggle={() =>
                setExpandedId(expandedId === msg.id ? null : msg.id)
              }
            />
          ))
        )}
      </div>
    </div>
  );
}

function MessageRow({
  message: msg,
  isExpanded,
  onToggle,
}: {
  message: Message;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  function handleStatus(status: string) {
    startTransition(async () => {
      await updateMessageStatus(msg.id, status);
    });
  }

  function handleDelete() {
    if (!confirm("Delete this message permanently?")) return;
    startTransition(async () => {
      await deleteMessage(msg.id);
    });
  }

  return (
    <div className={cn("transition-colors", msg.status === "unread" && "bg-accent/5")}>
      {/* Summary row */}
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-4 px-4 py-3 text-left sm:px-6"
        disabled={isPending}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn("font-medium text-sm", msg.status === "unread" && "text-foreground")}>
              {msg.name}
            </span>
            <span className={cn("rounded-full px-2 py-0.5 font-mono text-[10px] uppercase", statusColors[msg.status] ?? statusColors.read)}>
              {msg.status}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {msg.email}
          </p>
        </div>
        <p className="hidden max-w-xs truncate text-sm text-muted-foreground sm:block">
          {msg.message}
        </p>
        <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
          {formatDate(msg.created_at)}
        </span>
        <span className="shrink-0 text-muted-foreground">{isExpanded ? "−" : "+"}</span>
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="border-t border-border px-4 py-4 sm:px-6">
          <div className="mb-4 grid gap-2 sm:grid-cols-[100px_1fr]">
            <span className="font-mono text-[10px] uppercase text-muted-foreground">From</span>
            <span className="text-sm">{msg.name} &lt;{msg.email}&gt;</span>
            <span className="font-mono text-[10px] uppercase text-muted-foreground">Date</span>
            <span className="text-sm">{formatDate(msg.created_at)}</span>
          </div>
          <div className="rounded-md bg-muted p-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.message}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {msg.status === "unread" && (
              <Button size="sm" variant="outline" onClick={() => handleStatus("read")} disabled={isPending}>
                Mark as read
              </Button>
            )}
            {msg.status !== "replied" && (
              <Button size="sm" variant="outline" onClick={() => handleStatus("replied")} disabled={isPending}>
                Mark as replied
              </Button>
            )}
            {msg.status !== "archived" && (
              <Button size="sm" variant="outline" onClick={() => handleStatus("archived")} disabled={isPending}>
                Archive
              </Button>
            )}
            <a
              href={`mailto:${msg.email}?subject=Re: Your message on fadaeixlii.com`}
              className="inline-flex items-center gap-1 rounded-md bg-accent px-3 py-1.5 text-xs text-background transition-opacity hover:opacity-90"
            >
              Reply via email
            </a>
            <Button size="sm" variant="ghost" onClick={handleDelete} disabled={isPending} className="ml-auto text-destructive hover:text-destructive">
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
