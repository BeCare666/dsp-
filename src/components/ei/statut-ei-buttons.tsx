"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { changerStatutEiAction, type EtatAction } from "@/lib/ei-actions";
import type { StatutEi } from "@/lib/types";

function Bouton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-[var(--radius-md)] border border-border bg-surface px-4 py-2 text-sm font-medium text-text transition-colors hover:border-primary/40 hover:bg-primary-soft/60 disabled:opacity-50"
    >
      {pending ? "…" : label}
    </button>
  );
}

// §8.2 / §8.5 — étape suivante du circuit (la qualification a son propre formulaire).
const ETAPE_SUIVANTE: Partial<Record<StatutEi, { statut: StatutEi; label: string; aide: string }>> = {
  QUALIFIE: {
    statut: "EN_ANALYSE",
    label: "Démarrer l'analyse des causes",
    aide: "Documentez ensuite les causes immédiates et profondes.",
  },
  EN_ANALYSE: {
    statut: "PLAN_ACTION",
    label: "Passer au plan d'action",
    aide: "Au moins une cause doit avoir été documentée.",
  },
  PLAN_ACTION: {
    statut: "CLOTURE",
    label: "Clôturer l'événement",
    aide: "Possible uniquement quand toutes les actions correctives sont réalisées.",
  },
};

export function StatutEiButtons({ eiId, statutActuel }: { eiId: string; statutActuel: StatutEi }) {
  const etape = ETAPE_SUIVANTE[statutActuel];
  const [etat, action] = useActionState(async (): Promise<EtatAction> => {
    return etape ? changerStatutEiAction(eiId, etape.statut) : {};
  }, {});

  if (!etape) return null;

  return (
    <form action={action}>
      <Bouton label={etape.label} />
      <p className="mt-2 text-xs text-text-muted">{etape.aide}</p>
      {etat.erreur && <p className="mt-2 text-xs text-danger">{etat.erreur}</p>}
    </form>
  );
}
