"use client";

import { useState } from "react";
import { DataTable, type ColonneTable } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { RisqueBadge } from "@/components/news/badges";
import { MesureForm } from "@/components/news/mesure-form";
import { IconHistory, IconPencil } from "@/components/icons";
import { formaterDateHeure } from "@/lib/format";
import type { MesureNews, NiveauConscience } from "@/lib/types";

// Mêmes libellés que le formulaire de saisie (components/news/mesure-form.tsx).
export const LIBELLES_CONSCIENCE: Record<NiveauConscience, string> = {
  ALERTE: "Alerte (normal)",
  VOIX: "Réagit à la voix",
  DOULEUR: "Réagit à la douleur",
  CONFUSION: "Confusion",
  INCONSCIENT: "Inconscient",
};

// Libellés des valeurs conservées dans une correction (valeurs avant/après).
const LIBELLES_CHAMPS: Record<string, string> = {
  frequenceRespiratoire: "FR",
  saturationOxygene: "SpO2",
  oxygenoSupplementation: "O2",
  temperature: "Temp.",
  pressionArterielleSystolique: "PA syst.",
  frequenceCardiaque: "FC",
  niveauConscience: "Conscience",
  scoreTotal: "Score",
  niveauRisque: "Risque",
};

function Valeur({ v, unite }: { v: number; unite: string }) {
  return (
    <span className="whitespace-nowrap tabular-nums">
      {v}
      <span className="ml-0.5 text-xs text-text-faint">{unite}</span>
    </span>
  );
}

function formaterValeur(v: unknown): string {
  if (typeof v === "boolean") return v ? "Oui" : "Non";
  if (typeof v === "string" && v in LIBELLES_CONSCIENCE) return LIBELLES_CONSCIENCE[v as NiveauConscience];
  return String(v);
}

