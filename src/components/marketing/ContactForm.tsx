"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactFormSchema, type ContactFormData } from "@/lib/validation/contact";
import {
  submitContactForm,
  type ContactFormResult,
} from "@/app/(public)/contact/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function ContactForm() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ContactFormResult | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  function onSubmit(data: ContactFormData) {
    startTransition(async () => {
      const res = await submitContactForm({ ...data });
      setResult(res);
      if (res.success) reset();
    });
  }

  if (result?.success) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-3 w-3 rounded-full bg-accent" />
        <p className="text-lg font-medium text-foreground">{result.message}</p>
        <Button variant="ghost" onClick={() => setResult(null)}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full max-w-lg flex-col gap-6"
      noValidate
    >
      {result && !result.success && (
        <p className="text-sm text-destructive" role="alert">
          {result.message}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="Your name"
          aria-describedby={errors.name ? "name-error" : undefined}
          aria-invalid={!!errors.name}
          {...register("name")}
        />
        {errors.name && (
          <p id="name-error" className="text-sm text-destructive">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          aria-describedby={errors.email ? "email-error" : undefined}
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          placeholder="Tell me about your project..."
          rows={6}
          aria-describedby={errors.message ? "message-error" : undefined}
          aria-invalid={!!errors.message}
          {...register("message")}
        />
        {errors.message && (
          <p id="message-error" className="text-sm text-destructive">
            {errors.message.message}
          </p>
        )}
      </div>

      {/* Honeypot — hidden from real users, bots auto-fill it */}
      <div className="sr-only" aria-hidden="true">
        <Label htmlFor="company">Company</Label>
        <Input
          id="company"
          tabIndex={-1}
          autoComplete="off"
          {...register("company")}
        />
      </div>

      <Button type="submit" disabled={isPending} className={cn(isPending && "opacity-70")}>
        {isPending ? "Sending..." : "Send message"}
      </Button>
    </form>
  );
}
