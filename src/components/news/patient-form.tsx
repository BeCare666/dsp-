"use client";

import { useActionState } from "react";
import { Field, SelectField } from "@/components/ui/field";
import { SubmitButton } from "@/components/auth/submit-button";
import { creerPatientAction, type EtatAction } from "@/lib/patients-actions";
import type { ServiceEtablissement } from "@/lib/types";

const ETAT_INITIAL: EtatAction = {};

// §7.1 — fiche patient minimale : identifiant interne, service, numéro de lit.
// Aucune donnée d'identité n'est demandée (DSP n'est pas un dossier patient).
export function PatientForm({
  services,
  serviceParDefaut,
}: {
  services: ServiceEtablissement[];
  serviceParDefaut?: string | null;
}) {
  const [etat, action] = useActionState(creerPatientAction, ETAT_INITIAL);

  return (
    <form action={action} className="flex flex-col gap-5">
      <Field
        label="Identifiant interne du patient"
        name="identifiantInterne"
        required
        maxLength={64}
        placeholder="Ex. numéro de dossier ou d'admission de l'établissement"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Service" name="serviceId" defaultValue={serviceParDefaut ?? ""}>
          <option value="">Non précisé</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nom}
            </option>
          ))}
        </SelectField>
        <Field label="Numéro de lit" name="numeroLit" maxLength={20} placeholder="Optionnel" />
      </div>
      <p className="rounded-[var(--radius-md)] bg-bg-subtle px-3.5 py-2.5 text-xs text-text-muted">
        Ne saisissez ni nom, ni prénom, ni date de naissance : DSP ne conserve pas l&apos;identité des patients.
      </p>

      {etat.erreur && <p className="text-sm text-danger">{etat.erreur}</p>}
      <SubmitButton>Créer la fiche patient</SubmitButton>
    </form>
  );
}
