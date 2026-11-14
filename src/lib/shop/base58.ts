import { createHash } from "node:crypto";

// Base58Check, the encoding behind Tron's `T...` addresses. Enough of it to
// turn an address into the 21-byte hex that on-chain logs carry — a dozen
// lines instead of a dependency.

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const BASE = BigInt(58);

const checksum = (payload: Buffer) =>
  createHash("sha256").update(createHash("sha256").update(payload).digest()).digest().subarray(0, 4);

export function base58CheckDecode(text: string): Buffer {
  let n = BigInt(0);
  for (const char of text) {
    const digit = ALPHABET.indexOf(char);
    if (digit < 0) throw new Error("invalid base58 character");
    n = n * BASE + BigInt(digit);
  }
  let hex = n > BigInt(0) ? n.toString(16) : "";
  if (hex.length % 2) hex = `0${hex}`;
  // Each leading "1" is a leading zero byte the number itself cannot carry.
  const zeros = text.length - text.replace(/^1+/, "").length;
  const bytes = Buffer.concat([Buffer.alloc(zeros), Buffer.from(hex, "hex")]);
  if (bytes.length < 5) throw new Error("base58check too short");

  const payload = bytes.subarray(0, -4);
  if (!checksum(payload).equals(bytes.subarray(-4))) throw new Error("bad base58check checksum");
  return payload;
}

export function base58CheckEncode(payload: Buffer): string {
  const bytes = Buffer.concat([payload, checksum(payload)]);
  let n = BigInt(`0x${bytes.toString("hex")}`);
  let text = "";
  while (n > BigInt(0)) {
    text = ALPHABET[Number(n % BASE)] + text;
    n /= BASE;
  }
  for (const byte of bytes) {
    if (byte !== 0) break;
    text = `1${text}`;
  }
  return text;
}

/** `T...` address → "41" + 20-byte hex, the form Tron nodes use internally. */
export function tronToHex(address: string): string {
  const payload = base58CheckDecode(address);
  if (payload.length !== 21 || payload[0] !== 0x41) throw new Error("not a Tron address");
  return payload.toString("hex");
}
