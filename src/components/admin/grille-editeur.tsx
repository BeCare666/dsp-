"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  creerGrilleAction,
  modifierGrilleAction,
  type GrillePayload,
} from "@/lib/grilles-actions";
import type { Grille, TypeElementMesurable, TypeEtablissement, TypeReponse } from "@/lib/types";

interface EtatElement {
  id: string;
  libelle: string;
  typeReponse: TypeReponse;
  optionsChoix: string;
  typeElement: TypeElementMesurable;
  entreDansScore: boolean;
  ordre: number;
}

interface EtatCritere {
  id: string;
  code: string;
  libelle: string;
  categorie: string;
  recommandation: string;
  ordre: number;
  elements: EtatElement[];
}

interface EtatNorme {
  id: string;
  code: string;
  libelle: string;
  ordre: number;
  criteres: EtatCritere[];
}

interface EtatDomaine {
  id: string;
  nom: string;
  ordre: number;
  normes: EtatNorme[];
}

// §6.2 / §6.6 — nature de l'élément ; seul un document à examiner entre
// normalement dans le score.
const LIBELLES_TYPE_ELEMENT: Record<TypeElementMesurable, string> = {
  DOCUMENT_A_EXAMINER: "Document à examiner",
  ENTRETIEN: "Entretien",
  OBSERVATION: "Observation",
};

const LIBELLES_TYPE_REPONSE: Record<TypeReponse, string> = {
  OUI_NON: "Oui / Non",
  TEXTE: "Texte libre",
  CHOIX: "Choix multiple",
};

function idLocal(): string {
  return crypto.randomUUID();
}

function domaineVide(): EtatDomaine {
  return { id: idLocal(), nom: "", ordre: 0, normes: [] };
}

function normeVide(): EtatNorme {
  return { id: idLocal(), code: "", libelle: "", ordre: 0, criteres: [] };
}

function critereVide(): EtatCritere {
  return { id: idLocal(), code: "", libelle: "", categorie: "", recommandation: "", ordre: 0, elements: [] };
}

function elementVide(): EtatElement {
  return {
    id: idLocal(),
    libelle: "",
    typeReponse: "OUI_NON",
    optionsChoix: "",
    typeElement: "DOCUMENT_A_EXAMINER",
    entreDansScore: true,
    ordre: 0,
  };
}

function depuisGrille(grille: Grille): { nom: string; type: TypeEtablissement; domaines: EtatDomaine[] } {
  return {
    nom: grille.nom,
    type: grille.type,
    domaines: (grille.domaines ?? []).map((d) => ({
      id: idLocal(),
      nom: d.nom,
      ordre: d.ordre,
      normes: d.normes.map((n) => ({
        id: idLocal(),
        code: n.code,
        libelle: n.libelle,
        ordre: n.ordre,
        criteres: n.criteres.map((c) => ({
          id: idLocal(),
          code: c.code,
          libelle: c.libelle,
          categorie: c.categorie ?? "",
          recommandation: c.recommandation ?? "",
          ordre: c.ordre,
          elements: c.elementsMesurables.map((e) => ({
            id: idLocal(),
            libelle: e.libelle,
            typeReponse: e.typeReponse,
            optionsChoix: (e.optionsChoix ?? []).join(", "),
            typeElement: e.typeElement ?? "DOCUMENT_A_EXAMINER",
            entreDansScore: e.entreDansScore ?? true,
            ordre: e.ordre,
          })),
        })),
      })),
    })),
  };
}

