"use client";

import Link from "next/link";
import { DataTable, type ColonneTable } from "@/components/ui/data-table";
import { IconEye } from "@/components/icons";
import { formaterDate } from "@/lib/format";
import type { SessionEvaluationResume } from "@/lib/types";

// Historique des auto-évaluations soumises (score calculé côté serveur, RM2).
// Barre de score volontairement monochrome : aucun seuil « bon / moyen /
// insuffisant » n'est défini par le CDC ni par l'API, on n'en invente pas.
export function HistoriqueTable({ sessions }: { sessions: SessionEvaluationResume[] }) {
  const colonnes: ColonneTable<SessionEvaluationResume>[] = [
    {
      cle: "grille",
      entete: "Grille",
      masquable: false,
      render: (s) => (
        <div className="min-w-0">
          <Link href={`/auto-evaluation/${s.id}/resultats`} className="font-medium text-text hover:text-primary">
            {s.grille.nom}
          </Link>
          <p className="text-xs text-text-faint">Version {s.grille.version}</p>
        </div>
      ),
      valeurTri: (s) => s.grille.nom,
      valeurRecherche: (s) => s.grille.nom,
    },
    {
      cle: "soumission",
      entete: "Soumise le",
      render: (s) =>
        s.dateSoumission ? (
          <span className="whitespace-nowrap text-text-muted tabular-nums">{formaterDate(s.dateSoumission)}</span>
        ) : (
          <span className="text-text-faint">Non renseignée</span>
        ),
      valeurTri: (s) => s.dateSoumission ?? "",
      valeurExport: (s) => (s.dateSoumission ? formaterDate(s.dateSoumission) : ""),
    },
    {
      cle: "score",
      entete: "Score global",
      render: (s) =>
        s.scoreGlobal === null ? (
          <span className="text-text-faint">Non calculé</span>
        ) : (
          <div className="flex items-center justify-end gap-3">
            <span className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-bg-subtle sm:block">
              <span
                className="block h-full rounded-full bg-primary"
                style={{ width: `${Math.max(0, Math.min(100, s.scoreGlobal))}%` }}
              />
            </span>
            <span className="w-12 text-right font-display text-base font-bold text-text tabular-nums">
              {s.scoreGlobal}%
            </span>
          </div>
        ),
      valeurTri: (s) => s.scoreGlobal ?? -1,
      alignement: "right",
    },
  ];

  return (
    <DataTable
      id="auto-evaluation-historique"
      colonnes={colonnes}
      lignes={sessions}
      cleLigne={(s) => s.id}
      rechercheEspaceReserve="Rechercher une grille…"
      triParDefaut={{ cle: "soumission", direction: "desc" }}
      lienLigne={(s) => `/auto-evaluation/${s.id}/resultats`}
      vide={{ titre: "Aucune évaluation soumise", description: "Vos résultats apparaîtront ici après chaque soumission." }}
      actionsLigne={(s) => [{ label: "Voir les résultats", icone: IconEye, href: `/auto-evaluation/${s.id}/resultats` }]}
    />
  );
}
