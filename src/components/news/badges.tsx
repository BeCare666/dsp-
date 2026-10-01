import { Badge, type BadgeVariant } from "@/components/ui/badge";
import type { NiveauRisqueNews, StatutAlerte, StatutPatient } from "@/lib/types";

export function RisqueBadge({ niveau }: { niveau: NiveauRisqueNews }) {
  const variants: Record<NiveauRisqueNews, BadgeVariant> = { ELEVE: "danger", MOYEN: "warning", BAS: "success" };
  const libelles: Record<NiveauRisqueNews, string> = { ELEVE: "Risque élevé", MOYEN: "Risque moyen", BAS: "Risque bas" };
  return <Badge variant={variants[niveau]}>{libelles[niveau]}</Badge>;
}

export function StatutAlerteBadge({ statut }: { statut: StatutAlerte }) {
  const variants: Record<StatutAlerte, BadgeVariant> = { OUVERTE: "danger", EN_COURS: "warning", CLOTUREE: "success" };
  const libelles: Record<StatutAlerte, string> = { OUVERTE: "Ouverte", EN_COURS: "En cours", CLOTUREE: "Clôturée" };
  return <Badge variant={variants[statut]}>{libelles[statut]}</Badge>;
}

export function StatutPatientBadge({ statut }: { statut: StatutPatient }) {
  if (statut === "SORTI") return <Badge variant="neutral">Sorti</Badge>;
  return <Badge variant="primary">Hospitalisé</Badge>;
}
