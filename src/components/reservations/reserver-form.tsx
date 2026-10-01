"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { formaterFcfa } from "@/lib/format";
import { creerReservationAction, type EtatAction } from "@/lib/reservations-actions";
import type { Formation, FormuleFormation } from "@/lib/types";

const ETAT_INITIAL: EtatAction = {};

const FORMULES: { valeur: FormuleFormation; label: string; description: string }[] = [
  { valeur: "INDIVIDUEL", label: "Individuel", description: "Une personne" },
  { valeur: "GROUPE_5", label: "Groupe de 5", description: "Jusqu'à 5 personnes" },
  { valeur: "GROUPE_10", label: "Groupe de 10", description: "Jusqu'à 10 personnes" },
];

function prixFormule(formation: Formation, formule: FormuleFormation): number {
  if (formule === "INDIVIDUEL") return formation.prixIndividuel;
  if (formule === "GROUPE_5") return formation.prixGroupe5;
  return formation.prixGroupe10;
}

function Bouton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
    >
      {pending ? "Création…" : "Réserver et payer"}
    </button>
  );
}

export function ReserverForm({ formation }: { formation: Formation }) {
  const action = creerReservationAction.bind(null, formation.id);
  const [etat, formAction] = useActionState(action, ETAT_INITIAL);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        {FORMULES.map((f, i) => (
          <label
            key={f.valeur}
            className="flex cursor-pointer items-center justify-between rounded-[var(--radius-lg)] border border-border bg-surface p-4 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary-soft/40"
          >
            <div className="flex items-center gap-3">
              <input type="radio" name="formule" value={f.valeur} defaultChecked={i === 0} required className="h-4 w-4" />
              <div>
                <p className="text-sm font-medium text-text">{f.label}</p>
                <p className="text-xs text-text-muted">{f.description}</p>
              </div>
            </div>
            <span className="font-display text-base font-bold text-primary">
              {formaterFcfa(prixFormule(formation, f.valeur))}
            </span>
          </label>
        ))}
      </div>

      {etat.erreur && <p className="text-sm text-danger">{etat.erreur}</p>}
      <Bouton />
    </form>
  );
}
