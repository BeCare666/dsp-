"use client";

import { useState } from "react";
import { DataTable, type ColonneTable, type VueTable } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconBan, IconCheckCircle, IconPlus } from "@/components/icons";
import { basculerTypeEiAction } from "@/lib/admin-actions";
import { TypeEiForm } from "./type-ei-form";
import { useActionConfirmee } from "./use-action-confirmee";
import type { TypeEi } from "@/lib/types";

export function TypesEiTable({ types }: { types: TypeEi[] }) {
  const [modalCreation, setModalCreation] = useState(false);
  const { lancer, dialogue } = useActionConfirmee();

  const colonnes: ColonneTable<TypeEi>[] = [
    {
      cle: "libelle",
      entete: "Libellé",
      masquable: false,
      render: (t) => <span className="font-medium text-text">{t.libelle}</span>,
      valeurTri: (t) => t.libelle,
      valeurRecherche: (t) => t.libelle,
    },
    {
      cle: "statut",
      entete: "Statut",
      render: (t) => (t.actif ? <Badge variant="success">Actif</Badge> : <Badge variant="neutral">Inactif</Badge>),
      valeurTri: (t) => (t.actif ? 1 : 0),
      valeurExport: (t) => (t.actif ? "Actif" : "Inactif"),
    },
  ];

  const vues: VueTable<TypeEi>[] = [
    { cle: "tous", label: "Tous" },
    { cle: "actifs", label: "Actifs", filtre: (t) => t.actif },
    { cle: "inactifs", label: "Inactifs", filtre: (t) => !t.actif },
  ];

  return (
    <div>
      <DataTable
        id="admin-types-ei"
        colonnes={colonnes}
        lignes={types}
        cleLigne={(t) => t.id}
        rechercheEspaceReserve="Rechercher un type d'EI…"
        vues={vues}
        triParDefaut={{ cle: "libelle", direction: "asc" }}
        barreOutils={
          <Button onClick={() => setModalCreation(true)} className="h-9 gap-1.5 px-3.5">
            <IconPlus width={16} height={16} />
            <span className="hidden sm:inline">Nouveau type</span>
          </Button>
        }
        vide={{
          titre: "Aucun type d'EI",
          description: "Ajoutez les types proposés aux établissements lors d'une déclaration.",
        }}
        actionsLigne={(t) => [
          t.actif
            ? {
                label: "Désactiver",
                icone: IconBan,
                danger: true,
                onSelect: () =>
                  lancer(() => basculerTypeEiAction(t.id, true), "Type d'EI désactivé.", {
                    titre: "Désactiver ce type d'EI ?",
                    description: "Il ne sera plus proposé lors d'une nouvelle déclaration tant qu'il n'est pas réactivé.",
                    confirmLabel: "Désactiver",
                  }),
              }
            : {
                label: "Réactiver",
                icone: IconCheckCircle,
                onSelect: () => lancer(() => basculerTypeEiAction(t.id, false), "Type d'EI réactivé."),
              },
        ]}
      />
      {dialogue}

      <Modal open={modalCreation} onClose={() => setModalCreation(false)} title="Nouveau type d'événement indésirable">
        <TypeEiForm onSuccess={() => setModalCreation(false)} />
      </Modal>
    </div>
  );
}
