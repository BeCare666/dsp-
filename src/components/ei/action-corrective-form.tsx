"use client";

import { useActionState, useEffect, useRef } from "react";
import { Field, SelectField } from "@/components/ui/field";
import { SubmitButton } from "@/components/auth/submit-button";
import { ajouterActionCorrectiveAction, type EtatAction } from "@/lib/ei-actions";
import type { MembreEtablissement } from "@/lib/types";

const ETAT_INITIAL: EtatAction = {};

// §8.2 — plan d'action correctif : une action, un responsable (membre actif de
// l'établissement, contrôlé par l'API), une échéance.
export function ActionCorrectiveForm({
  eiId,
  membres,
  moiId,
}: {
  eiId: string;
  membres: MembreEtablissement[];
  moiId: string;
}) {
  const action = ajouterActionCorrectiveAction.bind(null, eiId);
  const [etat, formAction] = useActionState(action, ETAT_INITIAL);
  const formulaire = useRef<HTMLFormElement>(null);
  const actifs = membres.filter((m) => m.actif);

  useEffect(() => {
    if (etat.succes) formulaire.current?.reset();
  }, [etat]);

  return (
    <form ref={formulaire} action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="action-description" className="text-sm font-medium text-text">
          Action corrective
        </label>
        <textarea
          id="action-description"
          name="description"
          required
          minLength={3}
          rows={3}
          className="rounded-[var(--radius-md)] border border-border bg-surface px-3.5 py-2.5 text-sm text-text placeholder:text-text-faint transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-soft"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Responsable" name="responsableId" defaultValue={moiId} required>
          {actifs.map((m) => (
            <option key={m.id} value={m.id}>
              {m.prenom} {m.nom}
              {m.id === moiId ? " (moi)" : ""}
            </option>
          ))}
        </SelectField>
        <Field label="Échéance" name="echeance" type="date" required />
      </div>
      {etat.erreur && <p className="text-sm text-danger">{etat.erreur}</p>}
      <div>
        <SubmitButton>Ajouter l&apos;action</SubmitButton>
      </div>
    </form>
  );
}
