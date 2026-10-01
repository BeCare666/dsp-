"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { changerStatutActionAction, type EtatAction } from "@/lib/ei-actions";
import type { StatutActionCorrective } from "@/lib/types";

function Bouton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-[var(--radius-md)] border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text transition-colors hover:border-primary/40 hover:bg-primary-soft/60 disabled:opacity-50"
    >
      {pending ? "…" : label}
    </button>
  );
}

const ETAPES: { statut: StatutActionCorrective; label: string }[] = [
  { statut: "EN_COURS", label: "Marquer en cours" },
  { statut: "REALISEE", label: "Marquer réalisée" },
];

export function StatutActionButtons({
  eiId,
  actionId,
  statutActuel,
}: {
  eiId: string;
  actionId: string;
  statutActuel: StatutActionCorrective;
}) {
  const ordre: Record<StatutActionCorrective, number> = { A_FAIRE: 0, EN_COURS: 1, REALISEE: 2 };
  const suivantes = ETAPES.filter((e) => ordre[e.statut] > ordre[statutActuel]);

  if (suivantes.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {suivantes.map((e) => (
        <BoutonUnitaire key={e.statut} eiId={eiId} actionId={actionId} statut={e.statut} label={e.label} />
      ))}
    </div>
  );
}

function BoutonUnitaire({
  eiId,
  actionId,
  statut,
  label,
}: {
  eiId: string;
  actionId: string;
  statut: StatutActionCorrective;
  label: string;
}) {
  const [etat, action] = useActionState(async (_prevState: EtatAction): Promise<EtatAction> => {
    return changerStatutActionAction(eiId, actionId, statut);
  }, {});

  return (
    <form action={action}>
      <Bouton label={label} />
      {etat.erreur && <p className="mt-1 text-xs text-danger">{etat.erreur}</p>}
    </form>
  );
}
