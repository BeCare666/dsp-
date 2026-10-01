"use client";

import Link from "next/link";
import { DataTable, type ColonneTable, type FiltreTable, type VueTable } from "@/components/ui/data-table";
import { GraviteBadge, LIBELLES_STATUT_EI, StatutEiBadge } from "@/components/ei/badges";
import { IconEye } from "@/components/icons";
import { formaterDate } from "@/lib/format";
import type { EvenementIndesirable } from "@/lib/types";

function unique<T>(valeurs: (T | null | undefined)[]): T[] {
  return [...new Set(valeurs.filter((v): v is T => v !== null && v !== undefined))];
}

export function EvenementsTable({ evenements }: { evenements: EvenementIndesirable[] }) {
  const types = unique(evenements.map((e) => e.typeEi)).filter(
    (t, i, tous) => tous.findIndex((x) => x.id === t.id) === i,
  );
  const services = unique(evenements.map((e) => e.service)).filter(
    (s, i, tous) => tous.findIndex((x) => x.id === s.id) === i,
  );
  const niveaux = unique(evenements.map((e) => e.niveauGravite)).filter(
    (n, i, tous) => tous.findIndex((x) => x.id === n.id) === i,
  );

  const colonnes: ColonneTable<EvenementIndesirable>[] = [
    {
      cle: "description",
      entete: "Événement",
      masquable: false,
      largeur: "40%",
      render: (e) => (
        <Link href={`/evenements-indesirables/${e.id}`} className="line-clamp-2 font-medium text-text hover:text-primary">
          {e.description}
        </Link>
      ),
      valeurRecherche: (e) => `${e.description} ${e.typeEi?.libelle ?? ""} ${e.service?.nom ?? ""}`,
      valeurExport: (e) => e.description,
    },
    {
      cle: "type",
      entete: "Type",
      render: (e) => (e.typeEi ? e.typeEi.libelle : <span className="text-text-faint">Non précisé</span>),
      valeurTri: (e) => e.typeEi?.libelle ?? "",
      valeurExport: (e) => e.typeEi?.libelle ?? "",
    },
    {
      cle: "service",
      entete: "Service",
      render: (e) => (e.service ? e.service.nom : <span className="text-text-faint">Non précisé</span>),
      valeurTri: (e) => e.service?.nom ?? "",
      valeurExport: (e) => e.service?.nom ?? "",
    },
    {
      cle: "gravite",
      entete: "Gravité",
      render: (e) => <GraviteBadge niveau={e.niveauGravite} />,
      valeurTri: (e) => -(e.niveauGravite?.ordre ?? 0),
      valeurExport: (e) => e.niveauGravite?.libelle ?? "",
    },
    {
      cle: "statut",
      entete: "Statut",
      render: (e) => <StatutEiBadge statut={e.statut} />,
      valeurTri: (e) => e.statut,
      valeurExport: (e) => LIBELLES_STATUT_EI[e.statut],
    },
    {
      cle: "date",
      entete: "Survenu le",
      render: (e) => <span className="whitespace-nowrap text-text-muted tabular-nums">{formaterDate(e.dateSurvenue)}</span>,
      valeurTri: (e) => e.dateSurvenue,
      valeurExport: (e) => formaterDate(e.dateSurvenue),
    },
  ];

  const filtres: FiltreTable<EvenementIndesirable>[] = [
    {
      cle: "gravite",
      label: "Gravité",
      options: niveaux.sort((a, b) => a.ordre - b.ordre).map((n) => ({ valeur: n.id, label: n.libelle })),
      valeur: (e) => e.niveauGraviteId,
    },
    ...(types.length > 0
      ? [
          {
            cle: "type",
            label: "Type",
            options: types.map((t) => ({ valeur: t.id, label: t.libelle })),
            valeur: (e: EvenementIndesirable) => e.typeEiId,
          },
        ]
      : []),
    ...(services.length > 0
      ? [
          {
            cle: "service",
            label: "Service",
            options: services.map((s) => ({ valeur: s.id, label: s.nom })),
            valeur: (e: EvenementIndesirable) => e.serviceId,
          },
        ]
      : []),
  ];

  const vues: VueTable<EvenementIndesirable>[] = [
    { cle: "tous", label: "Tous" },
    { cle: "a-qualifier", label: "À qualifier", filtre: (e) => e.statut === "DECLARE" },
    { cle: "en-analyse", label: "En analyse", filtre: (e) => e.statut === "QUALIFIE" || e.statut === "EN_ANALYSE" },
    { cle: "plan-action", label: "Plan d'action", filtre: (e) => e.statut === "PLAN_ACTION" },
    { cle: "graves", label: "Gravité élevée", filtre: (e) => Boolean(e.niveauGravite?.critique) && e.statut !== "CLOTURE" },
    { cle: "clotures", label: "Clôturés", filtre: (e) => e.statut === "CLOTURE" },
  ];

  return (
    <DataTable
      id="ei-evenements"
      colonnes={colonnes}
      lignes={evenements}
      cleLigne={(e) => e.id}
      rechercheEspaceReserve="Description, type, service…"
      filtres={filtres}
      vues={vues}
      triParDefaut={{ cle: "date", direction: "desc" }}
      lienLigne={(e) => `/evenements-indesirables/${e.id}`}
      vide={{
        titre: "Aucun événement déclaré",
        description: "Les événements indésirables déclarés dans votre établissement apparaîtront ici.",
      }}
      actionsLigne={(e) => [{ label: "Ouvrir", icone: IconEye, href: `/evenements-indesirables/${e.id}` }]}
    />
  );
}
