"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { changerStatutAlerteAction, type EtatAction } from "@/lib/patients-actions";
import type { StatutAlerte } from "@/lib/types";

function BoutonTransition({ label }: { label: string }) {
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

const ETAPES: { statut: StatutAlerte; label: string }[] = [
  { statut: "EN_COURS", label: "Marquer en cours" },
  { statut: "CLOTUREE", label: "Clôturer l'alerte" },
];

export function StatutAlerteButtons({ alerteId, statutActuel }: { alerteId: string; statutActuel: StatutAlerte }) {
  const ordre: Record<StatutAlerte, number> = { OUVERTE: 0, EN_COURS: 1, CLOTUREE: 2 };
  const suivantes = ETAPES.filter((e) => ordre[e.statut] > ordre[statutActuel]);

  if (suivantes.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {suivantes.map((e) => (
        <BoutonUnitaire key={e.statut} alerteId={alerteId} statut={e.statut} label={e.label} />
      ))}
    </div>
  );
}

function BoutonUnitaire({ alerteId, statut, label }: { alerteId: string; statut: StatutAlerte; label: string }) {
  const [etat, action] = useActionState(async (_prevState: EtatAction): Promise<EtatAction> => {
    return changerStatutAlerteAction(alerteId, statut);
  }, {});

  return (
    <form action={action}>
      <BoutonTransition label={label} />
      {etat.erreur && <p className="mt-2 text-xs text-danger">{etat.erreur}</p>}
    </form>
  );
}
