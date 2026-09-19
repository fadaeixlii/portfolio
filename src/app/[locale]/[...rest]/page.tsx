import { notFound } from "next/navigation";

// Catches any path under a locale that matches no other route so that
// Next renders the nearest not-found boundary — [locale]/not-found.tsx —
// inside the locale layout instead of falling through to the unstyled
// root 404.
export default function CatchAll() {
  notFound();
}
