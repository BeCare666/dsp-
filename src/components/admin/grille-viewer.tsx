"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { archiverGrilleAction, nouvelleVersionGrilleAction, type EtatAction } from "@/lib/grilles-actions";
import type { Grille } from "@/lib/types";

const LIBELLES_TYPE_REPONSE: Record<string, string> = {
  OUI_NON: "Oui / Non",
  TEXTE: "Texte libre",
  CHOIX: "Choix multiple",
};

function BoutonAction({
  action,
  grilleId,
  libelle,
  libellePending,
  className,
}: {
  action: (grilleId: string) => Promise<EtatAction>;
  grilleId: string;
  libelle: string;
  libellePending: string;
  className: string;
}) {
  const [etat, dispatch] = useActionState(async (_prevState: EtatAction): Promise<EtatAction> => {
    return action(grilleId);
  }, {});

  return (
    <form action={dispatch}>
      <BoutonInterne libelle={libelle} libellePending={libellePending} className={className} />
      {etat.erreur && <p className="mt-1 text-xs text-danger">{etat.erreur}</p>}
    </form>
  );
}

function BoutonInterne({
  libelle,
  libellePending,
  className,
}: {
  libelle: string;
  libellePending: string;
  className: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${className} disabled:opacity-50`}>
      {pending ? libellePending : libelle}
    </button>
  );
}

export function GrilleViewer({ grille }: { grille: Grille }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        {grille.statut === "PUBLIEE" && (
          <BoutonAction
            action={archiverGrilleAction}
            grilleId={grille.id}
            libelle="Archiver"
            libellePending="…"
            className="rounded-[var(--radius-md)] border border-border px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:border-danger/40 hover:text-danger"
          />
        )}
        <BoutonAction
          action={nouvelleVersionGrilleAction}
          grilleId={grille.id}
          libelle="Créer une nouvelle version (brouillon)"
          libellePending="…"
          className="rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        />
      </div>

      <div className="flex flex-col gap-4">
        {(grille.domaines ?? []).map((domaine, di) => (
          <div key={domaine.id} className="rounded-[var(--radius-lg)] border border-border bg-surface p-5">
            <h3 className="font-display text-base font-semibold text-text">
              D{di + 1}. {domaine.nom}
            </h3>
            <div className="mt-3 flex flex-col gap-3 border-l-2 border-border pl-4">
              {domaine.normes.map((norme, ni) => (
                <div key={norme.id}>
                  <p className="text-sm font-semibold text-text">
                    N{ni + 1}. {norme.code} · {norme.libelle}
                  </p>
                  <div className="mt-2 flex flex-col gap-2 border-l-2 border-border pl-4">
                    {norme.criteres.map((critere, ci) => (
                      <div key={critere.id}>
                        <p className="text-sm text-text">
                          C{ci + 1}. {critere.code} · {critere.libelle}
                        </p>
                        <ul className="mt-1 flex flex-col gap-1 border-l-2 border-border pl-4">
                          {critere.elementsMesurables.map((element, ei) => (
                            <li key={element.id} className="text-sm text-text-muted">
                              E{ei + 1}. {element.libelle}{" "}
                              <span className="text-xs text-text-faint">
                                ({LIBELLES_TYPE_REPONSE[element.typeReponse] ?? element.typeReponse}
                                {element.optionsChoix && element.optionsChoix.length > 0
                                  ? ` : ${element.optionsChoix.join(", ")}`
                                  : ""}
                                )
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
