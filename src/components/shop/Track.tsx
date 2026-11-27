"use client";

import { useEffect, type ComponentProps } from "react";

/** Fire-and-forget to /api/shop/event. A string body goes out as text/plain,
 *  which every browser's sendBeacon accepts without a preflight. */
function beacon(body: Record<string, string>) {
  try {
    navigator.sendBeacon?.("/api/shop/event", JSON.stringify(body));
  } catch {
    // Counting is a nice-to-have; the page never depends on it.
  }
}

/** Counts one visit to a shop page (no cookies; see the privacy page). */
export function TrackVisit({ productId }: { productId: string }) {
  useEffect(() => {
    let referrer = "";
    try {
      referrer = document.referrer ? new URL(document.referrer).hostname : "";
    } catch {}
    beacon({ kind: "visit", productId, referrer, locale: document.documentElement.lang });
  }, [productId]);
  return null;
}

/** The WhatsApp button, which also counts the tap. */
export function WhatsAppLink({ productId, onClick, ...props }: ComponentProps<"a"> & { productId: string }) {
  return (
    <a
      {...props}
      onClick={(event) => {
        beacon({ kind: "whatsapp", productId });
        onClick?.(event);
      }}
    />
  );
}

/** A free product's download link, which also counts the tap. */
export function DownloadLink({ productId, ...props }: ComponentProps<"a"> & { productId: string }) {
  return <a {...props} download onClick={() => beacon({ kind: "download", productId })} />;
}
