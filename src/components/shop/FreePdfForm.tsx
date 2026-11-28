"use client";

import { useId, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/primitives/Button";
import { Field } from "@/components/primitives/Field";
import { Link } from "@/lib/i18n/navigation";
import type { FreeProductId } from "@/content/shop";

type Notice = "rate_limited" | "server" | "network";

/**
 * A free product's PDF, by email: one address field, one button, the notice
 * beside it. The route answers the same for a new and a known address, so
 * "sent" is all this ever says. No animation: the confirmation replaces the
 * form in place, and takes focus so keyboard and screen-reader users land on it.
 * The browser's own type=email check runs first (no validation library in
 * this page's bundle); the route's zod schema is the real one, and its 400
 * shows the same message.
 */
export function FreePdfForm({ productId }: { productId: FreeProductId }) {
  const t = useTranslations("freePdf");
  const locale = useLocale();
  const noticeId = useId();
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [invalid, setInvalid] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = event.currentTarget.elements.namedItem("email") as HTMLInputElement;
    setNotice(null);
    setInvalid(!input.checkValidity());
    if (!input.checkValidity()) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/shop/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, email: input.value, locale }),
      });
      if (res.ok) {
        setStatus("sent");
        return;
      }
      if (res.status === 400) setInvalid(true);
      else setNotice(res.status === 429 ? "rate_limited" : "server");
    } catch {
      setNotice("network");
    }
    setStatus("idle");
  }

  if (status === "sent") {
    return (
      // One focused status holds both lines, so a screen reader reads the hint with it.
      <div ref={(node) => node?.focus()} tabIndex={-1} role="status" className="max-w-[var(--measure)] outline-none">
        <p dir="auto" className="text-[length:var(--text-lg)] text-text">
          {t("sent")}
        </p>
        <p dir="auto" className="mt-[var(--space-2)] text-[length:var(--text-base)] text-dim">
          {t("sentHint")}
        </p>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={submit} className="flex w-full max-w-[var(--measure)] flex-col gap-[var(--space-4)]">
      <Field
        label={t("label")}
        name="email"
        type="email"
        autoComplete="email"
        spellCheck={false}
        required
        error={invalid ? t("errors.invalid") : undefined}
      />
      <div className="flex flex-wrap items-center gap-[var(--space-4)]">
        <Button type="submit" loading={status === "loading"} aria-describedby={noticeId}>
          {t("submit")}
        </Button>
        <p id={noticeId} dir="auto" className="min-w-0 flex-1 basis-[16rem] text-[length:var(--text-sm)] text-dim">
          {t.rich("notice", {
            privacy: (chunks) => (
              // Underlined at rest: inside a sentence, colour alone fails axe's link-in-text-block.
              <Link href="/privacy" className="text-signal-text underline underline-offset-2">
                {chunks}
              </Link>
            ),
          })}
        </p>
      </div>
      {notice ? (
        <p role="alert" dir="auto" className="text-[length:var(--text-sm)] text-error">
          {t(`errors.${notice}`)}
        </p>
      ) : null}
    </form>
  );
}
