"use client";

import Link from "next/link";
import { DataTable, type ColonneTable, type FiltreTable, type VueTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { IconBan, IconCheckCircle, IconEye, IconOrganisation } from "@/components/icons";
import { formaterDate } from "@/lib/format";
import { basculerOrganisationAction } from "@/lib/admin-actions";
import { useActionConfirmee } from "./use-action-confirmee";
import type { Organisation } from "@/lib/types";
import { StatutModuleBadge } from "@/components/abonnements/statut-module";

const LIBELLES_TYPE: Record<Organisation["type"], string> = {
  EH: "Établissement hospitalier (EH)",
  ESPC: "Établissement de soins de premiers contacts (ESPC)",
};

const LIBELLES_TYPE_COURTS: Record<Organisation["type"], string> = {
  EH: "EH",
  ESPC: "ESPC",
};

export function EtablissementsTable({ organisations }: { organisations: Organisation[] }) {
  const { lancer, dialogue } = useActionConfirmee();

  const colonnes: ColonneTable<Organisation>[] = [
    {
      cle: "nom",
      entete: "Établissement",
      masquable: false,
      render: (o) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary-soft text-primary">
            <IconOrganisation width={18} height={18} />
          </span>
          <div className="min-w-0">
            <Link href={`/admin/etablissements/${o.id}`} className="block truncate font-medium text-text hover:text-primary">
              {o.nom}
            </Link>
            {o.email && <p className="truncate text-xs text-text-faint">{o.email}</p>}
          </div>
        </div>
      ),
      valeurTri: (o) => o.nom,
      valeurRecherche: (o) => `${o.nom} ${o.ifu} ${o.email ?? ""} ${o.adresse ?? ""}`,
    },
    {
      cle: "type",
      entete: "Type",
      render: (o) => <span title={LIBELLES_TYPE[o.type]}>{LIBELLES_TYPE_COURTS[o.type]}</span>,
      valeurTri: (o) => o.type,
      valeurExport: (o) => LIBELLES_TYPE[o.type],
    },
    {
      // §12.1 — statut de chacun des modules payants de l'établissement.
      cle: "modules",
      entete: "Modules (NEWS · EI)",
      render: (o) => (
        <span className="flex flex-wrap gap-1">
          {(["NEWS", "EI"] as const).map((m) => (
            <span key={m} className="inline-flex items-center gap-1 text-xs">
              <span className="text-text-faint">{m}</span>
              <StatutModuleBadge abonnement={o.abonnementsModule?.find((a) => a.module === m) ?? null} />
            </span>
          ))}
        </span>
      ),
      valeurExport: (o) =>
        (["NEWS", "EI"] as const)
          .map((m) => `${m}: ${o.abonnementsModule?.find((a) => a.module === m)?.statut ?? "NON_DEMARRE"}`)
          .join(" · "),
    },
    {
      cle: "ifu",
      entete: "IFU",
      render: (o) => <span className="font-mono text-xs text-text-muted">{o.ifu}</span>,
      valeurTri: (o) => o.ifu,
    },
    {
      cle: "telephone",
      entete: "Téléphone",
      masqueeParDefaut: true,
      render: (o) => (o.telephone ? <span className="tabular-nums">{o.telephone}</span> : <span className="text-text-faint">Non renseigné</span>),
      valeurExport: (o) => o.telephone ?? "",
    },
    {
      cle: "adresse",
      entete: "Adresse",
      masqueeParDefaut: true,
      render: (o) => (o.adresse ? o.adresse : <span className="text-text-faint">Non renseignée</span>),
      valeurExport: (o) => o.adresse ?? "",
    },
    {
      cle: "statut",
      entete: "Statut",
      render: (o) => (o.actif ? <Badge variant="success">Actif</Badge> : <Badge variant="neutral">Inactif</Badge>),
      valeurTri: (o) => (o.actif ? 1 : 0),
      valeurExport: (o) => (o.actif ? "Actif" : "Inactif"),
    },
    {
      cle: "createdAt",
      entete: "Inscrit le",
      render: (o) => <span className="whitespace-nowrap text-text-muted tabular-nums">{formaterDate(o.createdAt)}</span>,
      valeurTri: (o) => o.createdAt,
      valeurExport: (o) => formaterDate(o.createdAt),
    },
  ];

  const filtres: FiltreTable<Organisation>[] = [
    {
      cle: "type",
      label: "Type",
      options: Object.entries(LIBELLES_TYPE_COURTS).map(([valeur, label]) => ({ valeur, label })),
      valeur: (o) => o.type,
    },
  ];

  const vues: VueTable<Organisation>[] = [
    { cle: "tous", label: "Tous" },
    { cle: "actifs", label: "Actifs", filtre: (o) => o.actif },
    { cle: "inactifs", label: "Inactifs", filtre: (o) => !o.actif },
  ];

  return (
    <>
      <DataTable
        id="admin-etablissements"
        colonnes={colonnes}
        lignes={organisations}
        cleLigne={(o) => o.id}
        rechercheEspaceReserve="Nom, IFU, email…"
        filtres={filtres}
        vues={vues}
        triParDefaut={{ cle: "createdAt", direction: "desc" }}
        lienLigne={(o) => `/admin/etablissements/${o.id}`}
        exportCsv={{ nomFichier: "etablissements-dps" }}
        vide={{ titre: "Aucun établissement", description: "Les établissements apparaîtront ici dès leur inscription." }}
        actionsLigne={(o) => [
          { label: "Voir la fiche", icone: IconEye, href: `/admin/etablissements/${o.id}` },
          o.actif
            ? {
                label: "Désactiver",
                icone: IconBan,
                danger: true,
                onSelect: () =>
                  lancer(() => basculerOrganisationAction(o.id, true), "Établissement désactivé.", {
                    titre: "Désactiver cet établissement ?",
                    description: "Les comptes de cet établissement perdront l'accès à la plateforme jusqu'à réactivation.",
                    confirmLabel: "Désactiver",
                  }),
              }
            : {
                label: "Activer",
                icone: IconCheckCircle,
                onSelect: () => lancer(() => basculerOrganisationAction(o.id, false), "Établissement activé."),
              },
        ]}
      />
      {dialogue}
    </>
  );
}
