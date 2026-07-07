"use client"; // needs setInterval + state for live clock

import { useEffect, useState } from "react";

const athens = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Athens",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const mashhad = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Tehran",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function WorldClock() {
  const [times, setTimes] = useState<{ ath: string; mhd: string } | null>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimes({ ath: athens.format(now), mhd: mashhad.format(now) });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  if (!times) return null;

  return (
    <span className="font-mono text-xs tabular-nums tracking-widest text-muted-foreground">
      <span className="text-accent">ATH</span> {times.ath}
      <span className="mx-1.5 text-border-strong">·</span>
      <span className="text-accent">MHD</span> {times.mhd}
    </span>
  );
}
