"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations, useLocale } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Surface } from "@/components/primitives/Surface";
import { Button } from "@/components/primitives/Button";
import { MOTION, EASE, useMotionSafe } from "@/lib/motion";
import { useVisitorTimeZone, useTodayKey } from "@/hooks/useVisitorTimeZone";
import { SCHEDULE_CONFIG } from "@/lib/calendar/config";
import { bookingFormSchema, type BookingFormValues } from "@/lib/calendar/schema";
import { TimezonePicker } from "./TimezonePicker";
import { MonthGrid } from "./MonthGrid";
import { SlotList, type SlotOption } from "./SlotList";
import { BookingForm } from "./BookingForm";
import { BookingConfirmed } from "./BookingConfirmed";

type Step = "month" | "day" | "slot" | "form" | "confirmed";

type MonthEntry =
  | { status: "ready"; slots: string[] }
  | { status: "error"; kind: "unavailable" | "network" };

type FlowNotice = "slot_taken" | "rate_limited" | "server" | "network" | null;

type Confirmed = {
  start: string;
  end: string;
  name: string;
  topic?: string;
  notes?: string;
  meetUrl: string | null;
  manageToken: string;
};

const DAY_MS = 86_400_000;

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** The booking flow: month → day → slot → form → confirmed, one Surface,
 *  steps swapping via a layout transition so the panel measures rather than
 *  jumps. Every failure mode below stays visible and actionable — see the
 *  branches inside `content`. */
