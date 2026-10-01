"use server";

import { redirect } from "next/navigation";
import { apiFetch, apiFetchJson, ApiError } from "./api-server";
import { messageErreurApi } from "./api-error";
import type { SessionEvaluation } from "./types";

export async function demarrerSessionAction(grilleId: string): Promise<{ erreur?: string }> {
  try {
    const session = await apiFetchJson<{ id: string }>("/sessions-evaluation", {
      method: "POST",
      body: JSON.stringify({ grilleId }),
    });
    redirect(`/auto-evaluation/${session.id}`);
  } catch (erreur) {
    if (erreur instanceof ApiError) {
      return { erreur: messageErreurApi(erreur.body, "Impossible de démarrer la session.") };
    }
    throw erreur;
  }
}

export interface ResultatEnregistrement {
  succes: boolean;
  erreur?: string;
}

export async function enregistrerReponseAction(
  sessionId: string,
  elementMesurableId: string,
  valeur: unknown,
): Promise<ResultatEnregistrement> {
  try {
    const res = await apiFetch(`/sessions-evaluation/${sessionId}/reponses/${elementMesurableId}`, {
      method: "PUT",
      body: JSON.stringify({ valeur }),
    });
    if (!res.ok) {
      const corps = await res.json().catch(() => undefined);
      return { succes: false, erreur: messageErreurApi(corps, "Échec de l'enregistrement.") };
    }
    return { succes: true };
  } catch {
    return { succes: false, erreur: "Connexion au serveur impossible." };
  }
}

export async function soumettreSessionAction(sessionId: string): Promise<{ erreur?: string }> {
  try {
    await apiFetchJson<SessionEvaluation>(`/sessions-evaluation/${sessionId}/soumettre`, { method: "POST" });
  } catch (erreur) {
    if (erreur instanceof ApiError) {
      return { erreur: messageErreurApi(erreur.body, "Impossible de soumettre la session.") };
    }
    throw erreur;
  }
  redirect(`/auto-evaluation/${sessionId}/resultats`);
}
