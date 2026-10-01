"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { DataTable, type ColonneTable, type VueTable } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, SelectField } from "@/components/ui/field";
import { IconBan, IconCheckCircle, IconPencil, IconSend, IconUserPlus } from "@/components/icons";
import { useActionConfirmee } from "@/components/admin/use-action-confirmee";
import {
  basculerMembreAction,
  creerMembreAction,
  modifierMembreAction,
  renvoyerInvitationAction,
} from "@/lib/equipe-actions";
import { LIBELLES_CIVILITE, LIBELLES_ROLE_ETABLISSEMENT } from "@/lib/libelles-comptes";
import type { EtatAction, MembreEtablissement, RoleEtablissement, ServiceEtablissement } from "@/lib/types";

const ETAT_INITIAL: EtatAction = {};

function Bouton({ libelle }: { libelle: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Enregistrement…" : libelle}
    </Button>
  );
}

function MembreForm({
  membre,
  services,
  onSuccess,
}: {
  membre?: MembreEtablissement;
  services: ServiceEtablissement[];
  onSuccess: () => void;
}) {
  const [etat, action] = useActionState(
    membre ? modifierMembreAction.bind(null, membre.id) : creerMembreAction,
    ETAT_INITIAL,
  );
  const rolesActuels = new Set(membre?.roles.map((r) => r.role) ?? []);
  // Un service désactivé reste affiché s'il est déjà celui du membre.
  const servicesProposes = services.filter((s) => s.actif || s.id === membre?.serviceId);

  useEffect(() => {
    if (etat.succes) onSuccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etat.succes]);

  return (
    <form action={action} className="flex flex-col gap-4">
      <SelectField label="Civilité" name="civilite" defaultValue={membre?.civilite ?? ""} required>
        <option value="" disabled>
          Sélectionner…
        </option>
        {Object.entries(LIBELLES_CIVILITE).map(([valeur, label]) => (
          <option key={valeur} value={valeur}>
            {label}
          </option>
        ))}
      </SelectField>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Nom" name="nom" required minLength={2} defaultValue={membre?.nom} />
        <Field label="Prénom" name="prenom" required minLength={2} defaultValue={membre?.prenom} />
      </div>
      {!membre && (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Email (identifiant)" name="email" type="email" required />
          <Field label="Téléphone (optionnel)" name="telephone" type="tel" />
        </div>
      )}

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium text-text">Rôles (au moins un)</legend>
        {(Object.keys(LIBELLES_ROLE_ETABLISSEMENT) as RoleEtablissement[]).map((role) => (
          <label key={role} className="flex items-start gap-2.5 text-sm text-text">
            <input
              type="checkbox"
              name="roles"
              value={role}
              defaultChecked={rolesActuels.has(role)}
              className="mt-0.5 h-4 w-4 rounded border-border"
            />
            <span>
              {LIBELLES_ROLE_ETABLISSEMENT[role].label}
              <span className="block text-xs text-text-muted">{LIBELLES_ROLE_ETABLISSEMENT[role].acces}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <SelectField label="Service (optionnel)" name="serviceId" defaultValue={membre?.serviceId ?? ""}>
        <option value="">Aucun service</option>
        {servicesProposes.map((s) => (
          <option key={s.id} value={s.id}>
            {s.nom}
            {s.actif ? "" : " (désactivé)"}
          </option>
        ))}
      </SelectField>

      {!membre && (
        <p className="rounded-[var(--radius-md)] bg-bg-subtle px-3.5 py-2.5 text-xs text-text-muted">
          L&apos;utilisateur reçoit un email pour activer son compte et choisir lui-même son mot de passe personnel.
        </p>
      )}
      {etat.erreur && <p className="text-sm text-danger">{etat.erreur}</p>}
      <div>
        <Bouton libelle={membre ? "Enregistrer" : "Créer et envoyer l'invitation"} />
      </div>
    </form>
  );
}

// §4.2 — utilisateurs internes de l'établissement.
export function MembresTable({
  membres,
  services,
  moiId,
}: {
  membres: MembreEtablissement[];
  services: ServiceEtablissement[];
  moiId: string;
}) {
  const [modal, setModal] = useState<{ membre?: MembreEtablissement } | null>(null);
  const { lancer, dialogue } = useActionConfirmee();

  const colonnes: ColonneTable<MembreEtablissement>[] = [
    {
      cle: "nom",
      entete: "Nom",
      masquable: false,
      render: (m) => (
        <span>
          <span className="block font-medium text-text">
            {m.civilite ? `${LIBELLES_CIVILITE[m.civilite]} ` : ""}
            {m.prenom} {m.nom}
          </span>
          <span className="block text-xs text-text-muted">{m.email}</span>
        </span>
      ),
      valeurTri: (m) => `${m.nom} ${m.prenom}`,
      valeurRecherche: (m) => `${m.nom} ${m.prenom} ${m.email}`,
      valeurExport: (m) => `${m.prenom} ${m.nom}`,
    },
    {
      cle: "roles",
      entete: "Rôles",
      render: (m) => (
        <span className="flex flex-wrap gap-1">
          {m.roles.map((r) => (
            <Badge key={r.role} variant="primary">
              {LIBELLES_ROLE_ETABLISSEMENT[r.role]?.label ?? r.role}
            </Badge>
          ))}
        </span>
      ),
      valeurExport: (m) => m.roles.map((r) => LIBELLES_ROLE_ETABLISSEMENT[r.role]?.label ?? r.role).join(", "),
    },
    {
      cle: "service",
      entete: "Service",
      render: (m) => <span className="text-text-muted">{m.service?.nom ?? "—"}</span>,
      valeurTri: (m) => m.service?.nom ?? "",
      valeurExport: (m) => m.service?.nom ?? "",
    },
    {
      cle: "statut",
      entete: "Statut",
      render: (m) =>
        !m.actif ? (
          <Badge variant="neutral">Désactivé</Badge>
        ) : m.emailVerifieLe ? (
          <Badge variant="success">Actif</Badge>
        ) : (
          <Badge variant="warning">Invitation en attente</Badge>
        ),
      valeurTri: (m) => (m.actif ? (m.emailVerifieLe ? 2 : 1) : 0),
      valeurExport: (m) => (!m.actif ? "Désactivé" : m.emailVerifieLe ? "Actif" : "Invitation en attente"),
    },
  ];

  const vues: VueTable<MembreEtablissement>[] = [
    { cle: "tous", label: "Tous" },
    { cle: "actifs", label: "Actifs", filtre: (m) => m.actif },
    { cle: "attente", label: "Invitation en attente", filtre: (m) => m.actif && !m.emailVerifieLe },
    { cle: "desactives", label: "Désactivés", filtre: (m) => !m.actif },
  ];

  return (
    <div>
      <DataTable
        id="organisation-membres"
        colonnes={colonnes}
        lignes={membres}
        cleLigne={(m) => m.id}
        rechercheEspaceReserve="Rechercher un utilisateur…"
        vues={vues}
        triParDefaut={{ cle: "nom", direction: "asc" }}
        exportCsv={{ nomFichier: "equipe-etablissement" }}
        barreOutils={
          <Button onClick={() => setModal({})} className="h-9 gap-1.5 px-3.5">
            <IconUserPlus width={16} height={16} />
            <span className="hidden sm:inline">Nouvel utilisateur</span>
          </Button>
        }
        vide={{ titre: "Aucun utilisateur", description: "Ajoutez les membres du personnel qui utiliseront la plateforme." }}
        actionsLigne={(m) => [
          { label: "Modifier", icone: IconPencil, onSelect: () => setModal({ membre: m }) },
          m.actif &&
            !m.emailVerifieLe && {
              label: "Renvoyer l'invitation",
              icone: IconSend,
              onSelect: () => lancer(() => renvoyerInvitationAction(m.id), "Invitation renvoyée."),
            },
          m.id !== moiId &&
            (m.actif
              ? {
                  label: "Désactiver",
                  icone: IconBan,
                  danger: true,
                  onSelect: () =>
                    lancer(() => basculerMembreAction(m.id, true), "Utilisateur désactivé.", {
                      titre: "Désactiver cet utilisateur ?",
                      description: "Il ne pourra plus se connecter et ses sessions en cours sont fermées immédiatement.",
                      confirmLabel: "Désactiver",
                    }),
                }
              : {
                  label: "Réactiver",
                  icone: IconCheckCircle,
                  onSelect: () => lancer(() => basculerMembreAction(m.id, false), "Utilisateur réactivé."),
                }),
        ]}
      />
      {dialogue}

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal?.membre ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
      >
        {modal && (
          <MembreForm
            key={modal.membre?.id ?? "nouveau"}
            membre={modal.membre}
            services={services}
            onSuccess={() => setModal(null)}
          />
        )}
      </Modal>
    </div>
  );
}
