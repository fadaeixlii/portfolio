"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations, useLocale } from "next-intl";
import { Field } from "@/components/primitives/Field";
import { Button } from "@/components/primitives/Button";
import { Surface } from "@/components/primitives/Surface";
import { MOTION, EASE, useMotionSafe } from "@/lib/motion";
import { contactFormSchema, type ContactFormValues } from "@/lib/validation/contact";

type Status = "idle" | "loading" | "success";
type Notice = "rate_limited" | "server" | "network" | null;

/**
 * A single-step form: idle -> loading -> success. On success the form is
 * replaced by a confirmation, never silently reset — a reset reads as the
 * message vanishing. `variant="flat"`, not glass: the confirmation is a full
 * sentence, and paragraph copy never goes on a glass surface.
 */
export function ContactForm() {
  const t = useTranslations("contact");
  const locale = useLocale();
  const safe = useMotionSafe();
  const [status, setStatus] = useState<Status>("idle");
  const [notice, setNotice] = useState<Notice>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: "", email: "", message: "", company: "" },
  });

  async function onSubmit(values: ContactFormValues) {
    setNotice(null);
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, locale }),
      });

      if (res.status === 429) {
        setNotice("rate_limited");
        setStatus("idle");
        return;
      }
      if (!res.ok) {
        setNotice("server");
        setStatus("idle");
        return;
      }
      setStatus("success");
    } catch {
      setNotice("network");
      setStatus("idle");
    }
  }

  return (
    <Surface variant="flat" className="mx-auto max-w-xl p-[var(--space-6)] sm:p-[var(--space-8)]">
      <AnimatePresence mode="wait" initial={false}>
        {status === "success" ? (
          <motion.div
            key="success"
            initial={safe ? { opacity: 0, y: 8 } : { opacity: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: MOTION.dur.base, ease: EASE.out }}
          >
            <p className="text-[length:var(--text-lg)]">{t("confirmed.heading")}</p>
            <p className="mt-[var(--space-2)] max-w-[var(--measure)] text-dim">
              {t("confirmed.body")}
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            initial={safe ? { opacity: 0, y: 8 } : { opacity: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={safe ? { opacity: 0, y: -8 } : { opacity: 0 }}
            transition={{ duration: MOTION.dur.base, ease: EASE.out }}
            className="flex flex-col gap-[var(--space-4)]"
          >
            <Field
              label={t("form.name")}
              autoComplete="name"
              error={errors.name?.message}
              {...register("name")}
            />
            <Field
              label={t("form.email")}
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />

            <div className="flex flex-col gap-2">
              <label htmlFor="contact-message" className="text-[length:var(--text-sm)] text-dim">
                {t("form.message")}
              </label>
              <textarea
                id="contact-message"
                rows={5}
                aria-invalid={errors.message ? true : undefined}
                aria-describedby={errors.message ? "contact-message-error" : undefined}
                className={
                  "rounded-[var(--radius-md)] border border-hairline bg-transparent px-4 py-2 " +
                  "text-[length:var(--text-base)] text-text placeholder:text-dim " +
                  "transition-[color,border-color] duration-[var(--dur-fast)] focus-visible:border-signal"
                }
                {...register("message")}
              />
              {errors.message ? (
                <p
                  id="contact-message-error"
                  role="alert"
                  className="text-[length:var(--text-sm)] text-error"
                >
                  {errors.message.message}
                </p>
              ) : null}
            </div>

            {/* Honeypot. Hidden from sighted visitors and out of the tab
                order; a real person never reaches it, but a bot filling
                every field does. */}
            <div className="sr-only" aria-hidden="true">
              <label htmlFor="contact-company">{t("form.honeypot")}</label>
              <input
                id="contact-company"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                {...register("company")}
              />
            </div>

            {notice ? (
              <p role="alert" className="text-[length:var(--text-sm)] text-error">
                {t(`errors.${notice}`)}
              </p>
            ) : null}

            <Button type="submit" loading={status === "loading"}>
              {t("form.submit")}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </Surface>
  );
}
