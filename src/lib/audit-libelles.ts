import type { BadgeVariant } from "@/components/ui/badge";

// Libellés de toutes les actions réellement tracées par l'API
// (auth, organisations, utilisateurs, paramètres), vérifié le 2026-09-30.
export const LIBELLES_ACTION: Record<string, string> = {
  connexion: "Connexion",
  deconnexion: "Déconnexion",
  "etablissement.activer": "Établissement activé",
  "etablissement.desactiver": "Établissement désactivé",
  "etablissement.modifier_coordonnees": "Coordonnées modifiées",
  "utilisateur.desactiver": "Utilisateur désactivé",
  "utilisateur.reactiver": "Utilisateur réactivé",
  "utilisateur.role.ajouter": "Rôle ajouté",
  "utilisateur.role.retirer": "Rôle retiré",
  "utilisateur.modifier_profil": "Profil modifié",
  "parametre.modifier": "Paramètre modifié",
};

export function varianteAction(action: string): BadgeVariant {
  if (action.endsWith("desactiver") || action.endsWith("retirer")) return "danger";
  if (action.endsWith("activer") || action.endsWith("reactiver") || action.endsWith("ajouter")) return "success";
  if (action === "connexion" || action === "deconnexion") return "neutral";
  return "info";
}

export function libelleAction(action: string) {
  return LIBELLES_ACTION[action] ?? action;
}
