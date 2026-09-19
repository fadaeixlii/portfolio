import { describe, it, expect, beforeAll } from "vitest";
import { signBookingToken, verifyBookingToken } from "@/lib/calendar/token";

beforeAll(() => {
  process.env.BOOKING_TOKEN_SECRET = "test-secret-do-not-use-in-prod";
});

describe("signBookingToken / verifyBookingToken", () => {
  it("round-trips: a signed token verifies back to the same id", () => {
    const id = "b7f1c2a0-1234-4a5b-8c9d-abcdef012345";
    const token = signBookingToken(id);
    expect(verifyBookingToken(token)).toBe(id);
  });

  it("rejects a token with one flipped byte in the signature", () => {
    const id = "b7f1c2a0-1234-4a5b-8c9d-abcdef012345";
    const token = signBookingToken(id);
    const [payload, mac] = token.split(".");
    // Flip the last character of the MAC — still same length, wrong bytes.
    const flippedChar = mac.at(-1) === "A" ? "B" : "A";
    const tampered = `${payload}.${mac.slice(0, -1)}${flippedChar}`;
    expect(verifyBookingToken(tampered)).toBeNull();
  });

  it("rejects a token with the id changed but the original signature kept", () => {
    const token = signBookingToken("original-id");
    const [, mac] = token.split(".");
    expect(verifyBookingToken(`different-id.${mac}`)).toBeNull();
  });

  it("rejects garbage input with no signature separator", () => {
    expect(verifyBookingToken("not-a-token")).toBeNull();
  });
});
