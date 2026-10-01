"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { apiFetch, apiFetchJson, ApiError } from "./api-server";
import { messageErreurApi } from "./api-error";
import type { EvenementIndesirable } from "./types";

export interface EtatAction {
  erreur?: string;
  succes?: boolean;
}

function valeur(formData: FormData, champ: string): string {
  return String(formData.get(champ) ?? "").trim();
}

function valeurOptionnelle(formData: FormData, champ: string): string | undefined {
  const v = valeur(formData, champ);
  return v.length > 0 ? v : undefined;
}

// Champ <input type="datetime-local"> (heure locale du navigateur) → ISO.
function dateHeureIso(formData: FormData, champ: string): string | undefined {
  const v = valeur(formData, champ);
  return v ? new Date(v).toISOString() : undefined;
}

async function appeler(eiId: string, chemin: string, methode: string, corps: unknown, repli: string): Promise<EtatAction> {
  const res = await apiFetch(`/evenements-indesirables/${eiId}${chemin}`, {
    method: methode,
    body: JSON.stringify(corps),
  });
  if (!res.ok) {
    const erreur = await res.json().catch(() => undefined);
    return { erreur: messageErreurApi(erreur, repli) };
  }
  revalidatePath(`/evenements-indesirables/${eiId}`);
  return { succes: true };
}

// §8.1 — fiche standardisée de déclaration.
export async function declarerEiAction(_etat: EtatAction, formData: FormData): Promise<EtatAction> {
  let evenement: EvenementIndesirable;
  try {
    evenement = await apiFetchJson<EvenementIndesirable>("/evenements-indesirables", {
      method: "POST",
      body: JSON.stringify({
        dateSurvenue: dateHeureIso(formData, "dateSurvenue"),
        serviceId: valeurOptionnelle(formData, "serviceId"),
        lieu: valeurOptionnelle(formData, "lieu"),
        typeEiId: valeurOptionnelle(formData, "typeEiId"),
        description: valeur(formData, "description"),
        niveauGraviteId: valeur(formData, "niveauGraviteId"),
        personnesImpliquees: valeur(formData, "personnesImpliquees"),
        critereId: valeurOptionnelle(formData, "critereId"),
      }),
    });
  } catch (erreur) {
    if (erreur instanceof ApiError) {
      return { erreur: messageErreurApi(erreur.body, "Impossible de déclarer l'événement.") };
    }
    throw erreur;
  }
  redirect(`/evenements-indesirables/${evenement.id}`);
}

// §8.2 — qualification : gravité confirmée, type confirmé, priorité.
export async function qualifierEiAction(eiId: string, _etat: EtatAction, formData: FormData): Promise<EtatAction> {
  return appeler(
    eiId,
    "/qualifier",
    "PATCH",
    {
      niveauGraviteId: valeur(formData, "niveauGraviteId"),
      typeEiId: valeur(formData, "typeEiId"),
      priorite: valeur(formData, "priorite"),
    },
    "Impossible de qualifier l'événement.",
  );
}

// §8.2 — cause guidée (« 5 pourquoi »).
export async function ajouterCauseAction(eiId: string, _etat: EtatAction, formData: FormData): Promise<EtatAction> {
  const pourquois = [1, 2, 3, 4, 5].map((n) => valeur(formData, `pourquoi${n}`)).filter((p) => p.length > 0);
  return appeler(
    eiId,
    "/causes",
    "POST",
    { type: valeur(formData, "type"), pourquois, description: valeur(formData, "description") },
    "Impossible d'ajouter la cause.",
  );
}

export async function ajouterActionCorrectiveAction(
  eiId: string,
  _etat: EtatAction,
  formData: FormData,
): Promise<EtatAction> {
  return appeler(
    eiId,
    "/actions-correctives",
    "POST",
    {
      description: valeur(formData, "description"),
      responsableId: valeur(formData, "responsableId"),
      echeance: valeur(formData, "echeance"),
    },
    "Impossible d'ajouter l'action corrective.",
  );
}

export async function changerStatutActionAction(eiId: string, actionId: string, statut: string): Promise<EtatAction> {
  return appeler(eiId, `/actions-correctives/${actionId}`, "PATCH", { statut }, "Transition refusée.");
}

export async function changerStatutEiAction(eiId: string, statut: string): Promise<EtatAction> {
  return appeler(eiId, "/statut", "PATCH", { statut }, "Transition de statut refusée.");
}

// §13.4 — correction tracée de la fiche (motif obligatoire).
export async function corrigerEiAction(eiId: string, _etat: EtatAction, formData: FormData): Promise<EtatAction> {
  return appeler(
    eiId,
    "/corriger",
    "PATCH",
    {
      dateSurvenue: dateHeureIso(formData, "dateSurvenue"),
      serviceId: valeur(formData, "serviceId"),
      lieu: valeur(formData, "lieu"),
      description: valeur(formData, "description"),
      personnesImpliquees: valeur(formData, "personnesImpliquees"),
      motif: valeur(formData, "motif"),
    },
    "Impossible d'enregistrer la correction.",
  );
}

export async function uploaderPieceJointeAction(
  eiId: string,
  _etat: EtatAction,
  formData: FormData,
): Promise<EtatAction> {
  const fichier = formData.get("fichier");
  if (!(fichier instanceof File) || fichier.size === 0) {
    return { erreur: "Sélectionnez un fichier avant d'envoyer." };
  }

  const corpsMultipart = new FormData();
  corpsMultipart.set("fichier", fichier);

  const res = await apiFetch(`/evenements-indesirables/${eiId}/pieces-jointes`, {
    method: "POST",
    body: corpsMultipart,
  });
  if (!res.ok) {
    const corps = await res.json().catch(() => undefined);
    return { erreur: messageErreurApi(corps, "Impossible d'envoyer la pièce jointe.") };
  }
  revalidatePath(`/evenements-indesirables/${eiId}`);
  return { succes: true };
}
