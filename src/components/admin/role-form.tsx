"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { SelectField } from "@/components/ui/field";
import { ajouterRoleAction, retirerRoleAction, type EtatAction } from "@/lib/admin-actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import type { RoleUtilisateur } from "@dps/shared";

const ETAT_INITIAL: EtatAction = {};

const LIBELLES_ROLE: Record<RoleUtilisateur, string> = {
  RESPONSABLE_COMPTE: "Responsable de compte",
  RESP_QUALITE: "Responsable qualité",
  PERSONNEL_SOIGNANT: "Personnel soignant",
  GESTIONNAIRE_FORMATION: "Gestionnaire formation",
  ADMIN_PLATEFORME: "Admin plateforme",
};

const TOUS_LES_ROLES = Object.keys(LIBELLES_ROLE) as RoleUtilisateur[];

function BoutonAjouter() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
    >
      {pending ? "…" : "Ajouter"}
    </button>
  );
}

export function RoleForm({ utilisateurId, rolesActuels }: { utilisateurId: string; rolesActuels: RoleUtilisateur[] }) {
  const action = ajouterRoleAction.bind(null, utilisateurId);
  const [etat, formAction] = useActionState(action, ETAT_INITIAL);
  const { notifier } = useToast();

  useEffect(() => {
    if (etat.succes) notifier("Rôle ajouté.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etat.succes]);

  const rolesDisponibles = TOUS_LES_ROLES.filter((r) => !rolesActuels.includes(r));

  if (rolesDisponibles.length === 0) {
    return <p className="text-sm text-text-muted">Tous les rôles sont déjà attribués.</p>;
  }

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="min-w-48">
        <SelectField label="Ajouter un rôle" name="role" defaultValue={rolesDisponibles[0]}>
          {rolesDisponibles.map((r) => (
            <option key={r} value={r}>
              {LIBELLES_ROLE[r]}
            </option>
          ))}
        </SelectField>
      </div>
      <BoutonAjouter />
      {etat.erreur && <p className="text-xs text-danger">{etat.erreur}</p>}
    </form>
  );
}

// Phase 4 — rétrofit ConfirmDialog : retrait de rôle destructif, toujours
// confirmé. Erreur notifiée par toast (pas de place pour un message inline
// dans la pastille de rôle compacte où ce bouton est embarqué).
export function RetirerRoleButton({ utilisateurId, role }: { utilisateurId: string; role: RoleUtilisateur }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const { notifier } = useToast();

  async function retirer() {
    setPending(true);
    const etat = await retirerRoleAction(utilisateurId, role);
    setPending(false);
    if (etat.erreur) {
      notifier(etat.erreur, "danger");
      throw new Error(etat.erreur);
    }
    notifier("Rôle retiré.");
  }

  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() => setOpen(true)}
        className="ml-1.5 text-primary/60 transition-colors hover:text-danger disabled:opacity-50"
        aria-label="Retirer ce rôle"
      >
        ×
      </button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={retirer}
        titre={`Retirer le rôle « ${LIBELLES_ROLE[role]} » ?`}
        confirmLabel="Retirer"
      />
    </>
  );
}
