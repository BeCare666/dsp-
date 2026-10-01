"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { demarrerSessionAction } from "@/lib/session-actions";

function Bouton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
    >
      {pending ? "Démarrage…" : "Démarrer"}
    </button>
  );
}

export function DemarrerSessionButton({ grilleId }: { grilleId: string }) {
  const [etat, action] = useActionState(async (_prevState: { erreur?: string }, formData: FormData) => {
    return demarrerSessionAction(String(formData.get("grilleId")));
  }, {});

  return (
    <form action={action}>
      <input type="hidden" name="grilleId" value={grilleId} />
      <Bouton />
      {etat.erreur && <p className="mt-2 text-xs text-danger">{etat.erreur}</p>}
    </form>
  );
}
