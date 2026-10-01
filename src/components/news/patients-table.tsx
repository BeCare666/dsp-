"use client";

import Link from "next/link";
import { DataTable, type ColonneTable, type VueTable } from "@/components/ui/data-table";
import { StatutPatientBadge } from "@/components/news/badges";
import { IconEye } from "@/components/icons";
import { formaterDate } from "@/lib/format";
import type { Patient } from "@/lib/types";

export function PatientsTable({ patients }: { patients: Patient[] }) {
  const colonnes: ColonneTable<Patient>[] = [
    {
      cle: "identifiant",
      entete: "Patient",
      masquable: false,
      render: (p) => (
        <Link href={`/news/${p.id}`} className="block truncate font-mono text-sm font-medium text-text hover:text-primary">
          {p.identifiantInterne}
        </Link>
      ),
      valeurTri: (p) => p.identifiantInterne,
      valeurRecherche: (p) => `${p.identifiantInterne} ${p.numeroLit ?? ""} ${p.service?.nom ?? ""}`,
      valeurExport: (p) => p.identifiantInterne,
    },
    {
      cle: "service",
      entete: "Service",
      render: (p) => <span className="text-text-muted">{p.service?.nom ?? "—"}</span>,
      valeurTri: (p) => p.service?.nom ?? "",
      valeurExport: (p) => p.service?.nom ?? "",
    },
    {
      cle: "lit",
      entete: "Lit",
      render: (p) => <span className="tabular-nums text-text-muted">{p.numeroLit ?? "—"}</span>,
      valeurTri: (p) => p.numeroLit ?? "",
      valeurExport: (p) => p.numeroLit ?? "",
    },
    {
      cle: "admission",
      entete: "Admission",
      render: (p) => <span className="whitespace-nowrap text-text-muted tabular-nums">{formaterDate(p.dateAdmission)}</span>,
      valeurTri: (p) => p.dateAdmission,
      valeurExport: (p) => formaterDate(p.dateAdmission),
    },
    {
      cle: "sortie",
      entete: "Sortie",
      render: (p) =>
        p.dateSortie ? (
          <span className="whitespace-nowrap text-text-muted tabular-nums">{formaterDate(p.dateSortie)}</span>
        ) : (
          <span className="text-text-faint">En cours</span>
        ),
      valeurTri: (p) => p.dateSortie ?? "",
      valeurExport: (p) => (p.dateSortie ? formaterDate(p.dateSortie) : ""),
    },
    {
      cle: "statut",
      entete: "Statut",
      render: (p) => <StatutPatientBadge statut={p.statut} />,
      valeurTri: (p) => p.statut,
      valeurExport: (p) => (p.statut === "SORTI" ? "Sorti" : "Hospitalisé"),
    },
  ];

  const vues: VueTable<Patient>[] = [
    { cle: "hospitalises", label: "Hospitalisés", filtre: (p) => p.statut === "HOSPITALISE" },
    { cle: "sortis", label: "Sortis", filtre: (p) => p.statut === "SORTI" },
    { cle: "tous", label: "Tous" },
  ];

  return (
    <DataTable
      id="news-patients"
      colonnes={colonnes}
      lignes={patients}
      cleLigne={(p) => p.id}
      rechercheEspaceReserve="Identifiant, lit, service…"
      vues={vues}
      triParDefaut={{ cle: "admission", direction: "desc" }}
      lienLigne={(p) => `/news/${p.id}`}
      vide={{
        titre: "Aucun patient",
        description: "Enregistrez un patient pour commencer la surveillance NEWS.",
      }}
      actionsLigne={(p) => [{ label: "Ouvrir le dossier", icone: IconEye, href: `/news/${p.id}` }]}
    />
  );
}
