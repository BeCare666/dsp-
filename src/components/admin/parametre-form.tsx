"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { formaterDateHeure } from "@/lib/format";
import { modifierParametreAction, type EtatAction } from "@/lib/parametres-actions";
import type { ParametrePlateforme } from "@/lib/types";

const ETAT_INITIAL: EtatAction = {};

function Bouton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
    >
      {pending ? "Enregistrement…" : "Enregistrer"}
    </button>
  );
}

export function ParametreForm({ parametre }: { parametre: ParametrePlateforme }) {
  const [etat, action] = useActionState(modifierParametreAction, ETAT_INITIAL);

  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6">
      <h2 className="font-display text-base font-semibold text-text">{parametre.cle}</h2>
      <p className="mt-1 text-sm text-text-muted">{parametre.description}</p>
      <p className="mt-1 text-xs text-text-faint">
        Défaut : {parametre.valeurDefaut} · Modifié le {formaterDateHeure(parametre.updatedAt)}
      </p>

      <form action={action} className="mt-4 flex flex-wrap items-end gap-3">
        <input type="hidden" name="cle" value={parametre.cle} />
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`valeur-${parametre.cle}`} className="text-sm font-medium text-text">
            Valeur ({parametre.type})
          </label>
          <input
            id={`valeur-${parametre.cle}`}
            name="valeur"
            type={parametre.type === "entier" ? "number" : "text"}
            defaultValue={parametre.valeur}
            required
            className="rounded-[var(--radius-md)] border border-border bg-surface px-3.5 py-2.5 text-sm text-text transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-soft"
          />
        </div>
        <Bouton />
      </form>
      {etat.erreur && <p className="mt-2 text-sm text-danger">{etat.erreur}</p>}
      {etat.succes && <p className="mt-2 text-sm text-success">Enregistré.</p>}
    </div>
  );
}
