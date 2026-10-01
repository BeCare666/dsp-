"use client";

import { useState } from "react";
import Link from "next/link";
import { DataTable, type ColonneTable, type FiltreTable } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { IconEye } from "@/components/icons";
import { formaterDateHeure } from "@/lib/format";
import { libelleAction, varianteAction } from "@/lib/audit-libelles";
import type { JournalAuditEntry } from "@/lib/types";

function nomActeur(e: JournalAuditEntry) {
  return e.utilisateur ? `${e.utilisateur.prenom} ${e.utilisateur.nom}` : "Non identifié";
}

export function AuditTable({
  entrees,
  idTable = "admin-audit",
  synchroniserUrl = true,
}: {
  entrees: JournalAuditEntry[];
  idTable?: string;
  synchroniserUrl?: boolean;
}) {
  const [selection, setSelection] = useState<JournalAuditEntry | null>(null);

  const colonnes: ColonneTable<JournalAuditEntry>[] = [
    {
      cle: "date",
      entete: "Date",
      masquable: false,
      render: (e) => <span className="whitespace-nowrap text-text-muted tabular-nums">{formaterDateHeure(e.createdAt)}</span>,
      valeurTri: (e) => e.createdAt,
      valeurExport: (e) => formaterDateHeure(e.createdAt),
    },
    {
      cle: "action",
      entete: "Action",
      render: (e) => <Badge variant={varianteAction(e.action)}>{libelleAction(e.action)}</Badge>,
      valeurTri: (e) => libelleAction(e.action),
      valeurRecherche: (e) => `${e.action} ${libelleAction(e.action)}`,
    },
    {
      cle: "acteur",
      entete: "Acteur",
      render: (e) =>
        e.utilisateur ? (
          <div className="min-w-0">
            <Link href={`/admin/utilisateurs/${e.utilisateur.id}`} className="font-medium text-text hover:text-primary">
              {nomActeur(e)}
            </Link>
            <p className="truncate text-xs text-text-faint">{e.utilisateur.email}</p>
          </div>
        ) : (
          <span className="text-text-faint">Non identifié</span>
        ),
      valeurTri: (e) => nomActeur(e),
      valeurRecherche: (e) => (e.utilisateur ? `${nomActeur(e)} ${e.utilisateur.email}` : ""),
      valeurExport: (e) => (e.utilisateur ? `${nomActeur(e)} <${e.utilisateur.email}>` : "Non identifié"),
    },
    {
      cle: "organisation",
      entete: "Établissement",
      render: (e) =>
        e.organisation ? (
          <Link href={`/admin/etablissements/${e.organisation.id}`} className="text-text hover:text-primary">
            {e.organisation.nom}
          </Link>
        ) : (
          <span className="text-text-faint">Aucun</span>
        ),
      valeurTri: (e) => e.organisation?.nom ?? "",
      valeurRecherche: (e) => e.organisation?.nom ?? "",
      valeurExport: (e) => e.organisation?.nom ?? "",
    },
    {
      cle: "entite",
      entete: "Entité",
      render: (e) => (
        <span className="text-text-muted">
          {e.entite}
          {e.entiteId && <span className="ml-1 font-mono text-xs text-text-faint">#{e.entiteId.slice(0, 8)}</span>}
        </span>
      ),
      valeurTri: (e) => e.entite,
      valeurExport: (e) => `${e.entite}${e.entiteId ? ` #${e.entiteId}` : ""}`,
    },
  ];

  const actionsPresentes = [...new Set(entrees.map((e) => e.action))].sort((a, b) =>
    libelleAction(a).localeCompare(libelleAction(b), "fr"),
  );
  const entitesPresentes = [...new Set(entrees.map((e) => e.entite))].sort();

  const filtres: FiltreTable<JournalAuditEntry>[] = [
    {
      cle: "action",
      label: "Action",
      options: actionsPresentes.map((a) => ({ valeur: a, label: libelleAction(a) })),
      valeur: (e) => e.action,
    },
    {
      cle: "entite",
      label: "Entité",
      options: entitesPresentes.map((en) => ({ valeur: en, label: en })),
      valeur: (e) => e.entite,
    },
  ];

  return (
    <>
      <DataTable
        id={idTable}
        synchroniserUrl={synchroniserUrl}
        colonnes={colonnes}
        lignes={entrees}
        cleLigne={(e) => e.id}
        rechercheEspaceReserve="Action, acteur, établissement…"
        filtres={filtres}
        triParDefaut={{ cle: "date", direction: "desc" }}
        tailleDePage={25}
        exportCsv={{ nomFichier: "journal-audit-dps" }}
        vide={{
          titre: "Aucune entrée d'audit",
          description: "Les connexions et les actions d'administration apparaîtront ici.",
        }}
        actionsLigne={(e) => [
          (e.donneesAvant != null || e.donneesApres != null) && {
            label: "Voir le détail",
            icone: IconEye,
            onSelect: () => setSelection(e),
          },
        ]}
      />

      <Modal
        open={selection !== null}
        onClose={() => setSelection(null)}
        title={selection ? libelleAction(selection.action) : "Détail de l'action"}
        description={selection ? `${formaterDateHeure(selection.createdAt)} · ${nomActeur(selection)}` : undefined}
      >
        {selection && <DetailModification avant={selection.donneesAvant} apres={selection.donneesApres} />}
      </Modal>
    </>
  );
}

function formaterValeur(v: unknown): string {
  if (v === null || v === undefined || v === "") return "Vide";
  if (typeof v === "boolean") return v ? "Oui" : "Non";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function enObjet(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : v === null || v === undefined ? {} : { valeur: v };
}

// Détail lisible d'une entrée d'audit : un champ par ligne, avant / après,
// champs modifiés mis en évidence. Le JSON brut reste consultable.
function DetailModification({ avant, apres }: { avant: unknown; apres: unknown }) {
  const a = enObjet(avant);
  const b = enObjet(apres);
  const champs = [...new Set([...Object.keys(a), ...Object.keys(b)])];

  return (
    <div className="flex flex-col gap-4">
      {champs.length > 0 && (
        <div className="max-h-[50vh] overflow-auto rounded-[var(--radius-md)] border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-subtle/70 text-xs font-semibold text-text-muted">
                <th className="px-3 py-2">Champ</th>
                <th className="px-3 py-2">Avant</th>
                <th className="px-3 py-2">Après</th>
              </tr>
            </thead>
            <tbody>
              {champs.map((c) => {
                const va = formaterValeur(a[c]);
                const vb = formaterValeur(b[c]);
                const modifie = va !== vb;
                return (
                  <tr key={c} className={`border-b border-border last:border-0 ${modifie ? "bg-warning-soft/40" : ""}`}>
                    <td className="px-3 py-2 align-top font-mono text-xs text-text-muted">{c}</td>
                    <td className={`break-all px-3 py-2 align-top ${modifie ? "text-text-muted line-through decoration-text-faint" : "text-text"}`}>
                      {va}
                    </td>
                    <td className={`break-all px-3 py-2 align-top ${modifie ? "font-medium text-text" : "text-text"}`}>{vb}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <details className="group">
        <summary className="cursor-pointer text-xs font-medium text-text-muted hover:text-text">Voir le JSON brut</summary>
        <pre className="mt-2 max-h-[40vh] overflow-auto rounded-[var(--radius-md)] bg-bg-subtle p-4 text-xs text-text">
          {JSON.stringify({ avant, apres }, null, 2)}
        </pre>
      </details>
    </div>
  );
}
