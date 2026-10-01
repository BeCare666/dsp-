"use client";

import { useState, useTransition } from "react";
import { StatutModuleBadge } from "@/components/abonnements/statut-module";
import { actionAbonnementAdmin } from "@/lib/abonnements-actions";
import { formaterDate } from "@/lib/format";
import type { AbonnementModule } from "@/lib/types";

const MODULES = [
  { cle: "NEWS" as const, titre: "Score NEWS" },
  { cle: "EI" as const, titre: "Événements indésirables" },
];

const styleBouton =
  "rounded-[var(--radius-md)] border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text transition-colors hover:border-primary/40 disabled:opacity-50";

function LigneModule({
  organisationId,
  module,
  titre,
  abonnement,
}: {
  organisationId: string;
  module: "NEWS" | "EI";
  titre: string;
  abonnement: AbonnementModule | null;
}) {
  const [jours, setJours] = useState("30");
  const [erreur, setErreur] = useState<string>();
  const [pending, startTransition] = useTransition();

  function lancer(action: "activer" | "suspendre" | "reprendre" | "prolonger", avecJours: boolean) {
    setErreur(undefined);
    startTransition(async () => {
      const n = Number(jours);
      const resultat = await actionAbonnementAdmin(organisationId, module, action, avecJours && n > 0 ? n : undefined);
      if (resultat.erreur) setErreur(resultat.erreur);
    });
  }

  return (
    <li className="flex flex-col gap-2 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium text-text">{titre}</span>
        <StatutModuleBadge abonnement={abonnement} />
      </div>
      {abonnement && (
        <p className="text-xs text-text-muted">
          Essai jusqu&apos;au {formaterDate(abonnement.essaiFin)}
          {abonnement.expireLe ? ` · abonnement jusqu'au ${formaterDate(abonnement.expireLe)}` : ""}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5 text-xs text-text-muted">
          Jours
          <input
            type="number"
            min={1}
            max={3650}
            value={jours}
            onChange={(e) => setJours(e.target.value)}
            className="w-20 rounded-[var(--radius-md)] border border-border bg-surface px-2 py-1 text-xs text-text"
          />
        </label>
        <button type="button" disabled={pending} onClick={() => lancer("activer", true)} className={styleBouton}>
          Activer
        </button>
        {abonnement && abonnement.statut !== "SUSPENDU" && (
          <button type="button" disabled={pending} onClick={() => lancer("prolonger", true)} className={styleBouton}>
            Prolonger
          </button>
        )}
        {abonnement && abonnement.statut !== "SUSPENDU" && (
          <button type="button" disabled={pending} onClick={() => lancer("suspendre", false)} className={`${styleBouton} text-danger`}>
            Suspendre
          </button>
        )}
        {abonnement?.statut === "SUSPENDU" && (
          <button type="button" disabled={pending} onClick={() => lancer("reprendre", false)} className={styleBouton}>
            Reprendre
          </button>
        )}
      </div>
      {erreur && <p className="text-xs text-danger">{erreur}</p>}
    </li>
  );
}

// §12.1 — activer, suspendre ou prolonger manuellement un essai ou un abonnement.
export function AbonnementsEtablissement({
  organisationId,
  abonnements,
}: {
  organisationId: string;
  abonnements: AbonnementModule[];
}) {
  return (
    <ul className="divide-y divide-border text-sm">
      {MODULES.map((m) => (
        <LigneModule
          key={m.cle}
          organisationId={organisationId}
          module={m.cle}
          titre={m.titre}
          abonnement={abonnements.find((a) => a.module === m.cle) ?? null}
        />
      ))}
    </ul>
  );
}
