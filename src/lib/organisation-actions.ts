"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "./api-server";
import { messageErreurApi } from "./api-error";

export interface EtatAction {
  erreur?: string;
  succes?: boolean;
}

export async function modifierMonOrganisationAction(_etat: EtatAction, formData: FormData): Promise<EtatAction> {
  const champ = (nom: string) => String(formData.get(nom) ?? "").trim();
  const typeStructure = champ("typeStructure");

  const res = await apiFetch("/organisations/me", {
    method: "PATCH",
    body: JSON.stringify({
      nom: champ("nom"),
      raisonSociale: champ("raisonSociale"),
      typeStructure: typeStructure || undefined,
      adresse: champ("adresse"),
      ville: champ("ville"),
      pays: champ("pays"),
      telephone: champ("telephone") || undefined,
      email: champ("email") || undefined,
    }),
  });
  if (!res.ok) {
    const corps = await res.json().catch(() => undefined);
    return { erreur: messageErreurApi(corps, "Impossible de modifier les coordonnées de l'établissement.") };
  }
  revalidatePath("/organisation");
  return { succes: true };
}
