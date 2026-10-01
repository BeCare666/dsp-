"use client";

import { useActionState } from "react";
import { SelectField } from "@/components/ui/field";
import { SubmitButton } from "@/components/auth/submit-button";
import { qualifierEiAction, type EtatAction } from "@/lib/ei-actions";
import { LIBELLES_PRIORITE_EI } from "./badges";
import type { EvenementIndesirable, NiveauGraviteEi, TypeEi } from "@/lib/types";

const ETAT_INITIAL: EtatAction = {};

// §8.2 — qualification : confirmation de la gravité et de la catégorie, priorisation.
export function QualifierForm({
  evenement,
  niveauxGravite,
  typesEi,
}: {
  evenement: EvenementIndesirable;
  niveauxGravite: NiveauGraviteEi[];
  typesEi: TypeEi[];
}) {
  const [etat, action] = useActionState(qualifierEiAction.bind(null, evenement.id), ETAT_INITIAL);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <SelectField label="Gravité confirmée" name="niveauGraviteId" defaultValue={evenement.niveauGraviteId ?? ""} required>
          <option value="" disabled>
            Sélectionner…
          </option>
          {niveauxGravite.map((n) => (
            <option key={n.id} value={n.id}>
              {n.libelle}
            </option>
          ))}
        </SelectField>
        <SelectField label="Catégorie (type)" name="typeEiId" defaultValue={evenement.typeEiId ?? ""} required>
          <option value="" disabled>
            Sélectionner…
          </option>
          {typesEi.map((t) => (
            <option key={t.id} value={t.id}>
              {t.libelle}
            </option>
          ))}
        </SelectField>
        <SelectField label="Priorité" name="priorite" defaultValue="NORMALE" required>
          {(["HAUTE", "NORMALE", "BASSE"] as const).map((p) => (
            <option key={p} value={p}>
              {LIBELLES_PRIORITE_EI[p]}
            </option>
          ))}
        </SelectField>
      </div>
      {etat.erreur && <p className="text-sm text-danger">{etat.erreur}</p>}
      <div>
        <SubmitButton>Qualifier l&apos;événement</SubmitButton>
      </div>
    </form>
  );
}
