import { use } from "react";
import { setRequestLocale } from "next-intl/server";
import { ManageBooking } from "@/components/schedule/ManageBooking";

export default function ManageBookingPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = use(params);
  setRequestLocale(locale);

  return (
    <main
      id="main"
      className="mx-auto min-h-dvh max-w-xl px-[var(--space-6)] pt-[var(--shell-top)] pb-[var(--space-24)]"
    >
      <ManageBooking token={token} />
    </main>
  );
}
