"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { fixerDateRdvAction, type EtatAction } from "@/lib/admin-actions";

const ETAT_INITIAL: EtatAction = {};

function Bouton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
    >
      {pending ? "Enregistrement…" : "Confirmer la date"}
    </button>
  );
}

export function FixerDateRdvForm({ reservationId, onSuccess }: { reservationId: string; onSuccess: () => void }) {
  const action = fixerDateRdvAction.bind(null, reservationId);
  const [etat, formAction] = useActionState(action, ETAT_INITIAL);

  useEffect(() => {
    if (etat.succes) onSuccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etat.succes]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="dateRdv" className="text-sm font-medium text-text">
          Date et heure du rendez-vous
        </label>
        <input
          id="dateRdv"
          name="dateRdv"
          type="datetime-local"
          required
          className="rounded-[var(--radius-md)] border border-border bg-surface px-3.5 py-2.5 text-sm text-text transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-soft"
        />
      </div>
      {etat.erreur && <p className="text-sm text-danger">{etat.erreur}</p>}
      <Bouton />
    </form>
  );
}
