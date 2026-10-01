"use client";

import Link from "next/link";
import { DataTable, type ColonneTable, type FiltreTable, type VueTable } from "@/components/ui/data-table";
import { RisqueBadge, StatutAlerteBadge } from "@/components/news/badges";
import { IconEye } from "@/components/icons";
import { formaterDateHeure } from "@/lib/format";
import type { Alerte, NiveauRisqueNews, StatutAlerte } from "@/lib/types";
import { libellePatient } from "@/lib/patient-libelle";

const LIBELLES_RISQUE: Record<NiveauRisqueNews, string> = { ELEVE: "Élevé", MOYEN: "Moyen", BAS: "Bas" };
const LIBELLES_STATUT: Record<StatutAlerte, string> = { OUVERTE: "Ouverte", EN_COURS: "En cours", CLOTUREE: "Clôturée" };
const ORDRE_RISQUE: Record<NiveauRisqueNews, number> = { ELEVE: 0, MOYEN: 1, BAS: 2 };

function nomPatient(a: Alerte) {
  return libellePatient(a.patient);
}

export function AlertesNewsTable({ alertes }: { alertes: Alerte[] }) {
  const colonnes: ColonneTable<Alerte>[] = [
    {
      cle: "patient",
      entete: "Patient",
      masquable: false,
      render: (a) => (
        <Link href={`/news/alertes/${a.id}`} className="font-medium text-text hover:text-primary">
          {nomPatient(a)}
        </Link>
      ),
      valeurTri: (a) => nomPatient(a),
      valeurRecherche: (a) => nomPatient(a),
    },
    {
      cle: "score",
      entete: "Score NEWS",
      render: (a) =>
        a.mesure ? (
          <span className="font-display text-base font-bold text-text tabular-nums">{a.mesure.scoreTotal}</span>
        ) : (
          <span className="text-text-faint">Non disponible</span>
        ),
      valeurTri: (a) => a.mesure?.scoreTotal ?? -1,
      valeurExport: (a) => a.mesure?.scoreTotal ?? "",
      alignement: "right",
    },
    {
      cle: "risque",
      entete: "Risque",
      render: (a) => <RisqueBadge niveau={a.niveauRisque} />,
      valeurTri: (a) => ORDRE_RISQUE[a.niveauRisque],
      valeurExport: (a) => LIBELLES_RISQUE[a.niveauRisque],
    },
    {
      cle: "statut",
      entete: "Statut",
      render: (a) => <StatutAlerteBadge statut={a.statut} />,
      valeurTri: (a) => a.statut,
      valeurExport: (a) => LIBELLES_STATUT[a.statut],
    },
    {
      cle: "date",
      entete: "Déclenchée le",
      render: (a) => <span className="whitespace-nowrap text-text-muted tabular-nums">{formaterDateHeure(a.createdAt)}</span>,
      valeurTri: (a) => a.createdAt,
      valeurExport: (a) => formaterDateHeure(a.createdAt),
    },
  ];

  const filtres: FiltreTable<Alerte>[] = [
    {
      cle: "risque",
      label: "Risque",
      options: (["ELEVE", "MOYEN", "BAS"] as NiveauRisqueNews[]).map((n) => ({ valeur: n, label: LIBELLES_RISQUE[n] })),
      valeur: (a) => a.niveauRisque,
    },
  ];

  const vues: VueTable<Alerte>[] = [
    { cle: "toutes", label: "Toutes" },
    { cle: "ouvertes", label: "Ouvertes", filtre: (a) => a.statut === "OUVERTE" },
    { cle: "en-cours", label: "En cours", filtre: (a) => a.statut === "EN_COURS" },
    { cle: "cloturees", label: "Clôturées", filtre: (a) => a.statut === "CLOTUREE" },
  ];

  return (
    <DataTable
      id="news-alertes"
      colonnes={colonnes}
      lignes={alertes}
      cleLigne={(a) => a.id}
      rechercheEspaceReserve="Nom du patient, dossier…"
      filtres={filtres}
      vues={vues}
      triParDefaut={{ cle: "date", direction: "desc" }}
      lienLigne={(a) => `/news/alertes/${a.id}`}
      vide={{
        titre: "Aucune alerte",
        description: "Une alerte est créée automatiquement dès qu'un score NEWS dépasse le seuil bas.",
      }}
      actionsLigne={(a) => [{ label: "Ouvrir l'alerte", icone: IconEye, href: `/news/alertes/${a.id}` }]}
    />
  );
}
