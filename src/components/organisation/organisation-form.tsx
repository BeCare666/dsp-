"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { modifierMonOrganisationAction, type EtatAction } from "@/lib/organisation-actions";
import type { Organisation } from "@/lib/types";
import { LIBELLES_TYPE_STRUCTURE } from "@/lib/libelles-comptes";

const ETAT_INITIAL: EtatAction = {};

const styleChamp =
  "rounded-[var(--radius-md)] border border-border bg-surface px-3.5 py-2.5 text-sm text-text transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-soft";

function Bouton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
    >
      {pending ? "Enregistrement…" : "Enregistrer"}
    </button>
  );
}

export function OrganisationForm({ organisation }: { organisation: Organisation }) {
  const [etat, action] = useActionState(modifierMonOrganisationAction, ETAT_INITIAL);

  return (
    <form action={action} className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-border bg-surface p-6">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="nom" className="text-sm font-medium text-text">
          Nom de l&apos;établissement
        </label>
        <input id="nom" name="nom" type="text" defaultValue={organisation.nom} required minLength={2} className={styleChamp} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="raisonSociale" className="text-sm font-medium text-text">
          Raison sociale
        </label>
        <input id="raisonSociale" name="raisonSociale" type="text" defaultValue={organisation.raisonSociale ?? ""} className={styleChamp} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="typeStructure" className="text-sm font-medium text-text">
          Type d&apos;établissement
        </label>
        <select id="typeStructure" name="typeStructure" defaultValue={organisation.typeStructure ?? ""} className={styleChamp}>
          <option value="">Non renseigné</option>
          {Object.entries(LIBELLES_TYPE_STRUCTURE).map(([valeur, label]) => (
            <option key={valeur} value={valeur}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="adresse" className="text-sm font-medium text-text">
          Adresse
        </label>
        <input id="adresse" name="adresse" type="text" defaultValue={organisation.adresse ?? ""} className={styleChamp} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ville" className="text-sm font-medium text-text">
            Ville
          </label>
          <input id="ville" name="ville" type="text" defaultValue={organisation.ville ?? ""} className={styleChamp} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pays" className="text-sm font-medium text-text">
            Pays
          </label>
          <input id="pays" name="pays" type="text" defaultValue={organisation.pays ?? ""} className={styleChamp} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="telephone" className="text-sm font-medium text-text">
          Téléphone
        </label>
        <input id="telephone" name="telephone" type="text" defaultValue={organisation.telephone ?? ""} className={styleChamp} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-text">
          Email
        </label>
        <input id="email" name="email" type="email" defaultValue={organisation.email ?? ""} className={styleChamp} />
      </div>

      <div className="mt-1 flex items-center gap-3">
        <Bouton />
        {etat.erreur && <p className="text-sm text-danger">{etat.erreur}</p>}
        {etat.succes && <p className="text-sm text-success">Enregistré.</p>}
      </div>
    </form>
  );
}
