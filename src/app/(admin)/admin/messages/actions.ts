"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return supabase;
}

export async function updateMessageStatus(id: string, status: string) {
  const validStatuses = ["unread", "read", "replied", "archived"];
  if (!validStatuses.includes(status)) {
    return { error: "Invalid status" };
  }

  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("contact_messages")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("updateMessageStatus failed:", error.message);
    return { error: "Could not update the message." };
  }

  revalidatePath("/admin/messages");
  return { success: true };
}

export async function deleteMessage(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("contact_messages")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("deleteMessage failed:", error.message);
    return { error: "Could not delete the message." };
  }

  revalidatePath("/admin/messages");
  return { success: true };
}
