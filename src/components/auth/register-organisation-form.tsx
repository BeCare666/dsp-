"use client";

import { useActionState } from "react";
import { Field, SelectField } from "@/components/ui/field";
import { SubmitButton } from "./submit-button";
import { AcceptationCgu } from "./acceptation-cgu";
import { inscrireOrganisationAction, type EtatFormulaire } from "@/lib/auth-actions";
import { LIBELLES_CIVILITE, LIBELLES_TYPE_STRUCTURE } from "@/lib/libelles-comptes";

const ETAT_INITIAL: EtatFormulaire = {};

// §4.1 — informations enregistrées lors de l'inscription du compte Organisation.
export function RegisterOrganisationForm() {
  const [etat, action] = useActionState(inscrireOrganisationAction, ETAT_INITIAL);

  return (
    <form action={action} className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-faint">Établissement</legend>
        <Field label="Nom de l'établissement" name="organisationNom" required minLength={2} />
        <Field label="Raison sociale" name="organisationRaisonSociale" required minLength={2} />
        <div className="grid grid-cols-2 gap-4">
          <SelectField label="Type d'établissement" name="organisationTypeStructure" defaultValue="" required>
            <option value="" disabled>
              Sélectionner…
            </option>
            {Object.entries(LIBELLES_TYPE_STRUCTURE).map(([valeur, label]) => (
              <option key={valeur} value={valeur}>
                {label}
              </option>
            ))}
          </SelectField>
          <SelectField label="Catégorie ARS" name="organisationType" defaultValue="EH" required>
            <option value="EH">EH (Établissement hospitalier)</option>
            <option value="ESPC">ESPC (Soins de premiers contacts)</option>
          </SelectField>
        </div>
        <Field
          label="IFU (13 chiffres)"
          name="organisationIfu"
          required
          inputMode="numeric"
          pattern="\d{13}"
          maxLength={13}
          title="L'IFU doit comporter exactement 13 chiffres"
        />
        <Field label="Adresse (optionnel)" name="organisationAdresse" />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Ville" name="organisationVille" required minLength={2} />
          <Field label="Pays" name="organisationPays" required minLength={2} defaultValue="Bénin" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Email de l'établissement" name="organisationEmail" type="email" required />
          <Field
            label="Téléphone de l'établissement"
            name="organisationTelephone"
            type="tel"
            required
            minLength={6}
            placeholder="Format international, ex. +229 01 00 00 00 00"
          />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-faint">Responsable du compte</legend>
        <SelectField label="Civilité" name="responsableCivilite" defaultValue="" required>
          <option value="" disabled>
            Sélectionner…
          </option>
          {Object.entries(LIBELLES_CIVILITE).map(([valeur, label]) => (
            <option key={valeur} value={valeur}>
              {label}
            </option>
          ))}
        </SelectField>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nom" name="responsableNom" required />
          <Field label="Prénom" name="responsablePrenom" required />
        </div>
        <Field label="Email" name="responsableEmail" type="email" autoComplete="email" required />
        <Field label="Téléphone (optionnel)" name="responsableTelephone" type="tel" />
        <Field
          label="Mot de passe"
          name="motDePasse"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </fieldset>

      {etat.erreur && (
        <p className="rounded-[var(--radius-md)] bg-danger-soft px-3.5 py-2.5 text-sm text-danger">{etat.erreur}</p>
      )}

      <AcceptationCgu />

      <SubmitButton>Créer le compte établissement</SubmitButton>
    </form>
  );
}
