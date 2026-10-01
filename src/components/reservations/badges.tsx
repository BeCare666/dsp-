import { Badge, type BadgeVariant } from "@/components/ui/badge";
import type { StatutReservation } from "@/lib/types";

export function StatutReservationBadge({ statut }: { statut: StatutReservation }) {
  const variants: Record<StatutReservation, BadgeVariant> = {
    ATTENTE_PAIEMENT: "warning",
    PAYEE: "primary",
    CONFIRMEE: "success",
    REALISEE: "success",
    ANNULEE: "neutral",
  };
  const libelles: Record<StatutReservation, string> = {
    ATTENTE_PAIEMENT: "En attente de paiement",
    PAYEE: "Payée",
    CONFIRMEE: "Confirmée",
    REALISEE: "Réalisée",
    ANNULEE: "Annulée",
  };
  return <Badge variant={variants[statut]}>{libelles[statut]}</Badge>;
}
