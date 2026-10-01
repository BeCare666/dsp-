"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { annulerReservationAction, type EtatAction } from "@/lib/reservations-actions";

function Bouton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-[var(--radius-md)] border border-border bg-surface px-4 py-2 text-sm font-medium text-text transition-colors hover:border-danger/40 hover:text-danger disabled:opacity-50"
    >
      {pending ? "Annulation…" : "Annuler la réservation"}
    </button>
  );
}

export function AnnulerReservationButton({ reservationId }: { reservationId: string }) {
  const [etat, action] = useActionState(async (_prevState: EtatAction): Promise<EtatAction> => {
    return annulerReservationAction(reservationId);
  }, {});

  return (
    <form action={action}>
      <Bouton />
      {etat.erreur && <p className="mt-2 text-xs text-danger">{etat.erreur}</p>}
    </form>
  );
}