// §13.4 — historique des corrections d'une mesure : seuls les champs modifiés.
function HistoriqueCorrections({ mesure }: { mesure: MesureNews }) {
  return (
    <ol className="flex flex-col gap-4">
      {(mesure.corrections ?? []).map((c) => {
        const modifies = Object.keys(c.valeursApres).filter(
          (cle) => JSON.stringify(c.valeursAvant[cle]) !== JSON.stringify(c.valeursApres[cle]),
        );
        return (
          <li key={c.id} className="rounded-[var(--radius-md)] border border-border p-4">
            <p className="text-xs text-text-muted">
              {formaterDateHeure(c.createdAt)}
              {c.auteur ? ` · ${c.auteur.prenom} ${c.auteur.nom}` : ""}
            </p>
            <p className="mt-1 text-sm text-text">
              <span className="font-medium">Motif :</span> {c.motif}
            </p>
            <ul className="mt-2 flex flex-col gap-0.5 text-sm text-text-muted">
              {modifies.map((cle) => (
                <li key={cle}>
                  {LIBELLES_CHAMPS[cle] ?? cle} : {formaterValeur(c.valeursAvant[cle])} → {formaterValeur(c.valeursApres[cle])}
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ol>
  );
}

export function MesuresTable({ mesures, patientId }: { mesures: MesureNews[]; patientId: string }) {
  const [aCorriger, setACorriger] = useState<MesureNews | null>(null);
  const [historique, setHistorique] = useState<MesureNews | null>(null);

  const colonnes: ColonneTable<MesureNews>[] = [
    {
      cle: "date",
      entete: "Date",
      masquable: false,
      render: (m) => (
        <span className="flex flex-col">
          <span className="whitespace-nowrap font-medium text-text tabular-nums">{formaterDateHeure(m.dateMesure)}</span>
          {(m.corrections?.length ?? 0) > 0 && (
            <span className="mt-0.5">
              <Badge variant="warning">Corrigée</Badge>
            </span>
          )}
        </span>
      ),
      valeurTri: (m) => m.dateMesure,
      valeurExport: (m) => formaterDateHeure(m.dateMesure),
    },
    {
      cle: "score",
      entete: "Score",
      render: (m) => <span className="font-display text-base font-bold text-text tabular-nums">{m.scoreTotal}</span>,
      valeurTri: (m) => m.scoreTotal,
      alignement: "right",
    },
    {
      cle: "risque",
      entete: "Risque",
      render: (m) => <RisqueBadge niveau={m.niveauRisque} />,
      valeurTri: (m) => m.niveauRisque,
      valeurExport: (m) => m.niveauRisque,
    },
    {
      cle: "surveillance",
      entete: "Surveillance suggérée",
      render: (m) => <span className="text-text-muted">{m.frequenceSurveillance ?? "—"}</span>,
      valeurExport: (m) => m.frequenceSurveillance ?? "",
    },
    {
      cle: "fr",
      entete: "FR",
      render: (m) => <Valeur v={m.frequenceRespiratoire} unite="/min" />,
      valeurExport: (m) => m.frequenceRespiratoire,
      alignement: "right",
    },
    {
      cle: "spo2",
      entete: "SpO2",
      render: (m) => <Valeur v={m.saturationOxygene} unite="%" />,
      valeurExport: (m) => m.saturationOxygene,
      alignement: "right",
    },
    {
      cle: "o2",
      entete: "O2",
      render: (m) => (m.oxygenoSupplementation ? "Sous O2" : "Air ambiant"),
      valeurExport: (m) => (m.oxygenoSupplementation ? "Sous O2" : "Air ambiant"),
    },
    {
      cle: "temp",
      entete: "Temp.",
      render: (m) => <Valeur v={m.temperature} unite="°C" />,
      valeurExport: (m) => m.temperature,
      alignement: "right",
    },
    {
      cle: "pa",
      entete: "PA syst.",
      render: (m) => <Valeur v={m.pressionArterielleSystolique} unite="mmHg" />,
      valeurExport: (m) => m.pressionArterielleSystolique,
      alignement: "right",
    },
    {
      cle: "fc",
      entete: "FC",
      render: (m) => <Valeur v={m.frequenceCardiaque} unite="/min" />,
      valeurExport: (m) => m.frequenceCardiaque,
      alignement: "right",
    },
    {
      cle: "conscience",
      entete: "Conscience",
      masqueeParDefaut: true,
      render: (m) => LIBELLES_CONSCIENCE[m.niveauConscience] ?? m.niveauConscience,
      valeurExport: (m) => LIBELLES_CONSCIENCE[m.niveauConscience] ?? m.niveauConscience,
    },
    {
      cle: "saisiePar",
      entete: "Saisie par",
      masqueeParDefaut: true,
      render: (m) => (m.saisiePar ? `${m.saisiePar.prenom} ${m.saisiePar.nom}` : "—"),
      valeurExport: (m) => (m.saisiePar ? `${m.saisiePar.prenom} ${m.saisiePar.nom}` : ""),
    },
  ];

  return (
    <div>
      <DataTable
        id="news-mesures"
        colonnes={colonnes}
        lignes={mesures}
        cleLigne={(m) => m.id}
        rechercheEspaceReserve="Rechercher…"
        triParDefaut={{ cle: "date", direction: "desc" }}
        synchroniserUrl={false}
        exportCsv={{ nomFichier: "mesures-news" }}
        vide={{ titre: "Aucune mesure", description: "Les mesures enregistrées pour ce patient apparaîtront ici." }}
        actionsLigne={(m) => [
          { label: "Corriger (tracé)", icone: IconPencil, onSelect: () => setACorriger(m) },
          (m.corrections?.length ?? 0) > 0 && {
            label: "Voir les corrections",
            icone: IconHistory,
            onSelect: () => setHistorique(m),
          },
        ]}
      />

      <Modal open={aCorriger !== null} onClose={() => setACorriger(null)} title="Corriger une mesure">
        {aCorriger && (
          <MesureForm key={aCorriger.id} patientId={patientId} mesure={aCorriger} onSuccess={() => setACorriger(null)} />
        )}
      </Modal>
      <Modal open={historique !== null} onClose={() => setHistorique(null)} title="Corrections de la mesure">
        {historique && <HistoriqueCorrections mesure={historique} />}
      </Modal>
    </div>
  );
}
