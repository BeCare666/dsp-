"use client";

import { DataTable, type ColonneTable } from "@/components/ui/data-table";
import { formaterDate } from "@/lib/format";
import type { ConformiteEtablissement } from "@/lib/types";

// §6.5 — comparaison des niveaux de conformité entre établissements
// (dernier score soumis par grille, tendance par rapport au précédent).
export function ConformiteTable({ lignes }: { lignes: ConformiteEtablissement[] }) {
  const colonnes: ColonneTable<ConformiteEtablissement>[] = [
    {
      cle: "etablissement",
      entete: "Établissement",
      masquable: false,
      render: (l) => <span className="font-medium text-text">{l.organisationNom}</span>,
      valeurTri: (l) => l.organisationNom,
      valeurRecherche: (l) => `${l.organisationNom} ${l.grille}`,
      valeurExport: (l) => l.organisationNom,
    },
    { cle: "categorie", entete: "Catégorie ARS", render: (l) => l.categorie, valeurTri: (l) => l.categorie, valeurExport: (l) => l.categorie },
    { cle: "grille", entete: "Grille", render: (l) => l.grille, valeurTri: (l) => l.grille, valeurExport: (l) => l.grille },
    {
      cle: "score",
      entete: "Dernier score",
      alignement: "right",
      render: (l) => <span className="font-display font-bold tabular-nums">{l.dernierScore ?? "—"} %</span>,
      valeurTri: (l) => l.dernierScore ?? -1,
      valeurExport: (l) => l.dernierScore ?? "",
    },
    {
      cle: "tendance",
      entete: "Évolution",
      alignement: "right",
      render: (l) => {
        if (l.scorePrecedent === null || l.dernierScore === null) return <span className="text-text-faint">—</span>;
        const ecart = Math.round((l.dernierScore - l.scorePrecedent) * 100) / 100;
        return (
          <span className={`tabular-nums ${ecart > 0 ? "text-success" : ecart < 0 ? "text-danger" : "text-text-muted"}`}>
            {ecart > 0 ? "+" : ""}
            {ecart} pts
          </span>
        );
      },
      valeurTri: (l) => (l.dernierScore ?? 0) - (l.scorePrecedent ?? l.dernierScore ?? 0),
      valeurExport: (l) => (l.scorePrecedent === null || l.dernierScore === null ? "" : l.dernierScore - l.scorePrecedent),
    },
    {
      cle: "evaluations",
      entete: "Évaluations",
      alignement: "right",
      render: (l) => <span className="tabular-nums">{l.nombreEvaluations}</span>,
      valeurTri: (l) => l.nombreEvaluations,
      valeurExport: (l) => l.nombreEvaluations,
    },
    {
      cle: "date",
      entete: "Dernière soumission",
      render: (l) => (l.derniereSoumission ? formaterDate(l.derniereSoumission) : "—"),
      valeurTri: (l) => l.derniereSoumission ?? "",
      valeurExport: (l) => (l.derniereSoumission ? formaterDate(l.derniereSoumission) : ""),
    },
  ];

  return (
    <DataTable
      id="admin-conformite"
      colonnes={colonnes}
      lignes={lignes}
      cleLigne={(l) => `${l.organisationId}-${l.grille}`}
      rechercheEspaceReserve="Établissement, grille…"
      triParDefaut={{ cle: "score", direction: "desc" }}
      lienLigne={(l) => `/admin/etablissements/${l.organisationId}`}
      exportCsv={{ nomFichier: "conformite-etablissements" }}
      vide={{ titre: "Aucune évaluation soumise", description: "Les scores apparaîtront après les premières auto-évaluations." }}
    />
  );
}
