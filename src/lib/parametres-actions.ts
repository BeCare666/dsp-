"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "./api-server";
import { messageErreurApi } from "./api-error";

export interface EtatAction {
  erreur?: string;
  succes?: boolean;
}

export async function modifierParametreAction(_etat: EtatAction, formData: FormData): Promise<EtatAction> {
  const cle = String(formData.get("cle") ?? "");
  const valeur = String(formData.get("valeur") ?? "").trim();

  const res = await apiFetch(`/parametres/${cle}`, {
    method: "PATCH",
    body: JSON.stringify({ valeur }),
  });
  if (!res.ok) {
    const corps = await res.json().catch(() => undefined);
    return { erreur: messageErreurApi(corps, "Impossible de modifier ce paramètre.") };
  }
  revalidatePath("/admin/parametres");
  return { succes: true };
}
