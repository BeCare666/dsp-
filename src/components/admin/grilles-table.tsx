"use client";

import Link from "next/link";
import { DataTable, type ColonneTable, type FiltreTable, type VueTable } from "@/components/ui/data-table";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { IconArchive, IconChecklist, IconCopy, IconEye, IconSend } from "@/components/icons";
import { publierGrilleAction, archiverGrilleAction, nouvelleVersionGrilleAction } from "@/lib/grilles-actions";
import { useActionConfirmee } from "./use-action-confirmee";
import type { Grille } from "@/lib/types";

const LIBELLES_TYPE = {
  EH: "Hôpital (EH)",
  ESPC: "ESPC",
} as const;

const LIBELLES_STATUT: Record<Grille["statut"], string> = {
  BROUILLON: "Brouillon",
  PUBLIEE: "Publiée",
  ARCHIVEE: "Archivée",
};

const VARIANTES_STATUT: Record<Grille["statut"], BadgeVariant> = {
  BROUILLON: "neutral",
  PUBLIEE: "success",
  ARCHIVEE: "warning",
};

export function GrillesTable({ grilles }: { grilles: Grille[] }) {
  const { lancer, dialogue } = useActionConfirmee();

  const colonnes: ColonneTable<Grille>[] = [
    {
      cle: "nom",
      entete: "Grille",
      masquable: false,
      render: (g) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary-soft text-primary">
            <IconChecklist width={18} height={18} />
          </span>
          <Link href={`/admin/grilles/${g.id}`} className="min-w-0 truncate font-medium text-text hover:text-primary">
            {g.nom}
          </Link>
        </div>
      ),
      valeurTri: (g) => g.nom,
      valeurRecherche: (g) => `${g.nom} ${LIBELLES_TYPE[g.type]}`,
    },
    {
      cle: "type",
      entete: "Type d'établissement",
      render: (g) => LIBELLES_TYPE[g.type],
      valeurTri: (g) => g.type,
      valeurExport: (g) => LIBELLES_TYPE[g.type],
    },
    {
      cle: "version",
      entete: "Version",
      render: (g) => (
        <span className="rounded-[var(--radius-sm)] border border-border px-1.5 py-0.5 font-mono text-xs text-text-muted">
          v{g.version}
        </span>
      ),
      valeurTri: (g) => g.version,
    },
    {
      cle: "statut",
      entete: "Statut",
      render: (g) => <Badge variant={VARIANTES_STATUT[g.statut]}>{LIBELLES_STATUT[g.statut]}</Badge>,
      valeurTri: (g) => g.statut,
      valeurExport: (g) => LIBELLES_STATUT[g.statut],
    },
  ];

  const filtres: FiltreTable<Grille>[] = [
    {
      cle: "type",
      label: "Type",
      options: Object.entries(LIBELLES_TYPE).map(([valeur, label]) => ({ valeur, label })),
      valeur: (g) => g.type,
    },
  ];

  const vues: VueTable<Grille>[] = [
    { cle: "toutes", label: "Toutes" },
    { cle: "publiees", label: "Publiées", filtre: (g) => g.statut === "PUBLIEE" },
    { cle: "brouillons", label: "Brouillons", filtre: (g) => g.statut === "BROUILLON" },
    { cle: "archivees", label: "Archivées", filtre: (g) => g.statut === "ARCHIVEE" },
  ];

  return (
    <>
      <DataTable
        id="admin-grilles"
        colonnes={colonnes}
        lignes={grilles}
        cleLigne={(g) => g.id}
        rechercheEspaceReserve="Rechercher une grille…"
        filtres={filtres}
        vues={vues}
        triParDefaut={{ cle: "nom", direction: "asc" }}
        lienLigne={(g) => `/admin/grilles/${g.id}`}
        vide={{
          titre: "Aucune grille d'auto-évaluation",
          description: "Créez une grille pour la proposer ensuite aux établissements.",
        }}
        actionsLigne={(g) => [
          { label: "Ouvrir", icone: IconEye, href: `/admin/grilles/${g.id}` },
          g.statut === "BROUILLON" && {
            label: "Publier",
            icone: IconSend,
            onSelect: () =>
              lancer(() => publierGrilleAction(g.id), "Grille publiée.", {
                titre: "Publier cette grille ?",
                description:
                  "Une grille publiée n'est plus modifiable. Elle devient disponible pour les auto-évaluations des établissements de ce type.",
                confirmLabel: "Publier",
                danger: false,
              }),
          },
          g.statut !== "BROUILLON" && {
            label: "Nouvelle version",
            icone: IconCopy,
            onSelect: () => lancer(() => nouvelleVersionGrilleAction(g.id), "Nouvelle version créée en brouillon."),
          },
          g.statut === "PUBLIEE" && {
            label: "Archiver",
            icone: IconArchive,
            danger: true,
            onSelect: () =>
              lancer(() => archiverGrilleAction(g.id), "Grille archivée.", {
                titre: "Archiver cette grille ?",
                description:
                  "Elle ne pourra plus servir à démarrer une auto-évaluation. Cette action est définitive ; une nouvelle version reste possible.",
                confirmLabel: "Archiver",
              }),
          },
        ]}
      />
      {dialogue}
    </>
  );
}
