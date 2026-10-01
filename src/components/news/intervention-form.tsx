"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ajouterInterventionAction, type EtatAction } from "@/lib/patients-actions";

const ETAT_INITIAL: EtatAction = {};

function Bouton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
    >
      {pending ? "Envoi…" : "Ajouter"}
    </button>
  );
}

export function InterventionForm({ alerteId }: { alerteId: string }) {
  const action = ajouterInterventionAction.bind(null, alerteId);
  const [etat, formAction] = useActionState(action, ETAT_INITIAL);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <textarea
        name="note"
        required
        minLength={3}
        rows={3}
        placeholder="Décrivez l'intervention réalisée…"
        className="rounded-[var(--radius-md)] border border-border bg-surface px-3.5 py-2.5 text-sm text-text placeholder:text-text-faint transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-soft"
      />
      {etat.erreur && <p className="text-xs text-danger">{etat.erreur}</p>}
      <div>
        <Bouton />
      </div>
    </form>
  );
}
