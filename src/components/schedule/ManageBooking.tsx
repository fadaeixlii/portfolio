"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Surface } from "@/components/primitives/Surface";
import { Button } from "@/components/primitives/Button";
import { Link } from "@/lib/i18n/navigation";

type Booking = {
  id: string;
  start_at: string;
  end_at: string;
  name: string;
  email: string;
  topic: string | null;
  notes: string | null;
  meet_url: string | null;
  status: string;
};

type LoadState =
  | { kind: "loading" }
  | { kind: "not_found" }
  | { kind: "ready"; booking: Booking };

/**
 * Client-fetched: the booking belongs to whoever holds the token, not to a
 * signed-in session, so there's nothing for the server component wrapping
 * this to know ahead of time. A bad token and a missing booking answer
 * identically — never a hint that the id existed.
 */
export function ManageBooking({ token }: { token: string }) {
  const t = useTranslations("schedule.manage");
  const locale = useLocale();
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/booking/${token}`)
      .then(async (res) => {
        if (!active) return;
        if (!res.ok) {
          setState({ kind: "not_found" });
          return;
        }
        const booking = (await res.json()) as Booking;
        setState({ kind: "ready", booking });
      })
      .catch(() => {
        if (active) setState({ kind: "not_found" });
      });
    return () => {
      active = false;
    };
  }, [token]);

  async function cancel() {
    setCancelling(true);
    try {
      const res = await fetch(`/api/booking/${token}`, { method: "DELETE" });
      if (res.ok) {
        setState((s) => (s.kind === "ready" ? { kind: "ready", booking: { ...s.booking, status: "cancelled" } } : s));
      }
    } finally {
      setCancelling(false);
    }
  }

  if (state.kind === "loading") {
    return (
      <Surface variant="flat" className="p-[var(--space-8)]">
        <p className="text-[length:var(--text-sm)] text-dim">{t("loading")}</p>
      </Surface>
    );
  }

  if (state.kind === "not_found") {
    return (
      <Surface variant="flat" className="flex flex-col gap-[var(--space-4)] p-[var(--space-8)]">
        <p className="text-[length:var(--text-lg)]">{t("notFoundHeading")}</p>
        <p className="text-dim">{t("notFoundBody")}</p>
        <Link href="/schedule" className="text-signal hover:underline">
          {t("backHome")}
        </Link>
      </Surface>
    );
  }

  const { booking } = state;
  const when = new Intl.DateTimeFormat(locale, {
    dateStyle: "full",
    timeStyle: "short",
    calendar: "gregory",
  }).format(
    new Date(booking.start_at),
  );
  const cancelled = booking.status === "cancelled";

  return (
    <Surface variant="flat" className="flex flex-col gap-[var(--space-4)] p-[var(--space-8)]">
      <p className="text-[length:var(--text-lg)]">{t("heading")}</p>
      <p className="font-mono text-[length:var(--text-sm)] tabular-nums text-dim">{when}</p>
      {booking.topic ? <p className="text-dim">{booking.topic}</p> : null}
      {booking.meet_url && !cancelled ? (
        <a
          href={booking.meet_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-signal hover:underline"
        >
          {booking.meet_url}
        </a>
      ) : null}
      {cancelled ? (
        <p className="text-dim">{t("cancelled")}</p>
      ) : (
        <Button type="button" variant="outline" loading={cancelling} onClick={cancel}>
          {t("cancel")}
        </Button>
      )}
    </Surface>
  );
}
