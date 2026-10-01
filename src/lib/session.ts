import "server-only";
import { cookies } from "next/headers";
import { aLaPermission, type Permission, type RoleUtilisateur } from "@dps/shared";

export type { RoleUtilisateur };

export interface SessionPayload {
  sub: string;
  typeCompte: "ORGANISATION" | "INDIVIDUEL" | "ADMIN_PLATEFORME";
  organisationId: string | null;
  serviceId: string | null;
  roles: RoleUtilisateur[];
}

// Décodage local du JWT (pas de vérification de signature) : sert uniquement à
// adapter l'affichage (afficher/masquer des actions) — l'autorisation réelle
// est toujours appliquée côté API via @Roles/RolesGuard.
export function decoderPayloadJwt(token: string): SessionPayload | null {
  const partie = token.split(".")[1];
  if (!partie) return null;

  try {
    const json = Buffer.from(partie, "base64url").toString("utf8");
    return JSON.parse(json) as SessionPayload;
  } catch {
    return null;
  }
}

export async function obtenirSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get("access_token")?.value;
  if (!token) return null;
  return decoderPayloadJwt(token);
}

export async function aRole(...roles: RoleUtilisateur[]): Promise<boolean> {
  const session = await obtenirSession();
  if (!session) return false;
  return session.roles.some((r) => roles.includes(r));
}

// Confort d'affichage uniquement (afficher/masquer un bouton, un lien de nav) —
// jamais une couche de sécurité. L'autorisation réelle est systématiquement
// revérifiée côté API par PermissionsGuard (@dps/shared, même catalogue).
export async function aPermission(permission: Permission): Promise<boolean> {
  const session = await obtenirSession();
  if (!session) return false;
  return aLaPermission(session.roles, permission);
}

export const ROLES_TRAITEMENT_EI: RoleUtilisateur[] = ["RESP_QUALITE", "RESPONSABLE_COMPTE"];
