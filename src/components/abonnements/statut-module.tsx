import { Badge } from "@/components/ui/badge";
import type { AbonnementModule } from "@/lib/types";

const JOUR_MS = 86_400_000;

// §5 — nombre de jours restants d'essai ou d'abonnement (null si sans objet).
export function joursRestants(abonnement: AbonnementModule | null | undefined): number | null {
  if (!abonnement) return null;
  const fin = abonnement.statut === "ESSAI" ? abonnement.essaiFin : abonnement.statut === "ACTIF" ? abonnement.expireLe : null;
  if (!fin) return null;
  return Math.max(0, Math.ceil((new Date(fin).getTime() - Date.now()) / JOUR_MS));
}

// §5 — statut d'un module : actif, essai (jours restants), expiré, suspendu.
export function StatutModuleBadge({ abonnement }: { abonnement: AbonnementModule | null | undefined }) {
  if (!abonnement) return <Badge variant="neutral">Non démarré</Badge>;
  const restants = joursRestants(abonnement);
  switch (abonnement.statut) {
    case "ACTIF":
      return <Badge variant="success">Actif{restants !== null ? ` · ${restants} j` : ""}</Badge>;
    case "ESSAI":
      return <Badge variant="warning">Essai · {restants} j restant{restants && restants > 1 ? "s" : ""}</Badge>;
    case "SUSPENDU":
      return <Badge variant="danger">Suspendu</Badge>;
    default:
      return <Badge variant="danger">Expiré</Badge>;
  }
}
