"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Field } from "@/components/ui/field";
import type { EtatAction } from "@/lib/admin-actions";
import type { Formation } from "@/lib/types";

const ETAT_INITIAL: EtatAction = {};

function Bouton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
    >
      {pending ? "Enregistrement…" : label}
    </button>
  );
}

export function FormationForm({
  action,
  formation,
  libelleBouton,
  onSuccess,
}: {
  action: (etat: EtatAction, formData: FormData) => Promise<EtatAction>;
  formation?: Formation;
  libelleBouton: string;
  onSuccess: () => void;
}) {
  const [etat, formAction] = useActionState(action, ETAT_INITIAL);

  useEffect(() => {
    if (etat.succes) onSuccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etat.succes]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Titre" name="titre" required minLength={3} defaultValue={formation?.titre} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-medium text-text">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          minLength={10}
          rows={4}
          defaultValue={formation?.description}
          className="rounded-[var(--radius-md)] border border-border bg-surface px-3.5 py-2.5 text-sm text-text placeholder:text-text-faint transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-soft"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="objectifs" className="text-sm font-medium text-text">
          Objectifs
        </label>
        <textarea
          id="objectifs"
          name="objectifs"
          rows={3}
          defaultValue={formation?.objectifs ?? ""}
          placeholder="Ce que les participants sauront faire à l'issue de la formation"
          className="rounded-[var(--radius-md)] border border-border bg-surface px-3.5 py-2.5 text-sm text-text placeholder:text-text-faint transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-soft"
        />
      </div>
      <Field
        label="Durée (heures, optionnel)"
        name="dureeHeures"
        type="number"
        min={1}
        defaultValue={formation?.dureeHeures ?? undefined}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          label="Tarif individuel (FCFA)"
          name="prixIndividuel"
          type="number"
          required
          min={0}
          defaultValue={formation?.prixIndividuel}
        />
        <Field
          label="Tarif groupe de 5 (FCFA)"
          name="prixGroupe5"
          type="number"
          required
          min={0}
          defaultValue={formation?.prixGroupe5}
        />
        <Field
          label="Tarif groupe de 10 (FCFA)"
          name="prixGroupe10"
          type="number"
          required
          min={0}
          defaultValue={formation?.prixGroupe10}
        />
      </div>

      {etat.erreur && <p className="text-sm text-danger">{etat.erreur}</p>}
      <div>
        <Bouton label={libelleBouton} />
      </div>
    </form>
  );
}
