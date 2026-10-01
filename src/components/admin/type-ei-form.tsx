"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Field } from "@/components/ui/field";
import { creerTypeEiAction, type EtatAction } from "@/lib/admin-actions";

const ETAT_INITIAL: EtatAction = {};

function Bouton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
    >
      {pending ? "Création…" : "Créer"}
    </button>
  );
}

export function TypeEiForm({ onSuccess }: { onSuccess: () => void }) {
  const [etat, action] = useActionState(creerTypeEiAction, ETAT_INITIAL);

  useEffect(() => {
    if (etat.succes) onSuccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etat.succes]);

  return (
    <form action={action} className="flex flex-col gap-4">
      <Field label="Libellé" name="libelle" required minLength={2} placeholder="Ex. Erreur médicamenteuse" />
      {etat.erreur && <p className="text-sm text-danger">{etat.erreur}</p>}
      <div>
        <Bouton />
      </div>
    </form>
  );
}
