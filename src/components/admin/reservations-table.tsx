"use client";

import { useState } from "react";
import Link from "next/link";
import { DataTable, type ColonneTable, type FiltreTable, type VueTable } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { StatutReservationBadge } from "@/components/reservations/badges";
import { IconCalendarClock, IconCheckCircle } from "@/components/icons";
import { formaterDate, formaterDateHeure, formaterFcfa } from "@/lib/format";
import { FixerDateRdvForm } from "./fixer-date-rdv-form";
import { MarquerRealiseeForm } from "./marquer-realisee-form";
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

function nomPersonne(r: Reservation): string {
  return r.utilisateur ? `${r.utilisateur.prenom} ${r.utilisateur.nom}` : "Client non renseigné";
}

function nomClient(r: Reservation): string {
  return r.organisation ? `${r.organisation.nom} (${nomPersonne(r)})` : nomPersonne(r);
}

export function ReservationsTable({ reservations }: { reservations: Reservation[] }) {
  const [reservationDateRdv, setReservationDateRdv] = useState<Reservation | null>(null);
  const [reservationRealisation, setReservationRealisation] = useState<Reservation | null>(null);

  const colonnes: ColonneTable<Reservation>[] = [
    {
      cle: "formation",
      entete: "Formation",
      masquable: false,
      render: (r) => (
        <div className="min-w-0">
          <p className="font-medium text-text">{r.formation?.titre ?? "Formation non renseignée"}</p>
          <p className="text-xs text-text-faint">{LIBELLES_FORMULE[r.formule]}</p>
        </div>
      ),
      valeurTri: (r) => r.formation?.titre ?? "",
      valeurRecherche: (r) => `${r.formation?.titre ?? ""} ${nomClient(r)} ${r.utilisateur?.email ?? ""}`,
      valeurExport: (r) => r.formation?.titre ?? "",
    },
    {
      cle: "client",
      entete: "Client",
      render: (r) => (
        <div className="min-w-0">
          {r.organisation ? (
            <Link href={`/admin/etablissements/${r.organisation.id}`} className="font-medium text-text hover:text-primary">
              {r.organisation.nom}
            </Link>
          ) : (
            <p className="font-medium text-text">{nomPersonne(r)}</p>
          )}
          <p className="text-xs text-text-faint">{r.organisation ? nomPersonne(r) : "Compte individuel"}</p>
        </div>
      ),
      valeurTri: (r) => nomClient(r),
      valeurExport: (r) => nomClient(r),
    },
    {
      cle: "formule",
      entete: "Formule",
      masqueeParDefaut: true,
      render: (r) => LIBELLES_FORMULE[r.formule],
      valeurTri: (r) => r.formule,
      valeurExport: (r) => LIBELLES_FORMULE[r.formule],
    },
    {
      cle: "tarif",
      entete: "Montant",
      render: (r) => <span className="whitespace-nowrap font-medium text-text tabular-nums">{formaterFcfa(r.tarifApplique)}</span>,
      valeurTri: (r) => r.tarifApplique,
      alignement: "right",
    },
    {
      // §12.5 — suivi des présences (session réalisée).
      cle: "presents",
      entete: "Présents",
      masqueeParDefaut: true,
      render: (r) =>
        r.statut === "REALISEE" ? (
          <span className="tabular-nums">{r.participantsPresents ?? (r.presenceConfirmee ? "oui" : "non")}</span>
        ) : (
          <span className="text-text-faint">—</span>
        ),
      valeurExport: (r) => (r.statut === "REALISEE" ? (r.participantsPresents ?? (r.presenceConfirmee ? "oui" : "non")) : ""),
    },
    {
      cle: "statut",
      entete: "Statut",
      render: (r) => <StatutReservationBadge statut={r.statut} />,
      valeurTri: (r) => r.statut,
      valeurExport: (r) => LIBELLES_STATUT[r.statut],
    },
    {
      cle: "dateRdv",
      entete: "Rendez-vous",
      render: (r) =>
        r.dateRdv ? (
          <span className="whitespace-nowrap tabular-nums">{formaterDateHeure(r.dateRdv)}</span>
        ) : r.statut === "PAYEE" ? (
          <span className="font-medium text-warning">À planifier</span>
        ) : (
          <span className="text-text-faint">Non fixé</span>
        ),
      valeurTri: (r) => r.dateRdv ?? "",
      valeurExport: (r) => (r.dateRdv ? formaterDateHeure(r.dateRdv) : ""),
    },
    {
      cle: "creee",
      entete: "Réservée le",
      render: (r) => <span className="whitespace-nowrap text-text-muted tabular-nums">{formaterDate(r.createdAt)}</span>,
      valeurTri: (r) => r.createdAt,
      valeurExport: (r) => formaterDate(r.createdAt),
    },
  ];

  const filtres: FiltreTable<Reservation>[] = [
    {
      cle: "formule",
      label: "Formule",
      options: Object.entries(LIBELLES_FORMULE).map(([valeur, label]) => ({ valeur, label })),
      valeur: (r) => r.formule,
    },
    {
      cle: "client",
      label: "Type de client",
      options: [
        { valeur: "etablissement", label: "Établissement" },
        { valeur: "individuel", label: "Individuel" },
      ],
      valeur: (r) => (r.organisation ? "etablissement" : "individuel"),
    },
  ];

  const vues: VueTable<Reservation>[] = [
    { cle: "toutes", label: "Toutes" },
    { cle: "a-planifier", label: "À planifier", filtre: (r) => r.statut === "PAYEE" },
    { cle: "confirmees", label: "Confirmées", filtre: (r) => r.statut === "CONFIRMEE" },
    { cle: "attente", label: "En attente de paiement", filtre: (r) => r.statut === "ATTENTE_PAIEMENT" },
    { cle: "realisees", label: "Réalisées", filtre: (r) => r.statut === "REALISEE" },
    { cle: "annulees", label: "Annulées", filtre: (r) => r.statut === "ANNULEE" },
  ];

  return (
    <div>
      <DataTable
        id="admin-reservations"
        colonnes={colonnes}
        lignes={reservations}
        cleLigne={(r) => r.id}
        rechercheEspaceReserve="Formation, client, email…"
        filtres={filtres}
        vues={vues}
        triParDefaut={{ cle: "creee", direction: "desc" }}
        exportCsv={{ nomFichier: "reservations-dps" }}
        vide={{
          titre: "Aucune réservation",
          description: "Les réservations de formations apparaîtront ici dès le premier paiement initié.",
        }}
        actionsLigne={(r) => [
          r.statut === "PAYEE" && {
            label: "Fixer la date de RDV",
            icone: IconCalendarClock,
            onSelect: () => setReservationDateRdv(r),
          },
          r.statut === "CONFIRMEE" && {
            label: "Clôturer la session",
            icone: IconCheckCircle,
            onSelect: () => setReservationRealisation(r),
          },
        ]}
      />

      <Modal
        open={reservationDateRdv !== null}
        onClose={() => setReservationDateRdv(null)}
        title="Fixer la date de rendez-vous"
        description={reservationDateRdv?.formation?.titre}
      >
        {reservationDateRdv && (
          <FixerDateRdvForm reservationId={reservationDateRdv.id} onSuccess={() => setReservationDateRdv(null)} />
        )}
      </Modal>

      <Modal
        open={reservationRealisation !== null}
        onClose={() => setReservationRealisation(null)}
        title="Clôturer la session"
        description={reservationRealisation?.formation?.titre}
      >
        {reservationRealisation && (
          <MarquerRealiseeForm
            reservationId={reservationRealisation.id}
            places={{ INDIVIDUEL: 1, GROUPE_5: 5, GROUPE_10: 10 }[reservationRealisation.formule]}
            onSuccess={() => setReservationRealisation(null)}
          />
        )}
      </Modal>
    </div>
  );
}
