"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Field } from "@/components/primitives/Field";
import { Button } from "@/components/primitives/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

/**
 * Email + password, not magic-link: there is exactly one admin account (no
 * public sign-up), and a link means also standing up a callback route and
 * an email-deliverability dependency neither buys anything here. Signing in
 * client-side is enough — `@supabase/ssr`'s browser client writes the
 * session to cookies, so the very next request already carries it and the
 * server-side `auth.getUser()` gate in admin/layout.tsx sees it.
 */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError("Wrong email or password.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("The request failed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-[var(--space-4)]">
      <h1 className="font-display text-[length:var(--text-2xl)]">Sign in</h1>
      <Field
        label="Email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Field
        label="Password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error ? (
        <p role="alert" className="text-[length:var(--text-sm)] text-error">
          {error}
        </p>
      ) : null}
      <Button type="submit" loading={loading}>
        Sign in
      </Button>
    </form>
  );
}
