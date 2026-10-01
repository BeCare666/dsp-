"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { API_URL, apiFetch } from "./api-server";
import { synchroniserCookiesSession, effacerCookiesSession, extraireAccessTokenDepuisReponse } from "./session-cookies";
import { decoderPayloadJwt } from "./session";
import { messageErreurApi } from "./api-error";
import type { EtatAction } from "./types";

export interface EtatFormulaire {
  erreur?: string;
}

function valeur(formData: FormData, champ: string): string {
  return String(formData.get(champ) ?? "").trim();
}

function valeurOptionnelle(formData: FormData, champ: string): string | undefined {
  const v = valeur(formData, champ);
  return v.length > 0 ? v : undefined;
}

async function appelerApiPublic(path: string, payload: unknown): Promise<{ res: Response; corps: unknown }> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const corps = await res.json().catch(() => undefined);
  return { res, corps };
}

// Case "J'accepte les CGU" des formulaires d'inscription : le navigateur
// l'impose déjà (required), revérifié ici pour ne pas dépendre du seul client.
const ERREUR_CGU = "Vous devez accepter les conditions générales d'utilisation pour créer un compte.";

export async function inscrireOrganisationAction(
  _etat: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  if (formData.get("accepteCgu") !== "on") return { erreur: ERREUR_CGU };

  const payload = {
    organisationNom: valeur(formData, "organisationNom"),
    organisationRaisonSociale: valeur(formData, "organisationRaisonSociale"),
    organisationTypeStructure: valeur(formData, "organisationTypeStructure"),
    organisationIfu: valeur(formData, "organisationIfu"),
    organisationType: valeur(formData, "organisationType"),
    organisationAdresse: valeurOptionnelle(formData, "organisationAdresse"),
    organisationVille: valeur(formData, "organisationVille"),
    organisationPays: valeur(formData, "organisationPays"),
    organisationTelephone: valeur(formData, "organisationTelephone"),
    organisationEmail: valeur(formData, "organisationEmail"),
    responsableCivilite: valeur(formData, "responsableCivilite"),
    responsableNom: valeur(formData, "responsableNom"),
    responsablePrenom: valeur(formData, "responsablePrenom"),
    responsableEmail: valeur(formData, "responsableEmail"),
    responsableTelephone: valeurOptionnelle(formData, "responsableTelephone"),
    motDePasse: valeur(formData, "motDePasse"),
  };

  const { res, corps } = await appelerApiPublic("/auth/register/organisation", payload);
  if (!res.ok) {
    return { erreur: messageErreurApi(corps) };
  }

  redirect(`/verification-email?email=${encodeURIComponent(payload.responsableEmail)}`);
}

export async function inscrireIndividuelAction(
  _etat: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  if (formData.get("accepteCgu") !== "on") return { erreur: ERREUR_CGU };

  const payload = {
    nom: valeur(formData, "nom"),
    prenom: valeur(formData, "prenom"),
    email: valeur(formData, "email"),
    telephone: valeurOptionnelle(formData, "telephone"),
    motDePasse: valeur(formData, "motDePasse"),
  };

  const { res, corps } = await appelerApiPublic("/auth/register/individuel", payload);
  if (!res.ok) {
    return { erreur: messageErreurApi(corps) };
  }

  redirect(`/verification-email?email=${encodeURIComponent(payload.email)}`);
}

export async function connexionAction(_etat: EtatFormulaire, formData: FormData): Promise<EtatFormulaire> {
  const payload = {
    email: valeur(formData, "email"),
    motDePasse: valeur(formData, "motDePasse"),
  };

  const { res, corps } = await appelerApiPublic("/auth/login", payload);
  if (!res.ok) {
    return { erreur: messageErreurApi(corps, "Identifiants invalides.") };
  }

  const accessToken = extraireAccessTokenDepuisReponse(res);
  const estAdmin = accessToken
    ? (decoderPayloadJwt(accessToken)?.roles.includes("ADMIN_PLATEFORME") ?? false)
    : false;

  await synchroniserCookiesSession(res);

  const next = valeurOptionnelle(formData, "next");
  // Anti open-redirect : uniquement un chemin relatif interne (jamais "//hôte externe").
  const destinationParDefaut = estAdmin ? "/admin/reservations" : "/tableau-de-bord";
  const destination = next && next.startsWith("/") && !next.startsWith("//") ? next : destinationParDefaut;
  redirect(destination);
}

export async function renvoyerVerificationAction(
  _etat: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  await appelerApiPublic("/auth/resend-verification", { email: valeur(formData, "email") });
  return { erreur: undefined };
}

export interface EtatDemandeReinitialisation extends EtatFormulaire {
  envoye?: boolean;
}

export async function demanderReinitialisationAction(
  _etat: EtatDemandeReinitialisation,
  formData: FormData,
): Promise<EtatDemandeReinitialisation> {
  await appelerApiPublic("/auth/forgot-password", { email: valeur(formData, "email") });
  return { envoye: true };
}

export async function reinitialiserMotDePasseAction(
  _etat: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  const payload = {
    token: valeur(formData, "token"),
    nouveauMotDePasse: valeur(formData, "nouveauMotDePasse"),
  };

  const { res, corps } = await appelerApiPublic("/auth/reset-password", payload);
  if (!res.ok) {
    return { erreur: messageErreurApi(corps, "Lien invalide ou expiré.") };
  }

  // Même endpoint pour l'activation d'un utilisateur interne invité (§4.2) :
  // seul le message affiché après redirection change.
  redirect(valeur(formData, "origine") === "activation" ? "/login?active=true" : "/login?reset=true");
}

export async function deconnexionAction(): Promise<void> {
  await apiFetch("/auth/logout", { method: "POST" });
  await effacerCookiesSession();
  redirect("/login");
}

// D8.2 (U-01) — révocation d'une session PERSONNELLE uniquement : aucun
// utilisateurId dans l'URL, l'API scope déjà sur le token (voir AuthController).
export async function revoquerMaSessionAction(sessionId: string): Promise<EtatAction> {
  const res = await apiFetch(`/auth/me/sessions/${sessionId}/revoquer`, { method: "POST" });
  if (!res.ok) {
    const corps = await res.json().catch(() => undefined);
    return { erreur: messageErreurApi(corps, "Impossible de révoquer cette session.") };
  }
  revalidatePath("/mes-sessions");
  revalidatePath("/admin/mes-sessions");
  return { succes: true };
}

// Phase 5 (refonte frontend) — auto-édition du profil personnel, même pattern
// que modifierMonOrganisationAction (D8.1) : scope strictement le compte
// connecté côté API (PATCH /auth/me/profil), jamais un id fourni ici.
export async function modifierMonProfilAction(_etat: EtatAction, formData: FormData): Promise<EtatAction> {
  const nom = String(formData.get("nom") ?? "").trim();
  const prenom = String(formData.get("prenom") ?? "").trim();
  const telephone = String(formData.get("telephone") ?? "").trim();

  const res = await apiFetch("/auth/me/profil", {
    method: "PATCH",
    body: JSON.stringify({ nom, prenom, telephone }),
  });
  if (!res.ok) {
    const corps = await res.json().catch(() => undefined);
    return { erreur: messageErreurApi(corps, "Impossible de modifier le profil.") };
  }
  revalidatePath("/profil");
  revalidatePath("/admin/profil");
  return { succes: true };
}
