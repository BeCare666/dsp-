"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { uploaderPieceJointeAction, type EtatAction } from "@/lib/ei-actions";

const ETAT_INITIAL: EtatAction = {};

function Bouton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
    >
      {pending ? "Envoi…" : "Envoyer"}
    </button>
  );
}

export function PieceJointeForm({ eiId }: { eiId: string }) {
  const action = uploaderPieceJointeAction.bind(null, eiId);
  const [etat, formAction] = useActionState(action, ETAT_INITIAL);

  return (
    <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <input
        type="file"
        name="fichier"
        required
        accept="image/jpeg,image/png,image/webp,application/pdf,text/plain"
        className="flex-1 text-sm text-text-muted file:mr-3 file:rounded-[var(--radius-md)] file:border-0 file:bg-primary-soft file:px-3.5 file:py-2 file:text-sm file:font-medium file:text-primary"
      />
      <Bouton />
      {etat.erreur && <p className="text-xs text-danger sm:ml-3">{etat.erreur}</p>}
    </form>
  );
}
