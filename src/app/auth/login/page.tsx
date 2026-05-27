import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  robots: "noindex, nofollow",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-2 w-2 rounded-full bg-accent" />
          <h1 className="font-serif text-2xl font-normal tracking-tight">
            Admin
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to manage your portfolio.
          </p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
