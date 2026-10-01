"use client";

import { useState } from "react";
import { basculerOrganisationAction } from "@/lib/admin-actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";

// Phase 4 — rétrofit ConfirmDialog + Toast (primitives créées en Phase 2,
// câblage différé) : seule la désactivation (destructive) passe par une
// confirmation, la réactivation reste directe.
export function ToggleOrganisationButton({ organisationId, actif }: { organisationId: string; actif: boolean }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [erreur, setErreur] = useState<string>();
  const { notifier } = useToast();

  async function basculer() {
    setPending(true);
    setErreur(undefined);
    const etat = await basculerOrganisationAction(organisationId, actif);
    setPending(false);
    if (etat.erreur) {
      setErreur(etat.erreur);
      throw new Error(etat.erreur);
    }
    notifier(actif ? "Établissement désactivé." : "Établissement activé.");
  }

  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() => (actif ? setOpen(true) : basculer())}
        className={`rounded-[var(--radius-md)] border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
          actif
            ? "border-border text-text-muted hover:border-danger/40 hover:text-danger"
            : "border-success/30 text-success hover:bg-success-soft"
        }`}
      >
        {pending ? "…" : actif ? "Désactiver l'établissement" : "Activer l'établissement"}
      </button>
      {erreur && <p className="mt-2 text-xs text-danger">{erreur}</p>}
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={basculer}
        titre="Désactiver cet établissement ?"
        description="Les comptes de cet établissement perdront l'accès à la plateforme jusqu'à réactivation."
        confirmLabel="Désactiver"
      />
    </>
  );
}