function versPayload(nom: string, type: TypeEtablissement, domaines: EtatDomaine[]): GrillePayload {
  return {
    nom,
    type,
    domaines: domaines.map((d, di) => ({
      nom: d.nom,
      ordre: di,
      normes: d.normes.map((n, ni) => ({
        code: n.code,
        libelle: n.libelle,
        ordre: ni,
        criteres: n.criteres.map((c, ci) => ({
          code: c.code,
          libelle: c.libelle,
          categorie: c.categorie.trim() || undefined,
          recommandation: c.recommandation.trim() || undefined,
          ordre: ci,
          elementsMesurables: c.elements.map((e, ei) => ({
            libelle: e.libelle,
            typeReponse: e.typeReponse,
            typeElement: e.typeElement,
            entreDansScore: e.entreDansScore,
            ordre: ei,
            ...(e.typeReponse === "CHOIX"
              ? {
                  optionsChoix: e.optionsChoix
                    .split(",")
                    .map((o) => o.trim())
                    .filter(Boolean),
                }
              : {}),
          })),
        })),
      })),
    })),
  };
}

const styleChamp =
  "w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 py-1.5 text-sm text-text placeholder:text-text-faint focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-soft";
const styleBoutonAjouter =
  "rounded-[var(--radius-md)] border border-dashed border-border px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:border-primary/40 hover:text-primary";
const styleBoutonSupprimer =
  "shrink-0 rounded-[var(--radius-md)] px-2 py-1 text-xs font-medium text-danger transition-colors hover:bg-danger-soft";

