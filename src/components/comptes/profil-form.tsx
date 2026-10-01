"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { modifierMonProfilAction } from "@/lib/auth-actions";
import type { EtatAction, UtilisateurProfil } from "@/lib/types";

const ETAT_INITIAL: EtatAction = {};

const styleChamp =
  "rounded-[var(--radius-md)] border border-border bg-surface px-3.5 py-2.5 text-sm text-text transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-soft";

function Bouton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
    >
      {pending ? "Enregistrement…" : "Enregistrer"}
    </button>
  );
}

// Composant partagé entre (app)/profil et (admin)/admin/profil — même
// patron que components/comptes/sessions-list.tsx (Phase 2/D8.2) : un seul
// composant, pas de duplication par contexte.
export function ProfilForm({ profil }: { profil: UtilisateurProfil }) {
  const [etat, action] = useActionState(modifierMonProfilAction, ETAT_INITIAL);

  return (
    <form action={action} className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-border bg-surface p-6">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="prenom" className="text-sm font-medium text-text">
          Prénom
        </label>
        <input id="prenom" name="prenom" type="text" defaultValue={profil.prenom} required minLength={1} className={styleChamp} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="nom" className="text-sm font-medium text-text">
          Nom
        </label>
        <input id="nom" name="nom" type="text" defaultValue={profil.nom} required minLength={1} className={styleChamp} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="telephone" className="text-sm font-medium text-text">
          Téléphone
        </label>
        <input id="telephone" name="telephone" type="text" defaultValue={profil.telephone ?? ""} className={styleChamp} />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-text">Email</span>
        <input
          type="email"
          value={profil.email}
          disabled
          className={`${styleChamp} cursor-not-allowed bg-bg-subtle text-text-muted`}
        />
        <p className="text-xs text-text-faint">
          L&apos;email n&apos;est pas modifiable depuis cette page (lié à la vérification de votre compte).
        </p>
      </div>

      <div className="mt-1 flex items-center gap-3">
        <Bouton />
        {etat.erreur && <p className="text-sm text-danger">{etat.erreur}</p>}
        {etat.succes && <p className="text-sm text-success">Enregistré.</p>}
      </div>
    </form>
  );
}
