import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/** Opaque, unguessable handle for cancel and reschedule links. */
export function signBookingToken(id: string): string {
  const mac = createHmac("sha256", process.env.BOOKING_TOKEN_SECRET!)
    .update(id)
    .digest("base64url");
  return `${id}.${mac}`;
}

export function verifyBookingToken(token: string): string | null {
  const dot = token.lastIndexOf(".");
  if (dot < 0) return null;
  const id = token.slice(0, dot);
  const given = Buffer.from(token.slice(dot + 1));
  const expected = Buffer.from(
    createHmac("sha256", process.env.BOOKING_TOKEN_SECRET!)
      .update(id)
      .digest("base64url"),
  );
  if (given.length !== expected.length) return null;
  return timingSafeEqual(given, expected) ? id : null;
}
