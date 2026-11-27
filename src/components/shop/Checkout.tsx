"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/primitives/Button";
import { Field } from "@/components/primitives/Field";
import { cn } from "@/lib/cn";
import { SHOP_CHAINS, SHOP_PRODUCTS, SHOP_RULES, type Chain, type PaidProductId, type Token } from "@/content/shop";

type Order = { orderId: string; address: string; amount: string; token: Token; chain: Chain };

/** Every code the shop routes answer with that has its own message. */
const NOTICES = [
  "invalid",
  "invalid_hash",
  "order_not_found",
  "already_used",
  "not_found",
  "not_confirmed_yet",
  "wrong_recipient",
  "wrong_token",
  "amount_too_low",
  "tx_failed",
  "before_order",
  "rpc_error",
  "rate_limited",
  "server",
  "network",
] as const;
type Notice = (typeof NOTICES)[number];

const asNotice = (code: unknown): Notice =>
  NOTICES.includes(code as Notice) ? (code as Notice) : "server";

async function post(url: string, body: unknown): Promise<Record<string, unknown>> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) throw asNotice(json.error);
  return json;
}

/**
 * Stablecoin checkout for one product: pick network and token, get the
 * address and exact amount, paste the transaction hash, get the download.
 * Unstyled beyond the primitives on purpose — the page around it comes later.
 */
export function Checkout({ productId }: { productId: PaidProductId }) {
  const t = useTranslations("shop");
  const product = SHOP_PRODUCTS[productId];
  const [chain, setChain] = useState<Chain>("eth");
  const [token, setToken] = useState<Token>("USDT");
  const [order, setOrder] = useState<Order | null>(null);
  const [txHash, setTxHash] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const tokens = Object.keys(SHOP_CHAINS[chain].tokens) as Token[];

  function pickChain(next: Chain) {
    setChain(next);
    if (!SHOP_CHAINS[next].tokens[token]) setToken("USDT");
    setOrder(null);
    setNotice(null);
  }

  function pickToken(next: Token) {
    setToken(next);
    setOrder(null);
    setNotice(null);
  }

  async function run(action: () => Promise<void>) {
    setNotice(null);
    setBusy(true);
    try {
      await action();
    } catch (error) {
      setNotice(typeof error === "string" ? asNotice(error) : "network");
    } finally {
      setBusy(false);
    }
  }

  const startOrder = () =>
    run(async () => {
      setOrder((await post("/api/shop/order", { productId, chain, token })) as Order);
    });

  const verify = () =>
    run(async () => {
      if (!order) return;
      const json = await post("/api/shop/verify", { orderId: order.orderId, txHash });
      setDownloadUrl(String(json.downloadUrl));
    });

  async function copyAddress() {
    if (!order) return;
    try {
      await navigator.clipboard.writeText(order.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // No clipboard access (insecure context, denied): the address is
      // selectable text, so copying by hand still works.
    }
  }

  if (downloadUrl) {
    return (
      <div className="flex flex-col gap-[var(--space-3)]" role="status">
        <p className="text-[length:var(--text-lg)]">{t("paid")}</p>
        <a
          href={downloadUrl}
          download
          className={cn(
            "inline-flex h-11 w-fit items-center justify-center rounded-[var(--radius-full)] px-6",
            "bg-signal-fill font-medium text-signal-ink hover:brightness-110",
          )}
        >
          {t("download")}
        </a>
        <p className="text-[length:var(--text-sm)] text-dim">
          {t("downloadNote", { max: SHOP_RULES.maxDownloads, days: SHOP_RULES.downloadDays })}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <p className="text-dim">
        {t("price", { amount: product.priceUsd, eur: product.approxEur })}
      </p>

      <Choices
        legend={t("network")}
        options={(Object.keys(SHOP_CHAINS) as Chain[]).map((c) => ({ value: c, label: t(`networks.${c}`) }))}
        value={chain}
        onChange={pickChain}
      />
      <Choices
        legend={t("token")}
        options={tokens.map((tk) => ({ value: tk, label: tk }))}
        value={token}
        onChange={pickToken}
      />

      {order ? (
        <>
          <dl className="flex flex-col gap-[var(--space-3)]">
            <div className="flex flex-col gap-1">
              <dt className="text-[length:var(--text-sm)] text-dim">{t("amount")}</dt>
              <dd dir="ltr" className="font-mono tabular-nums">
                {order.amount} {order.token}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-[length:var(--text-sm)] text-dim">{t("address")}</dt>
              <dd className="flex flex-wrap items-center gap-[var(--space-2)]">
                <code dir="ltr" className="select-all break-all font-mono">
                  {order.address}
                </code>
                <Button type="button" variant="outline" size="sm" onClick={copyAddress}>
                  {copied ? t("copied") : t("copy")}
                </Button>
              </dd>
            </div>
          </dl>
          <p className="text-[length:var(--text-sm)] text-dim">
            {t("sendNote", { token: order.token, network: t(`networks.${order.chain}`) })}
          </p>

          <Field
            label={t("txHash")}
            hint={t("txHashHint")}
            dir="ltr"
            spellCheck={false}
            autoComplete="off"
            className="font-mono"
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
          />
          <Button type="button" loading={busy} disabled={!txHash.trim()} onClick={verify}>
            {t("verify")}
          </Button>
        </>
      ) : (
        <Button type="button" loading={busy} onClick={startOrder}>
          {t("start")}
        </Button>
      )}

      {notice ? (
        <p role="alert" className="text-[length:var(--text-sm)] text-error">
          {t(`errors.${notice}`)}
        </p>
      ) : null}
    </div>
  );
}

/** A native radio group (arrow keys and the group name come free), styled
 *  like SlotList's cells. */
function Choices<T extends string>({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const id = useId();
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-[length:var(--text-sm)] text-dim">{legend}</legend>
      <div className="flex flex-wrap gap-[var(--space-2)]">
        {options.map((option) => (
          <div key={option.value} className="relative">
            <input
              type="radio"
              id={`${id}-${option.value}`}
              name={id}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="peer sr-only"
            />
            <label
              htmlFor={`${id}-${option.value}`}
              className={cn(
                "flex cursor-pointer rounded-[var(--radius-md)] border border-hairline",
                "px-[var(--space-3)] py-[var(--space-2)] text-[length:var(--text-sm)]",
                "transition-[color,border-color] duration-[var(--dur-fast)] ease-[var(--ease-out)]",
                "hover:border-signal peer-checked:border-signal peer-checked:text-signal-text",
                "peer-focus-visible:outline peer-focus-visible:outline-2",
                "peer-focus-visible:outline-[var(--focus)] peer-focus-visible:outline-offset-2",
              )}
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </fieldset>
  );
}
