"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, apiFetchJson, ApiError } from "./api-server";
import { messageErreurApi } from "./api-error";
import type { EtatAction } from "./types";

export type { EtatAction } from "./types";

function valeur(formData: FormData, champ: string): string {
  return String(formData.get(champ) ?? "").trim();
}

function valeurOptionnelle(formData: FormData, champ: string): string | undefined {
  const v = valeur(formData, champ);
  return v.length > 0 ? v : undefined;
}

function dtoFormation(formData: FormData) {
  const dureeHeures = valeurOptionnelle(formData, "dureeHeures");
  return {
    titre: valeur(formData, "titre"),
    description: valeur(formData, "description"),
    objectifs: valeurOptionnelle(formData, "objectifs"),
    dureeHeures: dureeHeures ? Number(dureeHeures) : undefined,
    prixIndividuel: Number(valeur(formData, "prixIndividuel")),
    prixGroupe5: Number(valeur(formData, "prixGroupe5")),
    prixGroupe10: Number(valeur(formData, "prixGroupe10")),
  };
}

export async function creerFormationAction(_etat: EtatAction, formData: FormData): Promise<EtatAction> {
  try {
    await apiFetchJson("/formations", { method: "POST", body: JSON.stringify(dtoFormation(formData)) });
  } catch (erreur) {
    if (erreur instanceof ApiError) {
      return { erreur: messageErreurApi(erreur.body, "Impossible de créer la formation.") };
    }
    throw erreur;
  }
  revalidatePath("/admin/formations");
  return { succes: true };
}

export async function modifierFormationAction(
  formationId: string,
  _etat: EtatAction,
  formData: FormData,
): Promise<EtatAction> {
  try {
    await apiFetchJson(`/formations/${formationId}`, { method: "PATCH", body: JSON.stringify(dtoFormation(formData)) });
  } catch (erreur) {
    if (erreur instanceof ApiError) {
      return { erreur: messageErreurApi(erreur.body, "Impossible de modifier la formation.") };
    }
    throw erreur;
  }
  revalidatePath("/admin/formations");
  return { succes: true };
}

export async function basculerFormationAction(formationId: string, actif: boolean): Promise<EtatAction> {
  const res = await apiFetch(`/formations/${formationId}/${actif ? "desactiver" : "reactiver"}`, { method: "POST" });
  if (!res.ok) {
    const corps = await res.json().catch(() => undefined);
    return { erreur: messageErreurApi(corps, "Action impossible.") };
  }
  revalidatePath("/admin/formations");
  return { succes: true };
}

export async function creerTypeEiAction(_etat: EtatAction, formData: FormData): Promise<EtatAction> {
  try {
    await apiFetchJson("/types-ei", { method: "POST", body: JSON.stringify({ libelle: valeur(formData, "libelle") }) });
  } catch (erreur) {
    if (erreur instanceof ApiError) {
      return { erreur: messageErreurApi(erreur.body, "Impossible de créer le type d'EI.") };
    }
    throw erreur;
  }
  revalidatePath("/admin/types-ei");
  return { succes: true };
}

export async function basculerTypeEiAction(typeId: string, actif: boolean): Promise<EtatAction> {
  const res = await apiFetch(`/types-ei/${typeId}/${actif ? "desactiver" : "reactiver"}`, { method: "POST" });
  if (!res.ok) {
    const corps = await res.json().catch(() => undefined);
    return { erreur: messageErreurApi(corps, "Action impossible.") };
  }
  revalidatePath("/admin/types-ei");
  return { succes: true };
}

export async function fixerDateRdvAction(
  reservationId: string,
  _etat: EtatAction,
  formData: FormData,
): Promise<EtatAction> {
  const brut = valeur(formData, "dateRdv");
  const iso = brut ? new Date(brut).toISOString() : "";
  try {
    await apiFetchJson(`/reservations/${reservationId}/date-rdv`, {
      method: "PATCH",
      body: JSON.stringify({ dateRdv: iso }),
    });
  } catch (erreur) {
    if (erreur instanceof ApiError) {
      return { erreur: messageErreurApi(erreur.body, "Impossible de fixer la date de rendez-vous.") };
    }
    throw erreur;
  }
  revalidatePath("/admin/reservations");
  return { succes: true };
}