export function Booker() {
  const t = useTranslations("schedule");
  const locale = useLocale();
  const safe = useMotionSafe();

  const detectedTz = useVisitorTimeZone();
  const [tzOverride, setTzOverride] = useState<string | null>(null);
  const timeZone = tzOverride ?? detectedTz;

  // "1970-01-01" until the client mounts (see useTodayKey) — treated as the
  // single mounted flag for this whole component, so no calendar math runs
  // against the build-time server clock.
  const todayKey = useTodayKey(timeZone);
  const mounted = todayKey !== "1970-01-01";

  const [monthOffset, setMonthOffset] = useState(0);
  const [step, setStep] = useState<Step>("month");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [notice, setNotice] = useState<FlowNotice>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<Confirmed | null>(null);
  const [monthCache, setMonthCache] = useState<Record<string, MonthEntry>>({});

  const [baseYear, baseMonth1] = todayKey.split("-").map(Number);
  const cursorIndex = baseMonth1 - 1 + monthOffset;
  const year = baseYear + Math.floor(cursorIndex / 12);
  const month = ((cursorIndex % 12) + 12) % 12;
  const monthKey = mounted ? `${year}-${pad2(month + 1)}` : null;
  const entry = monthKey ? monthCache[monthKey] : undefined;

  // Pure calendar-date arithmetic on `todayKey`, not a fresh `Date.now()` —
  // the latter is impure and disallowed in render by the React compiler.
  const horizonKey = useMemo(() => {
    const [y, m, d] = todayKey.split("-").map(Number);
    return new Intl.DateTimeFormat("en-CA", { timeZone: "UTC" }).format(
      new Date(Date.UTC(y, m - 1, d + SCHEDULE_CONFIG.horizonDays)),
    );
  }, [todayKey]);

  const [horizonYear, horizonMonth1] = horizonKey.split("-").map(Number);
  const horizonOffset = (horizonYear - baseYear) * 12 + (horizonMonth1 - baseMonth1);
  const canGoPrev = monthOffset > 0;
  const canGoNext = monthOffset < horizonOffset;

  // Bumped by `retryMonth` to force the effect below to run again even when
  // `monthKey` hasn't changed — clearing the cache entry alone doesn't do
  // that, since the effect only reruns when a *dependency* changes, and
  // `monthCache` is deliberately not one (see the comment on the effect).
  const [refetchToken, setRefetchToken] = useState(0);

  useEffect(() => {
    if (!monthKey || monthCache[monthKey]) return;
    const controller = new AbortController();
    // fetch() has no built-in timeout — a slow or wedged calendar backend
    // would otherwise leave the visitor on "Loading the calendar" forever,
    // with no error state to recover from. 10s treats "still nothing" the
    // same as a real network failure: a retry button, not an endless wait.
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 10_000);

    const from = new Date(Date.UTC(year, month, 1));
    const nextMonthStart = new Date(
      Date.UTC(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1, 1),
    );
    const horizonEnd = new Date(Date.now() + SCHEDULE_CONFIG.horizonDays * DAY_MS);
    const to = nextMonthStart < horizonEnd ? nextMonthStart : horizonEnd;

    fetch(
      `/api/availability?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`,
      { signal: controller.signal },
    )
      .then(async (res) => {
        if (res.status === 503) {
          setMonthCache((c) => ({ ...c, [monthKey]: { status: "error", kind: "unavailable" } }));
          return;
        }
        if (!res.ok) {
          setMonthCache((c) => ({ ...c, [monthKey]: { status: "error", kind: "network" } }));
          return;
        }
        const data = (await res.json()) as { slots: string[] };
        setMonthCache((c) => ({ ...c, [monthKey]: { status: "ready", slots: data.slots } }));
      })
      .catch(() => {
        // Aborted for a reason other than the timeout (unmount, deps
        // changed) — a fresh effect run already owns the next fetch.
        if (controller.signal.aborted && !timedOut) return;
        setMonthCache((c) => ({ ...c, [monthKey]: { status: "error", kind: "network" } }));
      })
      .finally(() => clearTimeout(timeout));
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
    // monthCache is read only to guard against refetching what we already
    // have — listing it would refetch on every write it just made.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthKey, year, month, refetchToken]);

  function retryMonth() {
    if (!monthKey) return;
    setMonthCache((c) => {
      const next = { ...c };
      delete next[monthKey];
      return next;
    });
    setRefetchToken((n) => n + 1);
  }

  const datesWithSlots = useMemo(() => {
    const set = new Set<string>();
    if (entry?.status === "ready") {
      for (const iso of entry.slots) {
        set.add(new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date(iso)));
      }
    }
    return set;
  }, [entry, timeZone]);

  // `calendar: "gregory"` everywhere below: the grid's own math (day
  // numbers, month length) is plain Gregorian, and "fa" otherwise defaults
  // to the Jalali calendar for Intl's date *components* — mismatching a
  // Gregorian day grid under a Jalali month heading. Persian numerals still
  // come through via the locale's default numbering system; only the
  // calendar system is pinned.
  const weekdayLabels = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) =>
        new Intl.DateTimeFormat(locale, {
          weekday: "short",
          timeZone: "UTC",
          calendar: "gregory",
        }).format(new Date(Date.UTC(2024, 0, 1 + i))),
      ),
    [locale],
  );

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
        calendar: "gregory",
      }).format(new Date(Date.UTC(year, month, 1))),
    [locale, year, month],
  );

  const dayHeading = useMemo(() => {
    if (!selectedDate) return "";
    return new Intl.DateTimeFormat(locale, {
      weekday: "long",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
      calendar: "gregory",
    }).format(new Date(`${selectedDate}T00:00:00Z`));
  }, [selectedDate, locale]);

  function labelForDay(key: string, disabled: boolean): string {
    const formatted = new Intl.DateTimeFormat(locale, {
      weekday: "long",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
      calendar: "gregory",
    }).format(new Date(`${key}T00:00:00Z`));
    return `${formatted} — ${disabled ? t("month.unavailable") : t("month.available")}`;
  }

  const daySlots: SlotOption[] = useMemo(() => {
    if (!selectedDate || entry?.status !== "ready") return [];
    return entry.slots
      .filter(
        (iso) => new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date(iso)) === selectedDate,
      )
      .map((iso) => ({
        iso,
        visitorLabel: new Intl.DateTimeFormat(locale, {
          hour: "numeric",
          minute: "2-digit",
          timeZone,
        }).format(new Date(iso)),
        hostLabel: new Intl.DateTimeFormat(locale, {
          hour: "numeric",
          minute: "2-digit",
          timeZone: SCHEDULE_CONFIG.timeZone,
        }).format(new Date(iso)),
      }));
  }, [selectedDate, entry, timeZone, locale]);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: { name: "", email: "", topic: "", notes: "", company: "" },
  });

  async function onSubmit(values: BookingFormValues) {
    if (!selectedSlot) return;
    setNotice(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: selectedSlot,
          name: values.name,
          email: values.email,
          topic: values.topic || undefined,
          notes: values.notes || undefined,
          locale,
          visitorTz: timeZone,
          company: values.company || undefined,
        }),
      });

      if (res.status === 409) {
        setNotice("slot_taken");
        retryMonth();
        setSelectedSlot(null);
        setStep("day");
        return;
      }
      if (res.status === 429) {
        setNotice("rate_limited");
        return;
      }
      if (!res.ok) {
        setNotice("server");
        return;
      }

      const data = (await res.json()) as { ok: boolean; meetUrl: string | null; manageToken: string };
      const end = new Date(new Date(selectedSlot).getTime() + SCHEDULE_CONFIG.slotMinutes * 60_000);
      setConfirmed({
        start: selectedSlot,
        end: end.toISOString(),
        name: values.name,
        topic: values.topic,
        notes: values.notes,
        meetUrl: data.meetUrl,
        manageToken: data.manageToken,
      });
      setStep("confirmed");
    } catch {
      setNotice("network");
    } finally {
      setSubmitting(false);
    }
  }

  let content: ReactNode;

  if (!mounted) {
    content = <p className="text-[length:var(--text-sm)] text-dim">{t("loading")}</p>;
  } else if (step === "month") {
    if (!entry) {
      content = <p className="text-[length:var(--text-sm)] text-dim">{t("loading")}</p>;
    } else if (entry.status === "error" && entry.kind === "unavailable") {
      // 503 from availability: never an empty month — the calendar swaps for
      // a plain way to reach Mohammad directly.
      content = (
        <div className="flex flex-col gap-[var(--space-3)]">
          <p className="text-[length:var(--text-sm)] text-error">{t("errors.unavailableHeading")}</p>
          <a
            href={`mailto:${SCHEDULE_CONFIG.contactEmail}`}
            className="text-[length:var(--text-sm)] text-signal hover:underline"
          >
            {t("errors.unavailableAction")}
          </a>
        </div>
      );
    } else if (entry.status === "error") {
      content = (
        <div className="flex flex-col gap-[var(--space-3)]">
          <p className="text-[length:var(--text-sm)] text-error">{t("errors.networkHeading")}</p>
          <Button type="button" variant="outline" size="sm" onClick={retryMonth}>
            {t("errors.retry")}
          </Button>
        </div>
      );
    } else {
      content = (
        <div className="flex flex-col gap-[var(--space-4)]">
          <TimezonePicker value={timeZone} onChange={setTzOverride} />
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!canGoPrev}
              onClick={() => setMonthOffset((o) => o - 1)}
              aria-label={t("month.prev")}
            >
              <ChevronLeft className="size-4 rtl:scale-x-[-1]" aria-hidden />
            </Button>
            <p className="font-mono text-[length:var(--text-sm)] tabular-nums">{monthLabel}</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!canGoNext}
              onClick={() => setMonthOffset((o) => o + 1)}
              aria-label={t("month.next")}
            >
              <ChevronRight className="size-4 rtl:scale-x-[-1]" aria-hidden />
            </Button>
          </div>
          <MonthGrid
            year={year}
            month={month}
            weekdayLabels={weekdayLabels}
            locale={locale}
            datesWithSlots={datesWithSlots}
            selectedDate={selectedDate}
            onSelectDate={(date) => {
              setSelectedDate(date);
              setNotice(null);
              setStep("day");
            }}
            minDate={todayKey}
            maxDate={horizonKey}
            labelForDay={labelForDay}
          />
        </div>
      );
    }
  } else if (step === "day") {
    content = (
      <div className="flex flex-col gap-[var(--space-4)]">
        <button
          type="button"
          onClick={() => setStep("month")}
          className="self-start text-[length:var(--text-sm)] text-dim hover:text-signal"
        >
          {t("day.back")}
        </button>
        <p className="text-[length:var(--text-base)]">{dayHeading}</p>
        {notice === "slot_taken" ? (
          <p role="alert" className="text-[length:var(--text-sm)] text-error">
            {t("errors.slotTaken")}
          </p>
        ) : null}
        {daySlots.length === 0 ? (
          <p className="text-[length:var(--text-sm)] text-dim">{t("day.empty")}</p>
        ) : (
          <SlotList
            slots={daySlots}
            value={selectedSlot}
            onChange={(iso) => {
              setSelectedSlot(iso);
              setNotice(null);
              setStep("slot");
            }}
            groupLabel={t("day.slotsGroup", { count: daySlots.length, date: dayHeading })}
          />
        )}
      </div>
    );
  } else if (step === "slot") {
    const visitorTime = selectedSlot
      ? new Intl.DateTimeFormat(locale, {
          dateStyle: "full",
          timeStyle: "short",
          timeZone,
          calendar: "gregory",
        }).format(new Date(selectedSlot))
      : "";
    const hostTime = selectedSlot
      ? new Intl.DateTimeFormat(locale, { timeStyle: "short", timeZone: SCHEDULE_CONFIG.timeZone }).format(
          new Date(selectedSlot),
        )
      : "";
    content = (
      <div className="flex flex-col gap-[var(--space-4)]">
        <button
          type="button"
          onClick={() => setStep("day")}
          className="self-start text-[length:var(--text-sm)] text-dim hover:text-signal"
        >
          {t("slot.back")}
        </button>
        <p className="text-[length:var(--text-base)]">{visitorTime}</p>
        <p className="font-mono text-[length:var(--text-sm)] tabular-nums text-dim">
          {t("slot.hostLabel")} {hostTime}
        </p>
        <Button type="button" onClick={() => setStep("form")}>
          {t("slot.continue")}
        </Button>
      </div>
    );
  } else if (step === "form") {
    content = (
      <div className="flex flex-col gap-[var(--space-4)]">
        <button
          type="button"
          onClick={() => setStep("slot")}
          className="self-start text-[length:var(--text-sm)] text-dim hover:text-signal"
        >
          {t("form.back")}
        </button>
        <BookingForm
          form={form}
          onSubmit={onSubmit}
          submitting={submitting}
          errorMessage={notice && notice !== "slot_taken" ? t(`errors.${notice}`) : undefined}
        />
      </div>
    );
  } else {
    content = confirmed ? (
      <BookingConfirmed
        start={confirmed.start}
        end={confirmed.end}
        name={confirmed.name}
        topic={confirmed.topic}
        notes={confirmed.notes}
        meetUrl={confirmed.meetUrl}
        manageToken={confirmed.manageToken}
        timeZone={timeZone}
      />
    ) : null;
  }

  return (
    <Surface variant="glass" className="mx-auto max-w-xl p-[var(--space-6)] sm:p-[var(--space-8)]">
      <motion.div layout={safe} transition={{ duration: MOTION.dur.base, ease: EASE.out }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={mounted ? step : "loading"}
            initial={safe ? { opacity: 0, y: 8 } : { opacity: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={safe ? { opacity: 0, y: -8 } : { opacity: 0 }}
            transition={{ duration: MOTION.dur.base, ease: EASE.out }}
          >
            {content}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </Surface>
  );
}
