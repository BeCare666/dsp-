"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { marquerRealiseeAction, type EtatAction } from "@/lib/admin-actions";

const ETAT_INITIAL: EtatAction = {};

function Bouton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
    >
      {pending ? "Enregistrement…" : "Clôturer la session"}
    </button>
  );
}

// §12.5 — clôture d'une session de formation et suivi des présences
// (nombre de participants présents, au plus la taille de la formule).
export function MarquerRealiseeForm({
  reservationId,
  places = 1,
  onSuccess,
}: {
  reservationId: string;
  places?: number;
  onSuccess: () => void;
}) {
  const [presents, setPresents] = useState(places);
  const [etat, formAction] = useActionState(async (_prevState: EtatAction): Promise<EtatAction> => {
    return marquerRealiseeAction(reservationId, presents);
  }, ETAT_INITIAL);

  useEffect(() => {
    if (etat.succes) onSuccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etat.succes]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm text-text">
        Participants présents (sur {places})
        <input
          type="number"
          min={0}
          max={places}
          value={presents}
          onChange={(e) => setPresents(Number(e.target.value))}
          className="w-28 rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 text-sm"
        />
      </label>
      {etat.erreur && <p className="text-sm text-danger">{etat.erreur}</p>}
      <Bouton />
    </form>
  );
}
