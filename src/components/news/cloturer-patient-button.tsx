"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { cloturerPatientAction, type EtatAction } from "@/lib/patients-actions";

function Bouton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-[var(--radius-md)] border border-border bg-surface px-4 py-2 text-sm font-medium text-text transition-colors hover:border-danger/40 hover:text-danger disabled:opacity-50"
    >
      {pending ? "Clôture…" : "Clôturer la fiche (sortie)"}
    </button>
  );
}

export function CloturerPatientButton({ patientId }: { patientId: string }) {
  const [etat, action] = useActionState(async (_prevState: EtatAction): Promise<EtatAction> => {
    return cloturerPatientAction(patientId);
  }, {});

  return (
    <form action={action}>
      <Bouton />
      {etat.erreur && <p className="mt-2 text-xs text-danger">{etat.erreur}</p>}
    </form>
  );
}
