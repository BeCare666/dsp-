"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "./api-server";
import { messageErreurApi } from "./api-error";
import type { EtatAction } from "./types";

// §4.2 — gestion des services et des utilisateurs internes par le responsable
// du compte. L'organisation n'est jamais transmise : l'API la déduit du jeton.

function valeur(formData: FormData, champ: string): string {
  return String(formData.get(champ) ?? "").trim();
}

async function appeler(chemin: string, methode: string, corps: unknown, repli: string): Promise<EtatAction> {
  const res = await apiFetch(chemin, { method: methode, body: corps === undefined ? undefined : JSON.stringify(corps) });
  if (!res.ok) {
    const erreur = await res.json().catch(() => undefined);
    return { erreur: messageErreurApi(erreur, repli) };
  }
  revalidatePath("/organisation/services");
  revalidatePath("/organisation/equipe");
  return { succes: true };
}

// ------------------------------------------------------------------ services

export async function creerServiceAction(_etat: EtatAction, formData: FormData): Promise<EtatAction> {
  return appeler(
    "/organisation/services",
    "POST",
    { nom: valeur(formData, "nom"), description: valeur(formData, "description") || undefined },
    "Impossible de créer le service.",
  );
}

export async function modifierServiceAction(serviceId: string, _etat: EtatAction, formData: FormData): Promise<EtatAction> {
  return appeler(
    `/organisation/services/${serviceId}`,
    "PATCH",
    { nom: valeur(formData, "nom"), description: valeur(formData, "description") },
    "Impossible de modifier le service.",
  );
}

export async function basculerServiceAction(serviceId: string, actif: boolean): Promise<EtatAction> {
  return appeler(
    `/organisation/services/${serviceId}/${actif ? "desactiver" : "reactiver"}`,
    "POST",
    undefined,
    "Action impossible.",
  );
}

// ------------------------------------------------------------------- membres

function dtoMembre(formData: FormData) {
  return {
    civilite: valeur(formData, "civilite"),
    nom: valeur(formData, "nom"),
    prenom: valeur(formData, "prenom"),
    roles: formData.getAll("roles").map(String),
  };
}

export async function creerMembreAction(_etat: EtatAction, formData: FormData): Promise<EtatAction> {
  const serviceId = valeur(formData, "serviceId");
  const telephone = valeur(formData, "telephone");
  return appeler(
    "/organisation/membres",
    "POST",
    {
      ...dtoMembre(formData),
      email: valeur(formData, "email"),
      telephone: telephone || undefined,
      serviceId: serviceId || undefined,
    },
    "Impossible de créer l'utilisateur.",
  );
}

export async function modifierMembreAction(membreId: string, _etat: EtatAction, formData: FormData): Promise<EtatAction> {
  const serviceId = valeur(formData, "serviceId");
  return appeler(
    `/organisation/membres/${membreId}`,
    "PATCH",
    { ...dtoMembre(formData), serviceId: serviceId || null },
    "Impossible de modifier l'utilisateur.",
  );
}

export async function basculerMembreAction(membreId: string, actif: boolean): Promise<EtatAction> {
  return appeler(
    `/organisation/membres/${membreId}/${actif ? "desactiver" : "reactiver"}`,
    "POST",
    undefined,
    "Action impossible.",
  );
}

export async function renvoyerInvitationAction(membreId: string): Promise<EtatAction> {
  return appeler(`/organisation/membres/${membreId}/renvoyer-invitation`, "POST", undefined, "Envoi impossible.");
}
