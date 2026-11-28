import "server-only";
import { createHash } from "node:crypto";
import { clientIp } from "@/lib/http/client-ip";

/** "The same person, today": a peppered sha256 of the IP and the UTC date,
 *  so it changes every day and the IP itself is never stored. Shared by the
 *  shop's visit counter and the free-PDF form's per-visitor limit. */
export function dailyVisitor(request: Request): string {
  const day = new Date().toISOString().slice(0, 10);
  return createHash("sha256")
    .update(`${process.env.SESSION_SECRET ?? ""}|${clientIp(request)}|${day}`)
    .digest("hex")
    .slice(0, 16);
}
