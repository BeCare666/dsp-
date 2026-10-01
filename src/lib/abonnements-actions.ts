"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "./api-server";
import { messageErreurApi } from "./api-error";
import type { EtatAction } from "./types";

// §5 / §10.4 — demande de paiement d'un abonnement (tarif figé côté serveur).
export async function souscrireAbonnementAction(
  module: "NEWS" | "EI",
): Promise<{ paiement?: { id: string; montant: number }; erreur?: string }> {
  const res = await apiFetch(`/abonnements/${module}/souscrire`, { method: "POST" });
  const corps = await res.json().catch(() => undefined);
  if (!res.ok) return { erreur: messageErreurApi(corps, "Souscription impossible.") };
  return { paiement: { id: corps.id, montant: corps.montant } };
}

// RM11 — vérification serveur du paiement après le widget.
export async function verifierPaiementAbonnementAction(paiementId: string, transactionId: string): Promise<EtatAction> {
  const res = await apiFetch(`/abonnements/paiements/${paiementId}/verifier`, {
    method: "POST",
    body: JSON.stringify({ transactionId }),
  });
  if (!res.ok) {
    const corps = await res.json().catch(() => undefined);
    return { erreur: messageErreurApi(corps, "La vérification du paiement a échoué.") };
  }
  revalidatePath("/abonnements");
  revalidatePath("/tableau-de-bord");
  return { succes: true };
}

// §12.1 — actions de l'administrateur sur l'abonnement d'un établissement.
export async function actionAbonnementAdmin(
  organisationId: string,
  module: "NEWS" | "EI",
  action: "activer" | "suspendre" | "reprendre" | "prolonger",
  jours?: number,
): Promise<EtatAction> {
  const res = await apiFetch(`/abonnements/${organisationId}/${module}/${action}`, {
    method: "POST",
    body: JSON.stringify(jours ? { jours } : {}),
  });
  if (!res.ok) {
    const corps = await res.json().catch(() => undefined);
    return { erreur: messageErreurApi(corps, "Action impossible.") };
  }
  revalidatePath(`/admin/etablissements/${organisationId}`);
  revalidatePath("/admin/etablissements");
  return { succes: true };
}
