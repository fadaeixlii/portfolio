import "server-only";
import { SHOP_CHAINS, SHOP_RULES, type Chain, type Token } from "@/content/shop";
import { tronToHex } from "@/lib/shop/base58";
import { checkEvmReceipt, checkTiming, type EvmReceipt, type PayCode } from "@/lib/shop/evm";
import { checkTronTxInfo, type TronTxInfo } from "@/lib/shop/tron";

// The fetch half of payment verification: public nodes over plain JSON, no
// SDK, no paid API. Every decision is made by the pure functions in evm.ts /
// tron.ts. Any network or node failure throws; the route turns that into
// `rpc_error`.

const TIMEOUT_MS = 8000;

export type PaymentOrder = {
  chain: Chain;
  token: Token;
  /** Base units, as Postgres hands back a bigint (string). */
  amount: string | number;
  createdAt: string | Date;
};

export async function verifyPayment(
  order: PaymentOrder,
  txHash: string,
): Promise<{ amount: bigint } | { code: PayCode }> {
  const chain = SHOP_CHAINS[order.chain];
  const token = chain.tokens[order.token];
  if (!token) throw new Error(`no ${order.token} on ${order.chain}`);

  const tron = order.chain === "tron";
  const want = {
    contract: tron ? tronToHex(token.contract) : token.contract,
    wallet: tron ? tronToHex(chain.wallet) : chain.wallet,
    amount: BigInt(order.amount),
  };
  const timing = {
    minConfirmations: chain.minConfirmations,
    orderCreatedMs: new Date(order.createdAt).getTime(),
    graceMs: SHOP_RULES.paymentBeforeOrderGraceMs,
  };

  if (tron) {
    const info = await tronPost<TronTxInfo>("/wallet/gettransactioninfobyid", { value: txHash });
    const paid = checkTronTxInfo(info, want);
    if ("code" in paid) return paid;
    const now = await tronPost<{ block_header?: { raw_data?: { number?: number } } }>(
      "/wallet/getnowblock",
      {},
    );
    const head = now.block_header?.raw_data?.number;
    if (head === undefined) throw new Error("tron getnowblock: no block number");
    const code = checkTiming({ ...timing, block: paid.block, head, paidAtMs: paid.paidAtMs });
    return code ? { code } : { amount: paid.amount };
  }

  const receipt = await ethRpc<EvmReceipt | null>("eth_getTransactionReceipt", [txHash]);
  const paid = checkEvmReceipt(receipt, want);
  if ("code" in paid) return paid;
  const [head, block] = await Promise.all([
    ethRpc<string>("eth_blockNumber", []),
    ethRpc<{ timestamp: string } | null>("eth_getBlockByNumber", [`0x${paid.block.toString(16)}`, false]),
  ]);
  // A receipt whose block is gone is a reorg in progress — let them retry.
  if (!block) throw new Error("eth block for receipt not found");
  const code = checkTiming({
    ...timing,
    block: paid.block,
    head: Number(head),
    paidAtMs: Number(block.timestamp) * 1000,
  });
  return code ? { code } : { amount: paid.amount };
}

async function ethRpc<T>(method: string, params: unknown[]): Promise<T> {
  const res = await fetch(process.env.ETH_RPC_URL ?? "https://ethereum-rpc.publicnode.com", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`eth ${method}: http ${res.status}`);
  const json = (await res.json()) as { result?: T; error?: { message?: string } };
  if (json.error) throw new Error(`eth ${method}: ${json.error.message}`);
  return json.result as T;
}

async function tronPost<T>(path: string, body: unknown): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (process.env.TRON_PRO_API_KEY) headers["TRON-PRO-API-KEY"] = process.env.TRON_PRO_API_KEY;
  const res = await fetch(`${process.env.TRON_API_URL ?? "https://api.trongrid.io"}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`tron ${path}: http ${res.status}`);
  return (await res.json()) as T;
}
