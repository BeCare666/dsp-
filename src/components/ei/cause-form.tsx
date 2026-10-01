"use client";

import { useActionState, useEffect, useRef } from "react";
import { Field, SelectField } from "@/components/ui/field";
import { SubmitButton } from "@/components/auth/submit-button";
import { ajouterCauseAction, type EtatAction } from "@/lib/ei-actions";

const ETAT_INITIAL: EtatAction = {};

// §8.2 — analyse des causes sous forme de champs guidés : méthode des
// « 5 pourquoi » (on remonte d'une réponse à la suivante), puis la cause retenue.
export function CauseForm({ eiId }: { eiId: string }) {
  const action = ajouterCauseAction.bind(null, eiId);
  const [etat, formAction] = useActionState(action, ETAT_INITIAL);
  const formulaire = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (etat.succes) formulaire.current?.reset();
  }, [etat]);

  return (
    <form ref={formulaire} action={formAction} className="flex flex-col gap-4">
      <SelectField label="Type de cause" name="type" defaultValue="IMMEDIATE">
        <option value="IMMEDIATE">Cause immédiate</option>
        <option value="PROFONDE">Cause profonde</option>
      </SelectField>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-sm font-medium text-text">Méthode des « 5 pourquoi »</legend>
        <p className="-mt-1 text-xs text-text-muted">
          Partez du fait constaté et demandez « Pourquoi ? » jusqu&apos;à atteindre une cause sur laquelle agir. Remplissez
          autant de niveaux que nécessaire.
        </p>
        {[1, 2, 3, 4, 5].map((n) => (
          <Field key={n} label={`Pourquoi ? (${n})`} name={`pourquoi${n}`} maxLength={1000} required={n === 1} />
        ))}
      </fieldset>

      <Field label="Cause retenue" name="description" required minLength={3} placeholder="Synthèse de la cause identifiée" />

      {etat.erreur && <p className="text-sm text-danger">{etat.erreur}</p>}
      <div>
        <SubmitButton>Ajouter la cause</SubmitButton>
      </div>
    </form>
  );
}