export async function basculerOrganisationAction(organisationId: string, actif: boolean): Promise<EtatAction> {
  const res = await apiFetch(`/organisations/${organisationId}/${actif ? "desactiver" : "activer"}`, {
    method: "POST",
  });
  if (!res.ok) {
    const corps = await res.json().catch(() => undefined);
    return { erreur: messageErreurApi(corps, "Action impossible.") };
  }
  revalidatePath("/admin/etablissements");
  revalidatePath(`/admin/etablissements/${organisationId}`);
  return { succes: true };
}

export async function basculerUtilisateurAction(utilisateurId: string, actif: boolean): Promise<EtatAction> {
  const res = await apiFetch(`/utilisateurs/${utilisateurId}/${actif ? "desactiver" : "reactiver"}`, {
    method: "POST",
  });
  if (!res.ok) {
    const corps = await res.json().catch(() => undefined);
    return { erreur: messageErreurApi(corps, "Action impossible.") };
  }
  revalidatePath("/admin/utilisateurs");
  revalidatePath(`/admin/utilisateurs/${utilisateurId}`);
  return { succes: true };
}

export async function revoquerSessionAction(utilisateurId: string, sessionId: string): Promise<EtatAction> {
  const res = await apiFetch(`/utilisateurs/${utilisateurId}/sessions/${sessionId}/revoquer`, { method: "POST" });
  if (!res.ok) {
    const corps = await res.json().catch(() => undefined);
    return { erreur: messageErreurApi(corps, "Impossible de révoquer cette session.") };
  }
  revalidatePath(`/admin/utilisateurs/${utilisateurId}`);
  return { succes: true };
}

export async function ajouterRoleAction(utilisateurId: string, _etat: EtatAction, formData: FormData): Promise<EtatAction> {
  try {
    await apiFetchJson(`/utilisateurs/${utilisateurId}/roles`, {
      method: "POST",
      body: JSON.stringify({ role: valeur(formData, "role") }),
    });
  } catch (erreur) {
    if (erreur instanceof ApiError) {
      return { erreur: messageErreurApi(erreur.body, "Impossible d'ajouter ce rôle.") };
    }
    throw erreur;
  }
  revalidatePath(`/admin/utilisateurs/${utilisateurId}`);
  return { succes: true };
}

export async function retirerRoleAction(utilisateurId: string, role: string): Promise<EtatAction> {
  const res = await apiFetch(`/utilisateurs/${utilisateurId}/roles/${role}`, { method: "DELETE" });
  if (!res.ok) {
    const corps = await res.json().catch(() => undefined);
    return { erreur: messageErreurApi(corps, "Impossible de retirer ce rôle.") };
  }
  revalidatePath(`/admin/utilisateurs/${utilisateurId}`);
  return { succes: true };
}

export async function marquerRealiseeAction(reservationId: string, participantsPresents: number): Promise<EtatAction> {
  const res = await apiFetch(`/reservations/${reservationId}/realiser`, {
    method: "POST",
    body: JSON.stringify({ participantsPresents, presenceConfirmee: participantsPresents > 0 }),
  });
  if (!res.ok) {
    const corps = await res.json().catch(() => undefined);
    return { erreur: messageErreurApi(corps, "Impossible de clôturer la session.") };
  }
  revalidatePath("/admin/reservations");
  return { succes: true };
}

// §12.4 — échelle de gravité des EI.
export async function creerNiveauGraviteAction(_etat: EtatAction, formData: FormData): Promise<EtatAction> {
  const res = await apiFetch("/niveaux-gravite-ei", {
    method: "POST",
    body: JSON.stringify({
      libelle: valeur(formData, "libelle"),
      ordre: Number(valeur(formData, "ordre")),
      critique: formData.get("critique") === "on",
    }),
  });
  if (!res.ok) {
    const corps = await res.json().catch(() => undefined);
    return { erreur: messageErreurApi(corps, "Impossible de créer le niveau de gravité.") };
  }
  revalidatePath("/admin/types-ei");
  return { succes: true };
}

export async function basculerNiveauGraviteAction(id: string, actif: boolean): Promise<EtatAction> {
  const res = await apiFetch(`/niveaux-gravite-ei/${id}/${actif ? "desactiver" : "reactiver"}`, { method: "POST" });
  if (!res.ok) {
    const corps = await res.json().catch(() => undefined);
    return { erreur: messageErreurApi(corps, "Action impossible.") };
  }
  revalidatePath("/admin/types-ei");
  return { succes: true };
}
