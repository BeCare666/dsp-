"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui/field";
import { SubmitButton } from "./submit-button";
import { demanderReinitialisationAction, type EtatDemandeReinitialisation } from "@/lib/auth-actions";

const ETAT_INITIAL: EtatDemandeReinitialisation = {};

export function ForgotPasswordForm() {
  const [etat, action] = useActionState(demanderReinitialisationAction, ETAT_INITIAL);

  if (etat.envoye) {
    return (
      <p className="rounded-[var(--radius-md)] bg-success-soft px-3.5 py-2.5 text-sm text-success">
        Si un compte existe avec cet email, un lien de réinitialisation vient d&apos;être envoyé.
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <Field label="Email" name="email" type="email" autoComplete="email" required />
      <SubmitButton>Envoyer le lien de réinitialisation</SubmitButton>
    </form>
  );
}
