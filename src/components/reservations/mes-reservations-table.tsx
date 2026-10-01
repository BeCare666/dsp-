"use client";

import Link from "next/link";
import { DataTable, type ColonneTable, type VueTable } from "@/components/ui/data-table";
import { StatutReservationBadge } from "@/components/reservations/badges";
import { IconEye } from "@/components/icons";
import { formaterDate, formaterDateHeure, formaterFcfa } from "@/lib/format";
import type { FormuleFormation, Reservation, StatutReservation } from "@/lib/types";

const LIBELLES_FORMULE: Record<FormuleFormation, string> = {
  INDIVIDUEL: "Individuel",
  GROUPE_5: "Groupe 5",
  GROUPE_10: "Groupe 10",
};

const LIBELLES_STATUT: Record<StatutReservation, string> = {
  ATTENTE_PAIEMENT: "En attente de paiement",
  PAYEE: "Payée",
  CONFIRMEE: "Confirmée",
  REALISEE: "Réalisée",
  ANNULEE: "Annulée",
};

export function MesReservationsTable({ reservations }: { reservations: Reservation[] }) {
  const colonnes: ColonneTable<Reservation>[] = [
    {
      cle: "formation",
      entete: "Formation",
      masquable: false,
      render: (r) => (
        <div className="min-w-0">
          <Link href={`/mes-reservations/${r.id}`} className="font-medium text-text hover:text-primary">
            {r.formation?.titre ?? "Formation"}
          </Link>
          <p className="text-xs text-text-faint">{LIBELLES_FORMULE[r.formule]}</p>
        </div>
      ),
      valeurTri: (r) => r.formation?.titre ?? "",
      valeurRecherche: (r) => r.formation?.titre ?? "",
    },
    {
      cle: "montant",
      entete: "Montant",
      render: (r) => <span className="whitespace-nowrap font-medium text-text tabular-nums">{formaterFcfa(r.tarifApplique)}</span>,
      valeurTri: (r) => r.tarifApplique,
      alignement: "right",
    },
    {
      cle: "statut",
      entete: "Statut",
      render: (r) => <StatutReservationBadge statut={r.statut} />,
      valeurTri: (r) => r.statut,
      valeurExport: (r) => LIBELLES_STATUT[r.statut],
    },
    {
      cle: "rdv",
      entete: "Rendez-vous",
      render: (r) =>
        r.dateRdv ? (
          <span className="whitespace-nowrap tabular-nums">{formaterDateHeure(r.dateRdv)}</span>
        ) : (
          <span className="text-text-faint">{r.statut === "PAYEE" ? "En cours de planification" : "Non fixé"}</span>
        ),
      valeurTri: (r) => r.dateRdv ?? "",
    },
    {
      cle: "creee",
      entete: "Réservée le",
      render: (r) => <span className="whitespace-nowrap text-text-muted tabular-nums">{formaterDate(r.createdAt)}</span>,
      valeurTri: (r) => r.createdAt,
    },
  ];

  const vues: VueTable<Reservation>[] = [
    { cle: "toutes", label: "Toutes" },
    {
      cle: "a-venir",
      label: "À venir",
      filtre: (r) => r.statut === "PAYEE" || r.statut === "CONFIRMEE",
    },
    { cle: "attente", label: "En attente de paiement", filtre: (r) => r.statut === "ATTENTE_PAIEMENT" },
    { cle: "realisees", label: "Réalisées", filtre: (r) => r.statut === "REALISEE" },
  ];

  return (
    <DataTable
      id="mes-reservations"
      colonnes={colonnes}
      lignes={reservations}
      cleLigne={(r) => r.id}
      rechercheEspaceReserve="Rechercher une formation…"
      vues={vues}
      triParDefaut={{ cle: "creee", direction: "desc" }}
      lienLigne={(r) => `/mes-reservations/${r.id}`}
      vide={{
        titre: "Aucune réservation",
        description: "Réservez une formation depuis le catalogue pour la retrouver ici.",
      }}
      actionsLigne={(r) => [{ label: "Voir le détail", icone: IconEye, href: `/mes-reservations/${r.id}` }]}
    />
  );
}
