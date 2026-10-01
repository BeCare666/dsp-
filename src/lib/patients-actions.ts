"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { apiFetch, apiFetchJson, ApiError } from "./api-server";
import { messageErreurApi } from "./api-error";
import type { Patient } from "./types";

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

export async function creerPatientAction(_etat: EtatAction, formData: FormData): Promise<EtatAction> {
  let patient: Patient;
  try {
    patient = await apiFetchJson<Patient>("/patients", {
      method: "POST",
      body: JSON.stringify({
        identifiantInterne: valeur(formData, "identifiantInterne"),
        serviceId: valeurOptionnelle(formData, "serviceId"),
        numeroLit: valeurOptionnelle(formData, "numeroLit"),
      }),
    });
  } catch (erreur) {
    if (erreur instanceof ApiError) {
      return { erreur: messageErreurApi(erreur.body, "Impossible de créer la fiche patient.") };
    }
    throw erreur;
  }
  redirect(`/news/${patient.id}`);
}

export async function cloturerPatientAction(patientId: string): Promise<EtatAction> {
  const res = await apiFetch(`/patients/${patientId}/cloturer`, { method: "POST" });
  if (!res.ok) {
    const corps = await res.json().catch(() => undefined);
    return { erreur: messageErreurApi(corps, "Impossible de clôturer la fiche.") };
  }
  revalidatePath(`/news/${patientId}`);
  return {};
}

function valeursMesure(formData: FormData) {
  return {
    frequenceRespiratoire: Number(valeur(formData, "frequenceRespiratoire")),
    saturationOxygene: Number(valeur(formData, "saturationOxygene")),
    oxygenoSupplementation: formData.get("oxygenoSupplementation") === "on",
    temperature: Number(valeur(formData, "temperature")),
    pressionArterielleSystolique: Number(valeur(formData, "pressionArterielleSystolique")),
    frequenceCardiaque: Number(valeur(formData, "frequenceCardiaque")),
    niveauConscience: valeur(formData, "niveauConscience"),
  };
}

export async function saisirMesureAction(patientId: string, _etat: EtatAction, formData: FormData): Promise<EtatAction> {
  const payload = valeursMesure(formData);

  try {
    await apiFetchJson(`/patients/${patientId}/mesures`, { method: "POST", body: JSON.stringify(payload) });
  } catch (erreur) {
    if (erreur instanceof ApiError) {
      return { erreur: messageErreurApi(erreur.body, "Impossible d'enregistrer la mesure.") };
    }
    throw erreur;
  }
  redirect(`/news/${patientId}`);
}

// §13.4 — correction tracée d'une mesure (motif obligatoire).
export async function corrigerMesureAction(
  patientId: string,
  mesureId: string,
  _etat: EtatAction,
  formData: FormData,
): Promise<EtatAction> {
  const res = await apiFetch(`/patients/${patientId}/mesures/${mesureId}`, {
    method: "PATCH",
    body: JSON.stringify({ ...valeursMesure(formData), motif: valeur(formData, "motif") }),
  });
  if (!res.ok) {
    const corps = await res.json().catch(() => undefined);
    return { erreur: messageErreurApi(corps, "Impossible d'enregistrer la correction.") };
  }
  revalidatePath(`/news/${patientId}`);
  return { succes: true };
}

export async function ajouterInterventionAction(
  alerteId: string,
  _etat: EtatAction,
  formData: FormData,
): Promise<EtatAction> {
  const res = await apiFetch(`/alertes/${alerteId}/interventions`, {
    method: "POST",
    body: JSON.stringify({ note: valeur(formData, "note") }),
  });
  if (!res.ok) {
    const corps = await res.json().catch(() => undefined);
    return { erreur: messageErreurApi(corps, "Impossible d'ajouter l'intervention.") };
  }
  revalidatePath(`/news/alertes/${alerteId}`);
  return {};
}

export async function changerStatutAlerteAction(alerteId: string, statut: string): Promise<EtatAction> {
  const res = await apiFetch(`/alertes/${alerteId}/statut`, {
    method: "PATCH",
    body: JSON.stringify({ statut }),
  });
  if (!res.ok) {
    const corps = await res.json().catch(() => undefined);
    return { erreur: messageErreurApi(corps, "Transition de statut refusée.") };
  }
  revalidatePath(`/news/alertes/${alerteId}`);
  return {};
}
