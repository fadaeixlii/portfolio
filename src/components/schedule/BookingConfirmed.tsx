"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/primitives/Button";
import { buildIcs } from "@/lib/calendar/ics";

export function BookingConfirmed({
  start,
  end,
  name,
  topic,
  notes,
  meetUrl,
  manageToken,
  timeZone,
}: {
  start: string;
  end: string;
  name: string;
  topic?: string;
  notes?: string;
  meetUrl: string | null;
  manageToken: string;
  timeZone: string;
}) {
  const t = useTranslations("schedule.confirmed");
  const locale = useLocale();

  const when = new Intl.DateTimeFormat(locale, {
    timeZone,
    dateStyle: "full",
    timeStyle: "short",
    // Gregorian explicitly — "fa" otherwise defaults to the Jalali calendar,
    // which would print a different date than the one just booked.
    calendar: "gregory",
  }).format(new Date(start));

  function downloadIcs() {
    const ics = buildIcs({
      id: manageToken,
      start_at: start,
      end_at: end,
      name,
      topic: topic ?? null,
      notes: notes ?? null,
      meet_url: meetUrl,
    });
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "call.ics";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <p className="text-[length:var(--text-lg)]">{t("heading")}</p>
      <p className="font-mono text-[length:var(--text-sm)] tabular-nums text-dim">{when}</p>

      <div className="flex flex-wrap gap-[var(--space-3)]">
        {meetUrl ? (
          <a
            href={meetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={
              "inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-full)] " +
              "bg-signal-fill px-6 text-[length:var(--text-base)] font-medium text-signal-ink " +
              "transition-[transform,filter] duration-[var(--dur-fast)] ease-[var(--ease-out)] " +
              "hover:brightness-110 active:translate-y-px"
            }
          >
            {t("joinMeet")}
          </a>
        ) : null}
        <Button type="button" variant="outline" onClick={downloadIcs}>
          {t("addToCalendar")}
        </Button>
        <Link
          href={`/schedule/manage/${manageToken}`}
          className="inline-flex h-11 items-center px-6 text-[length:var(--text-base)] text-dim hover:text-signal-text"
        >
          {t("manage")}
        </Link>
      </div>
    </div>
  );
}
