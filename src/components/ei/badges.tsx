import { Badge, type BadgeVariant } from "@/components/ui/badge";
import type { NiveauGraviteEi, PrioriteEi, StatutActionCorrective, StatutEi } from "@/lib/types";

// §8.2 / §8.5 — libellés du circuit de traitement, dans l'ordre.
export const LIBELLES_STATUT_EI: Record<StatutEi, string> = {
  DECLARE: "Déclaré",
  QUALIFIE: "Qualifié",
  EN_ANALYSE: "En analyse",
  PLAN_ACTION: "Plan d'action",
  CLOTURE: "Clôturé",
};

export const LIBELLES_PRIORITE_EI: Record<PrioriteEi, string> = {
  HAUTE: "Priorité haute",
  NORMALE: "Priorité normale",
  BASSE: "Priorité basse",
};

// Gravité paramétrable (§12.4) : un niveau « critique » = gravité élevée.
export function GraviteBadge({ niveau }: { niveau: NiveauGraviteEi | null | undefined }) {
  if (!niveau) return <Badge variant="neutral">Gravité non renseignée</Badge>;
  return <Badge variant={niveau.critique ? "danger" : "warning"}>{niveau.libelle}</Badge>;
}

export function StatutEiBadge({ statut }: { statut: StatutEi }) {
  const variants: Record<StatutEi, BadgeVariant> = {
    DECLARE: "primary",
    QUALIFIE: "info",
    EN_ANALYSE: "warning",
    PLAN_ACTION: "warning",
    CLOTURE: "success",
  };
  return <Badge variant={variants[statut]}>{LIBELLES_STATUT_EI[statut]}</Badge>;
}

export function PrioriteBadge({ priorite }: { priorite: PrioriteEi | null }) {
  if (!priorite) return null;
  const variants: Record<PrioriteEi, BadgeVariant> = { HAUTE: "danger", NORMALE: "neutral", BASSE: "neutral" };
  return <Badge variant={variants[priorite]}>{LIBELLES_PRIORITE_EI[priorite]}</Badge>;
}

export function StatutActionBadge({ statut }: { statut: StatutActionCorrective }) {
  const variants: Record<StatutActionCorrective, BadgeVariant> = {
    A_FAIRE: "neutral",
    EN_COURS: "warning",
    REALISEE: "success",
  };
  const libelles: Record<StatutActionCorrective, string> = {
    A_FAIRE: "À faire",
    EN_COURS: "En cours",
    REALISEE: "Réalisée",
  };
  return <Badge variant={variants[statut]}>{libelles[statut]}</Badge>;
}
