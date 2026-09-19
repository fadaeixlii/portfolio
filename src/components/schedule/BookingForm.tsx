"use client";

import type { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Field } from "@/components/primitives/Field";
import { Button } from "@/components/primitives/Button";
import type { BookingFormValues } from "@/lib/calendar/schema";

/**
 * The form's `useForm` instance lives one level up, in `Booker` — not here.
 * A 409 mid-submit sends the visitor back to the slot step to pick again,
 * which would unmount this component and drop everything they typed if the
 * form state lived locally. Lifting it keeps the values alive across that
 * round trip for free, no extra state to sync.
 */
export function BookingForm({
  form,
  onSubmit,
  submitting,
  errorMessage,
}: {
  form: UseFormReturn<BookingFormValues>;
  onSubmit: (values: BookingFormValues) => void;
  submitting: boolean;
  errorMessage?: string;
}) {
  const t = useTranslations("schedule.form");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-[var(--space-4)]"
    >
      <Field label={t("name")} autoComplete="name" error={errors.name?.message} {...register("name")} />
      <Field
        label={t("email")}
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <Field
        label={t("topic")}
        hint={t("topicHint")}
        error={errors.topic?.message}
        {...register("topic")}
      />

      <div className="flex flex-col gap-2">
        <label htmlFor="schedule-notes" className="text-[length:var(--text-sm)] text-dim">
          {t("notes")}
        </label>
        <textarea
          id="schedule-notes"
          rows={3}
          className={
            "rounded-[var(--radius-md)] border border-hairline bg-transparent px-4 py-2 " +
            "text-[length:var(--text-base)] text-text placeholder:text-dim " +
            "transition-[color,border-color] duration-[var(--dur-fast)] focus-visible:border-signal"
          }
          {...register("notes")}
        />
        {errors.notes ? (
          <p role="alert" className="text-[length:var(--text-sm)] text-error">
            {errors.notes.message}
          </p>
        ) : null}
      </div>

      {/* Honeypot. Hidden from sighted visitors and out of the tab order; a
          real person never reaches it, but a bot filling every field does. */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="schedule-company">{t("honeypot")}</label>
        <input id="schedule-company" type="text" tabIndex={-1} autoComplete="off" {...register("company")} />
      </div>

      {errorMessage ? (
        <p role="alert" className="text-[length:var(--text-sm)] text-error">
          {errorMessage}
        </p>
      ) : null}

      <Button type="submit" loading={submitting}>
        {t("submit")}
      </Button>
    </form>
  );
}