export function GrilleEditeur({ grille, grilleId }: { grille?: Grille; grilleId?: string }) {
  const router = useRouter();
  const [nom, setNom] = useState(grille?.nom ?? "");
  const [type, setType] = useState<TypeEtablissement>(grille?.type ?? "EH");
  const [domaines, setDomaines] = useState<EtatDomaine[]>(() =>
    grille ? depuisGrille(grille).domaines : [],
  );
  const [erreur, setErreur] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  function majCritere(domaineId: string, normeId: string, critereId: string, patch: Partial<EtatCritere>) {
    setDomaines((prev) =>
      prev.map((d) =>
        d.id !== domaineId
          ? d
          : {
              ...d,
              normes: d.normes.map((n) =>
                n.id !== normeId ? n : { ...n, criteres: n.criteres.map((c) => (c.id === critereId ? { ...c, ...patch } : c)) },
              ),
            },
      ),
    );
  }

  function majElement(domaineId: string, normeId: string, critereId: string, elementId: string, patch: Partial<EtatElement>) {
    setDomaines((prev) =>
      prev.map((d) =>
        d.id !== domaineId
          ? d
          : {
              ...d,
              normes: d.normes.map((n) =>
                n.id !== normeId
                  ? n
                  : {
                      ...n,
                      criteres: n.criteres.map((c) =>
                        c.id !== critereId
                          ? c
                          : { ...c, elements: c.elements.map((el) => (el.id === elementId ? { ...el, ...patch } : el)) },
                      ),
                    },
              ),
            },
      ),
    );
  }

  function enregistrer() {
    setErreur(undefined);
    const payload = versPayload(nom, type, domaines);
    startTransition(async () => {
      const resultat = grilleId
        ? await modifierGrilleAction(grilleId, payload)
        : await creerGrilleAction(payload);
      if (resultat?.erreur) {
        setErreur(resultat.erreur);
        return;
      }
      if (resultat?.succes) router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-text-faint">Nom de la grille</span>
            <input value={nom} onChange={(e) => setNom(e.target.value)} className={styleChamp} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-text-faint">Type d&apos;établissement</span>
            <select value={type} onChange={(e) => setType(e.target.value as TypeEtablissement)} className={styleChamp}>
              <option value="EH">Hôpital (EH)</option>
              <option value="ESPC">Établissement de soins de premiers contacts (ESPC)</option>
            </select>
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {domaines.map((domaine, di) => (
          <div key={domaine.id} className="rounded-[var(--radius-lg)] border border-border bg-surface p-5">
            <div className="flex items-start gap-2">
              <span className="mt-2 shrink-0 text-xs font-semibold text-text-faint">D{di + 1}</span>
              <input
                value={domaine.nom}
                onChange={(e) =>
                  setDomaines((prev) =>
                    prev.map((d) => (d.id === domaine.id ? { ...d, nom: e.target.value } : d)),
                  )
                }
                placeholder="Nom du domaine"
                className={`${styleChamp} font-display font-semibold`}
              />
              <button
                type="button"
                className={styleBoutonSupprimer}
                onClick={() => setDomaines((prev) => prev.filter((d) => d.id !== domaine.id))}
              >
                Supprimer le domaine
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3 border-l-2 border-border pl-4">
              {domaine.normes.map((norme, ni) => (
                <div key={norme.id} className="rounded-[var(--radius-md)] border border-border bg-bg-subtle/40 p-4">
                  <div className="flex items-start gap-2">
                    <span className="mt-2 shrink-0 text-xs font-semibold text-text-faint">N{ni + 1}</span>
                    <input
                      value={norme.code}
                      onChange={(e) =>
                        setDomaines((prev) =>
                          prev.map((d) =>
                            d.id !== domaine.id
                              ? d
                              : {
                                  ...d,
                                  normes: d.normes.map((n) =>
                                    n.id === norme.id ? { ...n, code: e.target.value } : n,
                                  ),
                                },
                          ),
                        )
                      }
                      placeholder="Code"
                      className={`${styleChamp} max-w-[7rem]`}
                    />
                    <input
                      value={norme.libelle}
                      onChange={(e) =>
                        setDomaines((prev) =>
                          prev.map((d) =>
                            d.id !== domaine.id
                              ? d
                              : {
                                  ...d,
                                  normes: d.normes.map((n) =>
                                    n.id === norme.id ? { ...n, libelle: e.target.value } : n,
                                  ),
                                },
                          ),
                        )
                      }
                      placeholder="Libellé de la norme"
                      className={styleChamp}
                    />
                    <button
                      type="button"
                      className={styleBoutonSupprimer}
                      onClick={() =>
                        setDomaines((prev) =>
                          prev.map((d) =>
                            d.id !== domaine.id ? d : { ...d, normes: d.normes.filter((n) => n.id !== norme.id) },
                          ),
                        )
                      }
                    >
                      Supprimer
                    </button>
                  </div>

                  <div className="mt-3 flex flex-col gap-2 border-l-2 border-border pl-4">
                    {norme.criteres.map((critere, ci) => (
                      <div key={critere.id} className="rounded-[var(--radius-md)] border border-border bg-surface p-3">
                        <div className="flex items-start gap-2">
                          <span className="mt-2 shrink-0 text-xs font-semibold text-text-faint">C{ci + 1}</span>
                          <input
                            value={critere.code}
                            onChange={(e) =>
                              setDomaines((prev) =>
                                prev.map((d) =>
                                  d.id !== domaine.id
                                    ? d
                                    : {
                                        ...d,
                                        normes: d.normes.map((n) =>
                                          n.id !== norme.id
                                            ? n
                                            : {
                                                ...n,
                                                criteres: n.criteres.map((c) =>
                                                  c.id === critere.id ? { ...c, code: e.target.value } : c,
                                                ),
                                              },
                                        ),
                                      },
                                ),
                              )
                            }
                            placeholder="Code"
                            className={`${styleChamp} max-w-[7rem]`}
                          />
                          <input
                            value={critere.libelle}
                            onChange={(e) =>
                              setDomaines((prev) =>
                                prev.map((d) =>
                                  d.id !== domaine.id
                                    ? d
                                    : {
                                        ...d,
                                        normes: d.normes.map((n) =>
                                          n.id !== norme.id
                                            ? n
                                            : {
                                                ...n,
                                                criteres: n.criteres.map((c) =>
                                                  c.id === critere.id ? { ...c, libelle: e.target.value } : c,
                                                ),
                                              },
                                        ),
                                      },
                                ),
                              )
                            }
                            placeholder="Libellé du critère"
                            className={styleChamp}
                          />
                          <button
                            type="button"
                            className={styleBoutonSupprimer}
                            onClick={() =>
                              setDomaines((prev) =>
                                prev.map((d) =>
                                  d.id !== domaine.id
                                    ? d
                                    : {
                                        ...d,
                                        normes: d.normes.map((n) =>
                                          n.id !== norme.id
                                            ? n
                                            : { ...n, criteres: n.criteres.filter((c) => c.id !== critere.id) },
                                        ),
                                      },
                                ),
                              )
                            }
                          >
                            Supprimer
                          </button>
                        </div>

                        <div className="mt-2 grid gap-2 sm:grid-cols-[12rem_1fr]">
                          <input
                            value={critere.categorie}
                            onChange={(e) => majCritere(domaine.id, norme.id, critere.id, { categorie: e.target.value })}
                            placeholder="Catégorie (ex. essentiel)"
                            className={styleChamp}
                          />
                          <textarea
                            value={critere.recommandation}
                            onChange={(e) => majCritere(domaine.id, norme.id, critere.id, { recommandation: e.target.value })}
                            placeholder="Recommandation affichée si le critère n'est pas validé (§6.4)"
                            rows={2}
                            className={styleChamp}
                          />
                        </div>

                        <div className="mt-2 flex flex-col gap-2 border-l-2 border-border pl-4">
                          {critere.elements.map((element, ei) => (
                            <div key={element.id} className="flex flex-wrap items-start gap-2">
                              <span className="mt-2 shrink-0 text-xs font-semibold text-text-faint">E{ei + 1}</span>
                              <input
                                value={element.libelle}
                                onChange={(e) =>
                                  setDomaines((prev) =>
                                    prev.map((d) =>
                                      d.id !== domaine.id
                                        ? d
                                        : {
                                            ...d,
                                            normes: d.normes.map((n) =>
                                              n.id !== norme.id
                                                ? n
                                                : {
                                                    ...n,
                                                    criteres: n.criteres.map((c) =>
                                                      c.id !== critere.id
                                                        ? c
                                                        : {
                                                            ...c,
                                                            elements: c.elements.map((el) =>
                                                              el.id === element.id
                                                                ? { ...el, libelle: e.target.value }
                                                                : el,
                                                            ),
                                                          },
                                                    ),
                                                  },
                                            ),
                                          },
                                    ),
                                  )
                                }
                                placeholder="Élément mesurable"
                                className={`${styleChamp} flex-1`}
                              />
                              <select
                                value={element.typeReponse}
                                onChange={(e) =>
                                  setDomaines((prev) =>
                                    prev.map((d) =>
                                      d.id !== domaine.id
                                        ? d
                                        : {
                                            ...d,
                                            normes: d.normes.map((n) =>
                                              n.id !== norme.id
                                                ? n
                                                : {
                                                    ...n,
                                                    criteres: n.criteres.map((c) =>
                                                      c.id !== critere.id
                                                        ? c
                                                        : {
                                                            ...c,
                                                            elements: c.elements.map((el) =>
                                                              el.id === element.id
                                                                ? { ...el, typeReponse: e.target.value as TypeReponse }
                                                                : el,
                                                            ),
                                                          },
                                                    ),
                                                  },
                                            ),
                                          },
                                    ),
                                  )
                                }
                                className={`${styleChamp} max-w-[10rem]`}
                              >
                                {Object.entries(LIBELLES_TYPE_REPONSE).map(([valeur, libelle]) => (
                                  <option key={valeur} value={valeur}>
                                    {libelle}
                                  </option>
                                ))}
                              </select>
                              <select
                                value={element.typeElement}
                                onChange={(e) => {
                                  const typeElement = e.target.value as TypeElementMesurable;
                                  majElement(domaine.id, norme.id, critere.id, element.id, {
                                    typeElement,
                                    entreDansScore: typeElement === "DOCUMENT_A_EXAMINER",
                                  });
                                }}
                                className={`${styleChamp} max-w-[11rem]`}
                              >
                                {Object.entries(LIBELLES_TYPE_ELEMENT).map(([valeur, libelle]) => (
                                  <option key={valeur} value={valeur}>
                                    {libelle}
                                  </option>
                                ))}
                              </select>
                              <label className="mt-1.5 flex shrink-0 items-center gap-1.5 text-xs text-text-muted">
                                <input
                                  type="checkbox"
                                  checked={element.entreDansScore}
                                  onChange={(e) =>
                                    majElement(domaine.id, norme.id, critere.id, element.id, { entreDansScore: e.target.checked })
                                  }
                                  className="h-4 w-4 rounded border-border"
                                />
                                Entre dans le score
                              </label>
                              {element.typeReponse === "CHOIX" && (
                                <input
                                  value={element.optionsChoix}
                                  onChange={(e) =>
                                    setDomaines((prev) =>
                                      prev.map((d) =>
                                        d.id !== domaine.id
                                          ? d
                                          : {
                                              ...d,
                                              normes: d.normes.map((n) =>
                                                n.id !== norme.id
                                                  ? n
                                                  : {
                                                      ...n,
                                                      criteres: n.criteres.map((c) =>
                                                        c.id !== critere.id
                                                          ? c
                                                          : {
                                                              ...c,
                                                              elements: c.elements.map((el) =>
                                                                el.id === element.id
                                                                  ? { ...el, optionsChoix: e.target.value }
                                                                  : el,
                                                              ),
                                                            },
                                                      ),
                                                    },
                                              ),
                                            },
                                      ),
                                    )
                                  }
                                  placeholder="Options séparées par des virgules"
                                  className={`${styleChamp} flex-1`}
                                />
                              )}
                              <button
                                type="button"
                                className={styleBoutonSupprimer}
                                onClick={() =>
                                  setDomaines((prev) =>
                                    prev.map((d) =>
                                      d.id !== domaine.id
                                        ? d
                                        : {
                                            ...d,
                                            normes: d.normes.map((n) =>
                                              n.id !== norme.id
                                                ? n
                                                : {
                                                    ...n,
                                                    criteres: n.criteres.map((c) =>
                                                      c.id !== critere.id
                                                        ? c
                                                        : { ...c, elements: c.elements.filter((el) => el.id !== element.id) },
                                                    ),
                                                  },
                                            ),
                                          },
                                    ),
                                  )
                                }
                              >
                                Supprimer
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            className={styleBoutonAjouter}
                            onClick={() =>
                              setDomaines((prev) =>
                                prev.map((d) =>
                                  d.id !== domaine.id
                                    ? d
                                    : {
                                        ...d,
                                        normes: d.normes.map((n) =>
                                          n.id !== norme.id
                                            ? n
                                            : {
                                                ...n,
                                                criteres: n.criteres.map((c) =>
                                                  c.id === critere.id
                                                    ? { ...c, elements: [...c.elements, elementVide()] }
                                                    : c,
                                                ),
                                              },
                                        ),
                                      },
                                ),
                              )
                            }
                          >
                            + Élément mesurable
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      className={styleBoutonAjouter}
                      onClick={() =>
                        setDomaines((prev) =>
                          prev.map((d) =>
                            d.id !== domaine.id
                              ? d
                              : {
                                  ...d,
                                  normes: d.normes.map((n) =>
                                    n.id === norme.id ? { ...n, criteres: [...n.criteres, critereVide()] } : n,
                                  ),
                                },
                          ),
                        )
                      }
                    >
                      + Critère
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className={styleBoutonAjouter}
                onClick={() =>
                  setDomaines((prev) =>
                    prev.map((d) => (d.id === domaine.id ? { ...d, normes: [...d.normes, normeVide()] } : d)),
                  )
                }
              >
                + Norme
              </button>
            </div>
          </div>
        ))}
        <button type="button" className={styleBoutonAjouter} onClick={() => setDomaines((prev) => [...prev, domaineVide()])}>
          + Domaine
        </button>
      </div>

      {erreur && <p className="text-sm text-danger">{erreur}</p>}

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={isPending || !nom.trim() || domaines.length === 0}
          onClick={enregistrer}
          className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          {isPending ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
