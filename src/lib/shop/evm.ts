// Pure payment checks over EVM-shaped receipts. No fetch here — rpc.ts
// fetches, these decide. Tron's TVM emits the same log shape (minus the 0x
// prefixes), so tron.ts reuses judgeTransfers and checkTiming.

/** keccak256("Transfer(address,address,uint256)") */
export const TRANSFER_TOPIC = "ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

export type Log = { address: string; topics: string[]; data: string };

/** `contract` and `wallet` are 20-byte hex, any case, with or without 0x
 *  (a Tron "41…" prefix is fine too). `amount` is in token base units. */
export type Want = { contract: string; wallet: string; amount: bigint };

export type PayCode =
  | "not_found"
  | "tx_failed"
  | "wrong_recipient"
  | "wrong_token"
  | "amount_too_low"
  | "not_confirmed_yet"
  | "before_order";

export type Paid = { amount: bigint; block: number };

const bare = (hex: string) => hex.toLowerCase().replace(/^0x/, "");
/** Last 20 bytes: an address, whether it came padded in a topic, bare, or
 *  with Tron's 41 prefix. */
const addr20 = (hex: string) => bare(hex).slice(-40);

/**
 * Sums every Transfer in `logs` that pays `want.wallet` in `want.contract`.
 * If none does, says whether the wallet got some other token (wrong_token)
 * or nothing at all (wrong_recipient).
 */
export function judgeTransfers(logs: Log[], want: Want): { amount: bigint } | { code: PayCode } {
  const toWallet = logs.filter(
    (log) =>
      log.topics.length >= 3 &&
      bare(log.topics[0]) === TRANSFER_TOPIC &&
      addr20(log.topics[2]) === addr20(want.wallet),
  );
  const paying = toWallet.filter((log) => addr20(log.address) === addr20(want.contract));
  if (!paying.length) return { code: toWallet.length ? "wrong_token" : "wrong_recipient" };

  const amount = paying.reduce(
    (sum, log) => sum + BigInt(`0x${bare(log.data).slice(0, 64) || "0"}`),
    BigInt(0),
  );
  // Accept overpayment: exchanges sometimes round the withdrawal up.
  return amount >= want.amount ? { amount } : { code: "amount_too_low" };
}

export type EvmReceipt = { status: string; blockNumber: string; logs: Log[] };

/** `eth_getTransactionReceipt` result → verdict. null = not mined (or unknown). */
export function checkEvmReceipt(receipt: EvmReceipt | null, want: Want): Paid | { code: PayCode } {
  if (!receipt) return { code: "not_found" };
  if (receipt.status !== "0x1") return { code: "tx_failed" };
  const verdict = judgeTransfers(receipt.logs, want);
  return "code" in verdict ? verdict : { ...verdict, block: Number(receipt.blockNumber) };
}

/** Lowercased 0x hash, or null if it is not one. */
export function normalizeEthHash(input: string): string | null {
  const hash = input.trim().toLowerCase();
  return /^0x[0-9a-f]{64}$/.test(hash) ? hash : null;
}

/** Enough blocks on top, and not paid before the order existed (minus a
 *  grace) — the second rule stops anyone claiming an old, public transfer
 *  to the wallet that no order ever used. */
export function checkTiming(t: {
  block: number;
  head: number;
  minConfirmations: number;
  paidAtMs: number;
  orderCreatedMs: number;
  graceMs: number;
}): PayCode | null {
  if (t.head - t.block < t.minConfirmations) return "not_confirmed_yet";
  if (t.paidAtMs < t.orderCreatedMs - t.graceMs) return "before_order";
  return null;
}
