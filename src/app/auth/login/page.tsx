"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Field } from "@/components/primitives/Field";
import { Button } from "@/components/primitives/Button";

/**
 * Email + password. There is exactly one admin account and no public
 * sign-up, so a magic link would mean a callback route and a mail-delivery
 * dependency for a form one person uses.
 *
 * The POST returns an httpOnly cookie, so the very next request already
 * carries the session and the server-side check in admin/layout.tsx sees it.
 * Every failure shows the same message: distinguishing "unknown email" from
 * "wrong password" tells an attacker which addresses exist.
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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
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
