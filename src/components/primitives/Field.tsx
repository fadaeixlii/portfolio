"use client";

import { forwardRef, useId } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const Field = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: string;
    hint?: string;
    multiline?: boolean;
  }
>(function Field({ label, error, hint, className, id, ...props }, ref) {
  const generated = useId();
  const fieldId = id ?? generated;
  const describedBy = error
    ? `${fieldId}-error`
    : hint
      ? `${fieldId}-hint`
      : undefined;

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={fieldId}
        className="text-[length:var(--text-sm)] text-dim"
      >
        {label}
      </label>
      <input
        ref={ref}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "h-11 rounded-[var(--radius-md)] border bg-transparent px-4",
          "text-[length:var(--text-base)] text-text",
          "placeholder:text-dim",
          "transition-colors duration-[var(--dur-fast)]",
          "disabled:opacity-45",
          error ? "border-error" : "border-hairline focus-visible:border-signal",
          className,
        )}
        {...props}
      />
      {error ? (
        <p
          id={`${fieldId}-error`}
          role="alert"
          className="text-[length:var(--text-sm)] text-error"
        >
          {error}
        </p>
      ) : hint ? (
        <p id={`${fieldId}-hint`} className="text-[length:var(--text-sm)] text-dim">
          {hint}
        </p>
      ) : null}
    </div>
  );
});
