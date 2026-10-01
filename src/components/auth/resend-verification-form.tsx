"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { renvoyerVerificationAction, type EtatFormulaire } from "@/lib/auth-actions";

const ETAT_INITIAL: EtatFormulaire = {};

function BoutonRenvoyer() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
    >
      {pending ? "Envoi…" : "Renvoyer l'email"}
    </button>
  );
}

export function ResendVerificationForm({ email }: { email: string }) {
  const [, action] = useActionState(renvoyerVerificationAction, ETAT_INITIAL);

  return (
    <form action={action}>
      <input type="hidden" name="email" value={email} />
      <BoutonRenvoyer />
    </form>
  );
}
