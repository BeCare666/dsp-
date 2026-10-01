"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { DataTable, type ColonneTable, type VueTable } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field } from "@/components/ui/field";
import { IconBan, IconCheckCircle, IconPencil, IconPlus } from "@/components/icons";
import { useActionConfirmee } from "@/components/admin/use-action-confirmee";
import { basculerServiceAction, creerServiceAction, modifierServiceAction } from "@/lib/equipe-actions";
import type { EtatAction, ServiceEtablissement } from "@/lib/types";

const ETAT_INITIAL: EtatAction = {};

function Bouton({ libelle }: { libelle: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Enregistrement…" : libelle}
    </Button>
  );
}

function ServiceForm({ service, onSuccess }: { service?: ServiceEtablissement; onSuccess: () => void }) {
  const [etat, action] = useActionState(
    service ? modifierServiceAction.bind(null, service.id) : creerServiceAction,
    ETAT_INITIAL,
  );

  useEffect(() => {
    if (etat.succes) onSuccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etat.succes]);

  return (
    <form action={action} className="flex flex-col gap-4">
      <Field label="Nom du service" name="nom" required minLength={2} defaultValue={service?.nom} placeholder="Ex. Maternité" />
      <Field label="Description (optionnel)" name="description" defaultValue={service?.description ?? ""} />
      {etat.erreur && <p className="text-sm text-danger">{etat.erreur}</p>}
      <div>
        <Bouton libelle={service ? "Enregistrer" : "Créer"} />
      </div>
    </form>
  );
}

// §4.2 — services de l'établissement (filtrage NEWS, rattachement des EI).
export function ServicesTable({ services }: { services: ServiceEtablissement[] }) {
  const [modal, setModal] = useState<{ service?: ServiceEtablissement } | null>(null);
  const { lancer, dialogue } = useActionConfirmee();

  const colonnes: ColonneTable<ServiceEtablissement>[] = [
    {
      cle: "nom",
      entete: "Service",
      masquable: false,
      render: (s) => <span className="font-medium text-text">{s.nom}</span>,
      valeurTri: (s) => s.nom,
      valeurRecherche: (s) => `${s.nom} ${s.description ?? ""}`,
    },
    {
      cle: "description",
      entete: "Description",
      render: (s) => <span className="text-text-muted">{s.description ?? "—"}</span>,
    },
    {
      cle: "statut",
      entete: "Statut",
      render: (s) => (s.actif ? <Badge variant="success">Actif</Badge> : <Badge variant="neutral">Désactivé</Badge>),
      valeurTri: (s) => (s.actif ? 1 : 0),
    },
  ];

  const vues: VueTable<ServiceEtablissement>[] = [
    { cle: "actifs", label: "Actifs", filtre: (s) => s.actif },
    { cle: "tous", label: "Tous" },
  ];

  return (
    <div>
      <DataTable
        id="organisation-services"
        colonnes={colonnes}
        lignes={services}
        cleLigne={(s) => s.id}
        rechercheEspaceReserve="Rechercher un service…"
        vues={vues}
        triParDefaut={{ cle: "nom", direction: "asc" }}
        barreOutils={
          <Button onClick={() => setModal({})} className="h-9 gap-1.5 px-3.5">
            <IconPlus width={16} height={16} />
            <span className="hidden sm:inline">Nouveau service</span>
          </Button>
        }
        vide={{
          titre: "Aucun service",
          description: "Créez les services de l'établissement (ex. maternité, urgences, bloc opératoire).",
        }}
        actionsLigne={(s) => [
          { label: "Modifier", icone: IconPencil, onSelect: () => setModal({ service: s }) },
          s.actif
            ? {
                label: "Désactiver",
                icone: IconBan,
                danger: true,
                onSelect: () =>
                  lancer(() => basculerServiceAction(s.id, true), "Service désactivé.", {
                    titre: "Désactiver ce service ?",
                    description:
                      "Il ne sera plus proposé dans les formulaires. Les patients, événements et utilisateurs déjà rattachés sont conservés.",
                    confirmLabel: "Désactiver",
                  }),
              }
            : {
                label: "Réactiver",
                icone: IconCheckCircle,
                onSelect: () => lancer(() => basculerServiceAction(s.id, false), "Service réactivé."),
              },
        ]}
      />
      {dialogue}

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal?.service ? "Modifier le service" : "Nouveau service"}
      >
        {modal && <ServiceForm key={modal.service?.id ?? "nouveau"} service={modal.service} onSuccess={() => setModal(null)} />}
      </Modal>
    </div>
  );
}
