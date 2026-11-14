import { judgeTransfers, type Log, type Paid, type PayCode, type Want } from "@/lib/shop/evm";

/** The slice of TronGrid's `/wallet/gettransactioninfobyid` answer we read.
 *  Log fields are bare hex: `address` is the 20-byte contract (no 41 prefix),
 *  `topics` and `data` carry no 0x. */
export type TronTxInfo = {
  id?: string;
  blockNumber?: number;
  /** Milliseconds, unlike Ethereum's seconds. */
  blockTimeStamp?: number;
  receipt?: { result?: string };
  log?: Log[];
};

export function checkTronTxInfo(
  info: TronTxInfo,
  want: Want,
): (Paid & { paidAtMs: number }) | { code: PayCode } {
  // TronGrid answers `{}` for a hash it has never seen or not yet put in a block.
  if (!info.id || info.blockNumber === undefined || info.blockTimeStamp === undefined) {
    return { code: "not_found" };
  }
  if (info.receipt?.result !== "SUCCESS") return { code: "tx_failed" };
  const verdict = judgeTransfers(info.log ?? [], want);
  return "code" in verdict
    ? verdict
    : { ...verdict, block: info.blockNumber, paidAtMs: info.blockTimeStamp };
}

/** Lowercased bare hash (Tron txids carry no 0x; a pasted one is stripped). */
export function normalizeTronHash(input: string): string | null {
  const hash = input.trim().toLowerCase().replace(/^0x/, "");
  return /^[0-9a-f]{64}$/.test(hash) ? hash : null;
}
