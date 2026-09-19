"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { MOTION, useMotionSafe } from "@/lib/motion";

/** 0 idle · 1 grid drawn · 2 counters running · 3 headline resolved */
type Stage = 0 | 1 | 2 | 3;

const BootContext = createContext<Stage>(3);

export function useBootStage(): Stage {
  return useContext(BootContext);
}

/**
 * The site's single orchestrated, non-user-triggered motion moment.
 * Runs once per session — a sequence that replays on every visit stops
 * reading as an instrument warming up and starts reading as a loading screen.
 */
export function BootSequence({ children }: { children: React.ReactNode }) {
  const safe = useMotionSafe();
  const [stage, setStage] = useState<Stage>(0);

  useEffect(() => {
    const alreadyBooted = sessionStorage.getItem("booted") === "1";
    if (!safe || alreadyBooted) {
      // Deferred to a timer, not called synchronously in the effect body —
      // matches the react-hooks/set-state-in-effect pattern used elsewhere
      // (see Readout.tsx): an external-timer callback, not a direct call.
      const timer = setTimeout(() => setStage(3), 0);
      return () => clearTimeout(timer);
    }
    sessionStorage.setItem("booted", "1");

    const timers = [
      setTimeout(() => setStage(1), 80),
      setTimeout(() => setStage(2), MOTION.boot.grid * 1000),
      setTimeout(
        () => setStage(3),
        (MOTION.boot.grid + MOTION.boot.counters) * 1000,
      ),
    ];
    return () => timers.forEach(clearTimeout);
  }, [safe]);

  return <BootContext.Provider value={stage}>{children}</BootContext.Provider>;
}
