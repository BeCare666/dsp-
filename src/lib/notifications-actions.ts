"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "./api-server";

export async function marquerNotificationLueAction(notificationId: string): Promise<void> {
  await apiFetch(`/notifications-internes/${notificationId}/lire`, { method: "POST" });
  revalidatePath("/", "layout");
}

export async function marquerToutesNotificationsLuesAction(): Promise<void> {
  await apiFetch("/notifications-internes/lire-tout", { method: "POST" });
  revalidatePath("/", "layout");
}
