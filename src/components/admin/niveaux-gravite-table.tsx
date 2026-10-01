"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { DataTable, type ColonneTable } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field } from "@/components/ui/field";
import { IconBan, IconCheckCircle, IconPlus } from "@/components/icons";
import { basculerNiveauGraviteAction, creerNiveauGraviteAction } from "@/lib/admin-actions";
import { useActionConfirmee } from "./use-action-confirmee";
import type { EtatAction, NiveauGraviteEi } from "@/lib/types";

const ETAT_INITIAL: EtatAction = {};

function Bouton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Création…" : "Créer"}</Button>;
}

function NiveauForm({ onSuccess }: { onSuccess: () => void }) {
  const [etat, action] = useActionState(creerNiveauGraviteAction, ETAT_INITIAL);
  useEffect(() => {
    if (etat.succes) onSuccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etat.succes]);

  return (
    <form action={action} className="flex flex-col gap-4">
      <Field label="Libellé" name="libelle" required minLength={2} placeholder="Ex. Événement indésirable grave" />
      <Field label="Rang dans l'échelle (1 = le moins grave)" name="ordre" type="number" min={1} max={100} required />
      <label className="flex items-start gap-2.5 text-sm text-text">
        <input type="checkbox" name="critique" className="mt-0.5 h-4 w-4 rounded border-border" />
        <span>
          Gravité élevée
          <span className="block text-xs text-text-muted">
            Déclenche l&apos;alerte immédiate au responsable qualité et à la direction (§8.3).
          </span>
        </span>
      </label>
      {etat.erreur && <p className="text-sm text-danger">{etat.erreur}</p>}
      <div>
        <Bouton />
      </div>
    </form>
  );
}

// §12.4 — l'échelle est paramétrable. §13.5 : un niveau déjà utilisé n'est
// jamais modifié (les fiches gardent leur forme d'origine) ; on le désactive
// et on en crée un nouveau.
export function NiveauxGraviteTable({ niveaux }: { niveaux: NiveauGraviteEi[] }) {
  const [modal, setModal] = useState(false);
  const { lancer, dialogue } = useActionConfirmee();

  const colonnes: ColonneTable<NiveauGraviteEi>[] = [
    { cle: "ordre", entete: "Rang", render: (n) => <span className="tabular-nums">{n.ordre}</span>, valeurTri: (n) => n.ordre },
    {
      cle: "libelle",
      entete: "Libellé",
      masquable: false,
      render: (n) => <span className="font-medium text-text">{n.libelle}</span>,
      valeurTri: (n) => n.libelle,
      valeurRecherche: (n) => n.libelle,
    },
    {
      cle: "critique",
      entete: "Alerte immédiate",
      render: (n) => (n.critique ? <Badge variant="danger">Gravité élevée</Badge> : <Badge variant="neutral">Non</Badge>),
    },
    { cle: "usage", entete: "Événements", render: (n) => <span className="tabular-nums">{n._count?.evenements ?? 0}</span> },
    {
      cle: "statut",
      entete: "Statut",
      render: (n) => (n.actif ? <Badge variant="success">Actif</Badge> : <Badge variant="neutral">Inactif</Badge>),
    },
  ];

  return (
    <div>
      <DataTable
        id="admin-niveaux-gravite"
        colonnes={colonnes}
        lignes={niveaux}
        cleLigne={(n) => n.id}
        rechercheEspaceReserve="Rechercher un niveau…"
        triParDefaut={{ cle: "ordre", direction: "asc" }}
        barreOutils={
          <Button onClick={() => setModal(true)} className="h-9 gap-1.5 px-3.5">
            <IconPlus width={16} height={16} />
            <span className="hidden sm:inline">Nouveau niveau</span>
          </Button>
        }
        vide={{ titre: "Aucun niveau de gravité", description: "Définissez l'échelle de gravité proposée à la déclaration." }}
        actionsLigne={(n) => [
          n.actif
            ? {
                label: "Désactiver",
                icone: IconBan,
                danger: true,
                onSelect: () =>
                  lancer(() => basculerNiveauGraviteAction(n.id, true), "Niveau désactivé.", {
                    titre: "Désactiver ce niveau ?",
                    description: "Il ne sera plus proposé ; les événements qui l'utilisent le conservent.",
                    confirmLabel: "Désactiver",
                  }),
              }
            : {
                label: "Réactiver",
                icone: IconCheckCircle,
                onSelect: () => lancer(() => basculerNiveauGraviteAction(n.id, false), "Niveau réactivé."),
              },
        ]}
      />
      {dialogue}
      <Modal open={modal} onClose={() => setModal(false)} title="Nouveau niveau de gravité">
        {modal && <NiveauForm onSuccess={() => setModal(false)} />}
      </Modal>
    </div>
  );
}
