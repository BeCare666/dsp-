"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui/field";
import { SubmitButton } from "./submit-button";
import { AcceptationCgu } from "./acceptation-cgu";
import { inscrireIndividuelAction, type EtatFormulaire } from "@/lib/auth-actions";

const ETAT_INITIAL: EtatFormulaire = {};

export function RegisterIndividuelForm() {
  const [etat, action] = useActionState(inscrireIndividuelAction, ETAT_INITIAL);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Nom" name="nom" required />
        <Field label="Prénom" name="prenom" required />
      </div>
      <Field label="Email" name="email" type="email" autoComplete="email" required />
      <Field label="Téléphone (optionnel)" name="telephone" type="tel" />
      <Field label="Mot de passe" name="motDePasse" type="password" autoComplete="new-password" minLength={8} required />

      {etat.erreur && (
        <p className="rounded-[var(--radius-md)] bg-danger-soft px-3.5 py-2.5 text-sm text-danger">{etat.erreur}</p>
      )}

      <AcceptationCgu />

      <SubmitButton>Créer mon compte</SubmitButton>
    </form>
  );
}
