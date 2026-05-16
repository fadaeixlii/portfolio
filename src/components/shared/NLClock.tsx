"use client"; // needs setInterval + state for live clock

import { useEffect, useState } from "react";

const formatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Amsterdam",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const tzFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Amsterdam",
  timeZoneName: "short",
});

function getTimezoneLabel(): string {
  const parts = tzFormatter.formatToParts(new Date());
  const tz = parts.find((p) => p.type === "timeZoneName");
  return tz?.value ?? "CET";
}

export function NLClock() {
  const [time, setTime] = useState("");
  const [tz, setTz] = useState("");

  useEffect(() => {
    const update = () => {
      setTime(formatter.format(new Date()));
      setTz(getTimezoneLabel());
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  if (!time) return null;

  return (
    <span className="font-mono text-xs tabular-nums tracking-widest text-muted-foreground">
      {time}{" "}
      <span className="text-accent">{tz}</span>
    </span>
  );
}
