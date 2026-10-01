"use client";

import Link from "next/link";
import { DataTable, type ColonneTable, type FiltreTable, type VueTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { IconEye, IconShieldAlert, IconVitals } from "@/components/icons";
import { formaterDateHeure } from "@/lib/format";
import type { LigneAlertePlateforme } from "@/lib/types";

const LIBELLES_NIVEAU: Record<string, string> = {
  ELEVE: "Élevé",
  MOYEN: "Moyen",
};

const LIBELLES_STATUT: Record<string, string> = {
  OUVERTE: "Ouverte",
  EN_COURS: "En cours",
  DECLARE: "Déclaré",
  QUALIFIE: "Qualifié",
  EN_ANALYSE: "En analyse",
  PLAN_ACTION: "Plan d'action",
};

const LIBELLES_SOURCE: Record<LigneAlertePlateforme["source"], string> = {
  NEWS: "Score NEWS",
  EI: "Événement indésirable",
};

export function AlertesTable({ lignes }: { lignes: LigneAlertePlateforme[] }) {
  const colonnes: ColonneTable<LigneAlertePlateforme>[] = [
    {
      cle: "organisation",
      entete: "Établissement",
      masquable: false,
      render: (l) => (
        <Link href={`/admin/etablissements/${l.organisationId}`} className="font-medium text-text hover:text-primary">
          {l.organisationNom}
        </Link>
      ),
      valeurTri: (l) => l.organisationNom,
      valeurRecherche: (l) => l.organisationNom,
    },
    {
      cle: "source",
      entete: "Module",
      render: (l) => {
        const Icone = l.source === "NEWS" ? IconVitals : IconShieldAlert;
        return (
          <span className="inline-flex items-center gap-2 text-text">
            <Icone width={16} height={16} className="text-text-faint" />
            {LIBELLES_SOURCE[l.source]}
          </span>
        );
      },
      valeurTri: (l) => l.source,
      valeurExport: (l) => LIBELLES_SOURCE[l.source],
    },
    {
      cle: "niveau",
      entete: "Niveau",
      render: (l) => (
        <Badge variant={l.niveau === "ELEVE" ? "danger" : l.niveau === "MOYEN" ? "warning" : "neutral"}>
          {LIBELLES_NIVEAU[l.niveau] ?? l.niveau}
        </Badge>
      ),
      // Élevé avant moyen dans un tri croissant « par gravité ».
      valeurTri: (l) => (l.niveau === "ELEVE" ? 0 : l.niveau === "MOYEN" ? 1 : 2),
      valeurExport: (l) => LIBELLES_NIVEAU[l.niveau] ?? l.niveau,
    },
    {
      cle: "statut",
      entete: "Statut",
      render: (l) => LIBELLES_STATUT[l.statut] ?? l.statut,
      valeurTri: (l) => l.statut,
      valeurExport: (l) => LIBELLES_STATUT[l.statut] ?? l.statut,
    },
    {
      cle: "nombre",
      entete: "Nombre",
      render: (l) => <span className="font-display text-base font-bold text-text tabular-nums">{l.nombre}</span>,
      valeurTri: (l) => l.nombre,
      alignement: "right",
    },
    {
      cle: "depuis",
      entete: "La plus ancienne depuis",
      render: (l) => <span className="whitespace-nowrap text-text-muted tabular-nums">{formaterDateHeure(l.depuisLe)}</span>,
      valeurTri: (l) => l.depuisLe,
      valeurExport: (l) => formaterDateHeure(l.depuisLe),
    },
  ];

  const filtres: FiltreTable<LigneAlertePlateforme>[] = [
    {
      cle: "niveau",
      label: "Niveau",
      options: Object.entries(LIBELLES_NIVEAU).map(([valeur, label]) => ({ valeur, label })),
      valeur: (l) => l.niveau,
    },
    {
      cle: "statut",
      label: "Statut",
      options: Object.entries(LIBELLES_STATUT).map(([valeur, label]) => ({ valeur, label })),
      valeur: (l) => l.statut,
    },
  ];

  const vues: VueTable<LigneAlertePlateforme>[] = [
    { cle: "toutes", label: "Toutes" },
    { cle: "news", label: "Score NEWS", filtre: (l) => l.source === "NEWS" },
    { cle: "ei", label: "Événements indésirables", filtre: (l) => l.source === "EI" },
  ];

  return (
    <DataTable
      id="admin-alertes"
      colonnes={colonnes}
      lignes={lignes}
      cleLigne={(l) => `${l.organisationId}-${l.source}-${l.niveau}-${l.statut}`}
      rechercheEspaceReserve="Rechercher un établissement…"
      filtres={filtres}
      vues={vues}
      triParDefaut={{ cle: "depuis", direction: "asc" }}
      lienLigne={(l) => `/admin/etablissements/${l.organisationId}`}
      exportCsv={{ nomFichier: "alertes-plateforme-dps" }}
      vide={{
        titre: "Aucune alerte ouverte",
        description: "Aucun établissement n'a d'alerte NEWS ni d'événement grave non clôturé.",
      }}
      actionsLigne={(l) => [
        { label: "Voir l'établissement", icone: IconEye, href: `/admin/etablissements/${l.organisationId}` },
      ]}
    />
  );
}
