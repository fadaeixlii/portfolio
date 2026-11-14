import { describe, it, expect } from "vitest";
import { base58CheckDecode, base58CheckEncode, tronToHex } from "@/lib/shop/base58";
import {
  TRANSFER_TOPIC,
  checkEvmReceipt,
  checkTiming,
  normalizeEthHash,
  type EvmReceipt,
  type Log,
} from "@/lib/shop/evm";
import { checkTronTxInfo, normalizeTronHash } from "@/lib/shop/tron";

// Hand-built receipts in the exact shapes the public nodes return. No network.

const ETH_WALLET = "0x7f09CbbFcF4C4da5Af810734a5687Fb458c26fb3";
const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const SENDER = "0x1111111111111111111111111111111111111111";
const STRANGER = "0x2222222222222222222222222222222222222222";
const PRICE = BigInt(6_000_000); // 6 USDT, 6 decimals

const word = (hex: string) => hex.replace(/^0x/, "").toLowerCase().padStart(64, "0");

function ethTransfer(contract: string, to: string, amount: number): Log {
  return {
    address: contract.toLowerCase(),
    topics: [`0x${TRANSFER_TOPIC}`, `0x${word(SENDER)}`, `0x${word(to)}`],
    data: `0x${word(amount.toString(16))}`,
  };
}

const receipt = (logs: Log[], status = "0x1"): EvmReceipt => ({
  status,
  blockNumber: "0x1000",
  logs,
});

const ethWant = { contract: USDT, wallet: ETH_WALLET, amount: PRICE };

describe("checkEvmReceipt", () => {
  it("accepts a USDT transfer of the price to the wallet", () => {
    const approval: Log = { ...ethTransfer(USDT, ETH_WALLET, 1), topics: ["0x8c5b", "0x", "0x"] };
    expect(checkEvmReceipt(receipt([approval, ethTransfer(USDT, ETH_WALLET, 6_000_000)]), ethWant)).toEqual({
      amount: PRICE,
      block: 4096,
    });
  });

  it("accepts overpayment", () => {
    expect(checkEvmReceipt(receipt([ethTransfer(USDT, ETH_WALLET, 6_100_000)]), ethWant)).toEqual({
      amount: BigInt(6_100_000),
      block: 4096,
    });
  });

  it("rejects a transfer to someone else", () => {
    expect(checkEvmReceipt(receipt([ethTransfer(USDT, STRANGER, 6_000_000)]), ethWant)).toEqual({
      code: "wrong_recipient",
    });
  });

  it("rejects the right wallet paid in the wrong token", () => {
    expect(checkEvmReceipt(receipt([ethTransfer(USDC, ETH_WALLET, 6_000_000)]), ethWant)).toEqual({
      code: "wrong_token",
    });
  });

  it("rejects an amount below the price", () => {
    expect(checkEvmReceipt(receipt([ethTransfer(USDT, ETH_WALLET, 5_999_999)]), ethWant)).toEqual({
      code: "amount_too_low",
    });
  });

  it("rejects a reverted transaction even if it carries a matching log", () => {
    expect(
      checkEvmReceipt(receipt([ethTransfer(USDT, ETH_WALLET, 6_000_000)], "0x0"), ethWant),
    ).toEqual({ code: "tx_failed" });
  });

  it("reports an unmined hash as not_found", () => {
    expect(checkEvmReceipt(null, ethWant)).toEqual({ code: "not_found" });
  });
});

describe("checkTronTxInfo", () => {
  const usdtHex = tronToHex("TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t");
  const walletHex = tronToHex("TMchjoJ4uSYekSrQea95jAfEJkhSPFhd3W");
  const tronWant = { contract: usdtHex, wallet: walletHex, amount: PRICE };

  // TronGrid's log: 20-byte contract without the 41 prefix, bare-hex topics.
  const tronLog = (toHex: string, amount: number): Log => ({
    address: usdtHex.slice(2),
    topics: [TRANSFER_TOPIC, word(SENDER), word(toHex.slice(-40))],
    data: word(amount.toString(16)),
  });
  const info = (log: Log[], result = "SUCCESS") => ({
    id: "ab".repeat(32),
    blockNumber: 70_000_000,
    blockTimeStamp: 1_763_000_000_000,
    receipt: { result },
    log,
  });

  it("accepts a USDT transfer of the price to the wallet", () => {
    expect(checkTronTxInfo(info([tronLog(walletHex, 6_000_000)]), tronWant)).toEqual({
      amount: PRICE,
      block: 70_000_000,
      paidAtMs: 1_763_000_000_000,
    });
  });

  it("rejects a transfer to someone else", () => {
    expect(checkTronTxInfo(info([tronLog(STRANGER, 6_000_000)]), tronWant)).toEqual({
      code: "wrong_recipient",
    });
  });

  it("rejects a failed transaction", () => {
    expect(checkTronTxInfo(info([tronLog(walletHex, 6_000_000)], "REVERT"), tronWant)).toEqual({
      code: "tx_failed",
    });
  });

  it("reads TronGrid's empty answer as not_found", () => {
    expect(checkTronTxInfo({}, tronWant)).toEqual({ code: "not_found" });
  });
});

describe("checkTiming", () => {
  const base = { block: 100, minConfirmations: 6, orderCreatedMs: 1_000_000_000, graceMs: 600_000 };

  it("waits for confirmations", () => {
    expect(checkTiming({ ...base, head: 105, paidAtMs: base.orderCreatedMs })).toBe("not_confirmed_yet");
    expect(checkTiming({ ...base, head: 106, paidAtMs: base.orderCreatedMs })).toBeNull();
  });

  it("allows a payment just inside the grace window and rejects one before it", () => {
    expect(checkTiming({ ...base, head: 200, paidAtMs: base.orderCreatedMs - 600_000 })).toBeNull();
    expect(checkTiming({ ...base, head: 200, paidAtMs: base.orderCreatedMs - 600_001 })).toBe("before_order");
  });
});

describe("tx hash formats", () => {
  const hex = "AB".repeat(32);

  it("normalises an Ethereum hash and rejects a bare one", () => {
    expect(normalizeEthHash(` 0x${hex} `)).toBe(`0x${hex.toLowerCase()}`);
    expect(normalizeEthHash(hex)).toBeNull();
  });

  it("normalises a Tron txid with or without 0x and rejects a short one", () => {
    expect(normalizeTronHash(hex)).toBe(hex.toLowerCase());
    expect(normalizeTronHash(`0x${hex}`)).toBe(hex.toLowerCase());
    expect(normalizeTronHash(hex.slice(2))).toBeNull();
  });
});

describe("base58check", () => {
  it("decodes the two real Tron addresses to 41-prefixed hex and back", () => {
    for (const address of ["TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", "TMchjoJ4uSYekSrQea95jAfEJkhSPFhd3W"]) {
      const hex = tronToHex(address);
      expect(hex).toMatch(/^41[0-9a-f]{40}$/);
      expect(base58CheckEncode(Buffer.from(hex, "hex"))).toBe(address);
    }
  });

  it("matches the published hex of the USDT TRC-20 contract", () => {
    expect(tronToHex("TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t")).toBe(
      "41a614f803b6fd780986a42c78ec9c7f77e6ded13c",
    );
  });

  it("rejects a typo through the checksum", () => {
    expect(() => base58CheckDecode("TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6u")).toThrow();
  });
});
