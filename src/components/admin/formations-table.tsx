"use client";

import { useState } from "react";
import { DataTable, type ColonneTable, type VueTable } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconBan, IconCheckCircle, IconPencil, IconPlus } from "@/components/icons";
import { formaterFcfa } from "@/lib/format";
import { basculerFormationAction, creerFormationAction, modifierFormationAction } from "@/lib/admin-actions";
import { FormationForm } from "./formation-form";
import { useActionConfirmee } from "./use-action-confirmee";
import type { Formation } from "@/lib/types";

function Prix({ montant }: { montant: number }) {
  return <span className="whitespace-nowrap font-medium text-text tabular-nums">{formaterFcfa(montant)}</span>;
}

export function FormationsTable({ formations }: { formations: Formation[] }) {
  const [modalCreation, setModalCreation] = useState(false);
  const [formationEnEdition, setFormationEnEdition] = useState<Formation | null>(null);
  const { lancer, dialogue } = useActionConfirmee();

  const colonnes: ColonneTable<Formation>[] = [
    {
      cle: "titre",
      entete: "Formation",
      masquable: false,
      render: (f) => (
        <div className="min-w-0">
          <p className="font-medium text-text">{f.titre}</p>
          <p className="text-xs text-text-faint">{f.dureeHeures ? `${f.dureeHeures} heures` : "Durée non renseignée"}</p>
        </div>
      ),
      valeurTri: (f) => f.titre,
      valeurRecherche: (f) => f.titre,
    },
    {
      cle: "prixIndividuel",
      entete: "Individuel",
      render: (f) => <Prix montant={f.prixIndividuel} />,
      valeurTri: (f) => f.prixIndividuel,
      alignement: "right",
    },
    {
      cle: "prixGroupe5",
      entete: "Groupe 5",
      render: (f) => <Prix montant={f.prixGroupe5} />,
      valeurTri: (f) => f.prixGroupe5,
      alignement: "right",
    },
    {
      cle: "prixGroupe10",
      entete: "Groupe 10",
      render: (f) => <Prix montant={f.prixGroupe10} />,
      valeurTri: (f) => f.prixGroupe10,
      alignement: "right",
    },
    {
      cle: "statut",
      entete: "Statut",
      render: (f) => (f.actif ? <Badge variant="success">Active</Badge> : <Badge variant="neutral">Inactive</Badge>),
      valeurTri: (f) => (f.actif ? 1 : 0),
      valeurExport: (f) => (f.actif ? "Active" : "Inactive"),
    },
  ];

  const vues: VueTable<Formation>[] = [
    { cle: "toutes", label: "Toutes" },
    { cle: "actives", label: "Actives", filtre: (f) => f.actif },
    { cle: "inactives", label: "Inactives", filtre: (f) => !f.actif },
  ];

  return (
    <div>
      <DataTable
        id="admin-formations"
        colonnes={colonnes}
        lignes={formations}
        cleLigne={(f) => f.id}
        rechercheEspaceReserve="Rechercher une formation…"
        vues={vues}
        triParDefaut={{ cle: "titre", direction: "asc" }}
        exportCsv={{ nomFichier: "formations-dps" }}
        barreOutils={
          <Button onClick={() => setModalCreation(true)} className="h-9 gap-1.5 px-3.5">
            <IconPlus width={16} height={16} />
            <span className="hidden sm:inline">Nouvelle formation</span>
          </Button>
        }
        vide={{
          titre: "Aucune formation au catalogue",
          description: "Créez la première formation pour l'ouvrir à la réservation.",
        }}
        actionsLigne={(f) => [
          { label: "Modifier", icone: IconPencil, onSelect: () => setFormationEnEdition(f) },
          f.actif
            ? {
                label: "Désactiver",
                icone: IconBan,
                danger: true,
                onSelect: () =>
                  lancer(() => basculerFormationAction(f.id, true), "Formation désactivée.", {
                    titre: "Désactiver cette formation ?",
                    description: "Elle ne sera plus proposée à la réservation tant qu'elle n'est pas réactivée.",
                    confirmLabel: "Désactiver",
                  }),
              }
            : {
                label: "Réactiver",
                icone: IconCheckCircle,
                onSelect: () => lancer(() => basculerFormationAction(f.id, false), "Formation réactivée."),
              },
        ]}
      />
      {dialogue}

      <Modal open={modalCreation} onClose={() => setModalCreation(false)} title="Nouvelle formation">
        <FormationForm action={creerFormationAction} libelleBouton="Créer" onSuccess={() => setModalCreation(false)} />
      </Modal>

      <Modal
        open={formationEnEdition !== null}
        onClose={() => setFormationEnEdition(null)}
        title={`Modifier « ${formationEnEdition?.titre ?? ""} »`}
      >
        {formationEnEdition && (
          <FormationForm
            action={modifierFormationAction.bind(null, formationEnEdition.id)}
            formation={formationEnEdition}
            libelleBouton="Enregistrer"
            onSuccess={() => setFormationEnEdition(null)}
          />
        )}
      </Modal>
    </div>
  );
}
