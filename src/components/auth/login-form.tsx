"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Field } from "@/components/ui/field";
import { SubmitButton } from "./submit-button";
import { connexionAction, type EtatFormulaire } from "@/lib/auth-actions";

const ETAT_INITIAL: EtatFormulaire = {};

export function LoginForm({ next }: { next?: string }) {
  const [etat, action] = useActionState(connexionAction, ETAT_INITIAL);

  return (
    <form action={action} className="flex flex-col gap-4">
      {next && <input type="hidden" name="next" value={next} />}
      <Field label="Email" name="email" type="email" autoComplete="email" required />
      <div className="flex flex-col gap-1.5">
        <Field label="Mot de passe" name="motDePasse" type="password" autoComplete="current-password" required />
        <Link href="/mot-de-passe-oublie" className="self-end text-xs font-medium text-primary hover:underline">
          Mot de passe oublié ?
        </Link>
      </div>

      {etat.erreur && (
        <p className="rounded-[var(--radius-md)] bg-danger-soft px-3.5 py-2.5 text-sm text-danger">{etat.erreur}</p>
      )}

      <SubmitButton>Se connecter</SubmitButton>
    </form>
  );
}
