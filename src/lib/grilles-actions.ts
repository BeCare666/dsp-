"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch, apiFetchJson, ApiError } from "./api-server";
import { messageErreurApi } from "./api-error";
import type { Grille, TypeEtablissement, TypeElementMesurable, TypeReponse } from "./types";

export interface EtatAction {
  erreur?: string;
  succes?: boolean;
}

export interface ElementMesurablePayload {
  libelle: string;
  typeReponse: TypeReponse;
  optionsChoix?: string[];
  typeElement: TypeElementMesurable;
  entreDansScore: boolean;
  ordre: number;
}

export interface CriterePayload {
  code: string;
  libelle: string;
  categorie?: string;
  recommandation?: string;
  ordre: number;
  elementsMesurables: ElementMesurablePayload[];
}

export interface NormePayload {
  code: string;
  libelle: string;
  ordre: number;
  criteres: CriterePayload[];
}

export interface DomainePayload {
  nom: string;
  ordre: number;
  normes: NormePayload[];
}

export interface GrillePayload {
  nom: string;
  type: TypeEtablissement;
  domaines: DomainePayload[];
}

export async function creerGrilleAction(payload: GrillePayload): Promise<EtatAction> {
  let grille: Grille;
  try {
    grille = await apiFetchJson<Grille>("/grilles", { method: "POST", body: JSON.stringify(payload) });
  } catch (erreur) {
    if (erreur instanceof ApiError) {
      return { erreur: messageErreurApi(erreur.body, "Impossible de créer la grille.") };
    }
    throw erreur;
  }
  revalidatePath("/admin/grilles");
  redirect(`/admin/grilles/${grille.id}`);
}

export async function modifierGrilleAction(grilleId: string, payload: GrillePayload): Promise<EtatAction> {
  const res = await apiFetch(`/grilles/${grilleId}`, { method: "PATCH", body: JSON.stringify(payload) });
  if (!res.ok) {
    const corps = await res.json().catch(() => undefined);
    return { erreur: messageErreurApi(corps, "Impossible de modifier la grille.") };
  }
  revalidatePath(`/admin/grilles/${grilleId}`);
  revalidatePath("/admin/grilles");
  return { succes: true };
}

export async function publierGrilleAction(grilleId: string): Promise<EtatAction> {
  const res = await apiFetch(`/grilles/${grilleId}/publier`, { method: "POST" });
  if (!res.ok) {
    const corps = await res.json().catch(() => undefined);
    return { erreur: messageErreurApi(corps, "Impossible de publier la grille.") };
  }
  revalidatePath(`/admin/grilles/${grilleId}`);
  revalidatePath("/admin/grilles");
  return { succes: true };
}

export async function archiverGrilleAction(grilleId: string): Promise<EtatAction> {
  const res = await apiFetch(`/grilles/${grilleId}/archiver`, { method: "POST" });
  if (!res.ok) {
    const corps = await res.json().catch(() => undefined);
    return { erreur: messageErreurApi(corps, "Impossible d'archiver la grille.") };
  }
  revalidatePath(`/admin/grilles/${grilleId}`);
  revalidatePath("/admin/grilles");
  return { succes: true };
}

export async function nouvelleVersionGrilleAction(grilleId: string): Promise<EtatAction> {
  let nouvelle: Grille;
  try {
    nouvelle = await apiFetchJson<Grille>(`/grilles/${grilleId}/nouvelle-version`, { method: "POST" });
  } catch (erreur) {
    if (erreur instanceof ApiError) {
      return { erreur: messageErreurApi(erreur.body, "Impossible de créer une nouvelle version.") };
    }
    throw erreur;
  }
  revalidatePath("/admin/grilles");
  redirect(`/admin/grilles/${nouvelle.id}`);
}
