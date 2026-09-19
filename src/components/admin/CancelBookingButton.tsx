"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/primitives/Button";

/**
 * Hits the same signed-token DELETE route the visitor's own manage-booking
 * page uses (`/api/booking/[token]`) — the token is computed server-side in
 * the admin page (it already has `signBookingToken` available) and passed
 * down, so this component never needs its own Supabase access.
 */
export function CancelBookingButton({ token }: { token: string }) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);

  async function cancel() {
    setCancelling(true);
    try {
      const res = await fetch(`/api/booking/${token}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setCancelling(false);
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" loading={cancelling} onClick={cancel}>
      Cancel
    </Button>
  );
}
