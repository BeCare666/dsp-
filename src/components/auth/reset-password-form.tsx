"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui/field";
import { SubmitButton } from "./submit-button";
import { reinitialiserMotDePasseAction, type EtatFormulaire } from "@/lib/auth-actions";

const ETAT_INITIAL: EtatFormulaire = {};

export function ResetPasswordForm({ token, activation = false }: { token: string; activation?: boolean }) {
  const [etat, action] = useActionState(reinitialiserMotDePasseAction, ETAT_INITIAL);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      {activation && <input type="hidden" name="origine" value="activation" />}
      <Field
        label={activation ? "Mot de passe" : "Nouveau mot de passe"}
        name="nouveauMotDePasse"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />

      {etat.erreur && (
        <p className="rounded-[var(--radius-md)] bg-danger-soft px-3.5 py-2.5 text-sm text-danger">{etat.erreur}</p>
      )}

      <SubmitButton>{activation ? "Activer mon compte" : "Réinitialiser le mot de passe"}</SubmitButton>
    </form>
  );
}
