"use client";

import { useState } from "react";
import { basculerUtilisateurAction } from "@/lib/admin-actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";

// Phase 4 — rétrofit ConfirmDialog + Toast, même logique que
// toggle-organisation-button.tsx : confirmation uniquement pour la
// désactivation (destructive), réactivation directe.
export function ToggleUtilisateurButton({ utilisateurId, actif }: { utilisateurId: string; actif: boolean }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [erreur, setErreur] = useState<string>();
  const { notifier } = useToast();

  async function basculer() {
    setPending(true);
    setErreur(undefined);
    const etat = await basculerUtilisateurAction(utilisateurId, actif);
    setPending(false);
    if (etat.erreur) {
      setErreur(etat.erreur);
      throw new Error(etat.erreur);
    }
    notifier(actif ? "Utilisateur désactivé." : "Utilisateur réactivé.");
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
        {pending ? "…" : actif ? "Désactiver l'utilisateur" : "Réactiver l'utilisateur"}
      </button>
      {erreur && <p className="mt-2 text-xs text-danger">{erreur}</p>}
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={basculer}
        titre="Désactiver cet utilisateur ?"
        description="Il ne pourra plus se connecter à la plateforme tant que son compte n'est pas réactivé."
        confirmLabel="Désactiver"
      />
    </>
  );
}
