"use client";

import { useActionState } from "react";
import { Field, SelectField } from "@/components/ui/field";
import { SubmitButton } from "@/components/auth/submit-button";
import { declarerEiAction, type EtatAction } from "@/lib/ei-actions";
import type { NiveauGraviteEi, ServiceEtablissement, TypeEi } from "@/lib/types";

const ETAT_INITIAL: EtatAction = {};

const styleZone =
  "rounded-[var(--radius-md)] border border-border bg-surface px-3.5 py-2.5 text-sm text-text placeholder:text-text-faint transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-soft";

export interface CritereProposable {
  id: string;
  libelle: string;
}

// Valeur par défaut d'un <input type="datetime-local"> : maintenant, heure locale.
function maintenantLocal(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

// §8.1 — fiche standardisée de déclaration d'un événement indésirable.
export function DeclarerForm({
  typesEi,
  niveauxGravite,
  services,
  criteres,
}: {
  typesEi: TypeEi[];
  niveauxGravite: NiveauGraviteEi[];
  services: ServiceEtablissement[];
  criteres: CritereProposable[];
}) {
  const [etat, action] = useActionState(declarerEiAction, ETAT_INITIAL);

  return (
    <form action={action} className="flex flex-col gap-5">
      <Field
        label="Date et heure de survenue"
        name="dateSurvenue"
        type="datetime-local"
        required
        defaultValue={maintenantLocal()}
        max={maintenantLocal()}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Service concerné" name="serviceId" defaultValue="">
          <option value="">Non précisé (indiquer le lieu)</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nom}
            </option>
          ))}
        </SelectField>
        <Field label="Lieu (si hors service)" name="lieu" maxLength={191} placeholder="Ex. couloir du 2e étage" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Type d'événement" name="typeEiId" defaultValue="">
          <option value="">Non précisé</option>
          {typesEi.map((t) => (
            <option key={t.id} value={t.id}>
              {t.libelle}
            </option>
          ))}
        </SelectField>
        <SelectField label="Gravité" name="niveauGraviteId" defaultValue="" required>
          <option value="" disabled>
            Sélectionner…
          </option>
          {niveauxGravite.map((n) => (
            <option key={n.id} value={n.id}>
              {n.libelle}
            </option>
          ))}
        </SelectField>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-medium text-text">
          Description factuelle de l&apos;événement
        </label>
        <textarea
          id="description"
          name="description"
          required
          minLength={5}
          rows={5}
          placeholder="Ce qui s'est passé, dans quel contexte, sans jugement ni interprétation."
          className={styleZone}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="personnesImpliquees" className="text-sm font-medium text-text">
          Personnes impliquées ou témoins
        </label>
        <textarea
          id="personnesImpliquees"
          name="personnesImpliquees"
          required
          minLength={2}
          maxLength={2000}
          rows={2}
          placeholder="Fonctions ou noms des professionnels impliqués et des témoins (pas d'identité de patient)."
          className={styleZone}
        />
      </div>

      {criteres.length > 0 && (
        <SelectField label="Critère d'auto-évaluation concerné (optionnel)" name="critereId" defaultValue="">
          <option value="">Aucun</option>
          {criteres.map((c) => (
            <option key={c.id} value={c.id}>
              {c.libelle}
            </option>
          ))}
        </SelectField>
      )}

      {etat.erreur && <p className="text-sm text-danger">{etat.erreur}</p>}
      <SubmitButton>Déclarer l&apos;événement</SubmitButton>
    </form>
  );
}
