"use client";

import { useMemo, useState, useTransition } from "react";
import { motion } from "motion/react";
import { enregistrerReponseAction, soumettreSessionAction } from "@/lib/session-actions";
import type { SessionEvaluation, TypeElementMesurable } from "@/lib/types";

type ValeurReponse = boolean | string | undefined;

interface Question {
  index: number;
  elementId: string;
  libelle: string;
  typeReponse: "OUI_NON" | "TEXTE" | "CHOIX";
  optionsChoix: string[] | null;
  typeElement: TypeElementMesurable;
  entreDansScore: boolean;
  domaineId: string;
  domaineNom: string;
  normeCode: string;
  normeLibelle: string;
  critereCode: string;
  critereLibelle: string;
}

const LIBELLES_TYPE_ELEMENT: Record<TypeElementMesurable, string> = {
  DOCUMENT_A_EXAMINER: "Document à examiner",
  ENTRETIEN: "Élément d'entretien",
  OBSERVATION: "Élément d'observation",
};

// §6.2 — parcours guidé domaine par domaine, une question (élément
// mesurable) à la fois, dans l'ordre de la grille officielle.
function aplatir(session: SessionEvaluation): Question[] {
  const questions: Question[] = [];
  for (const domaine of session.grille.domaines ?? []) {
    for (const norme of domaine.normes) {
      for (const critere of norme.criteres) {
        for (const element of critere.elementsMesurables) {
          questions.push({
            index: questions.length,
            elementId: element.id,
            libelle: element.libelle,
            typeReponse: element.typeReponse,
            optionsChoix: element.optionsChoix,
            typeElement: element.typeElement ?? "DOCUMENT_A_EXAMINER",
            entreDansScore: element.entreDansScore ?? true,
            domaineId: domaine.id,
            domaineNom: domaine.nom,
            normeCode: norme.code,
            normeLibelle: norme.libelle,
            critereCode: critere.code,
            critereLibelle: critere.libelle,
          });
        }
      }
    }
  }
  return questions;
}

function estRepondu(v: ValeurReponse): boolean {
  return v !== undefined && v !== "";
}

export function Questionnaire({ session }: { session: SessionEvaluation }) {
  const questions = useMemo(() => aplatir(session), [session]);
  const [reponses, setReponses] = useState<Record<string, ValeurReponse>>(() => {
    const etat: Record<string, ValeurReponse> = {};
    for (const r of session.reponses) etat[r.elementMesurableId] = r.valeur as ValeurReponse;
    return etat;
  });
  // §6.2 — reprise là où la session s'est arrêtée : première question sans réponse.
  const [courante, setCourante] = useState(() => {
    const premiere = questions.findIndex((q) => !estRepondu(reponses[q.elementId]));
    return premiere === -1 ? questions.length : premiere;
  });
  const [brouillonTexte, setBrouillonTexte] = useState<string | null>(null);
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreur, setErreur] = useState<string | undefined>();
  const [pendingSoumission, startSoumission] = useTransition();

  const nombreRepondus = questions.filter((q) => estRepondu(reponses[q.elementId])).length;
  const progression = questions.length > 0 ? Math.round((nombreRepondus / questions.length) * 100) : 0;
  const question = questions[courante];
  const domaines = useMemo(() => {
    const liste: { id: string; nom: string; premiere: number; total: number }[] = [];
    for (const q of questions) {
      const d = liste.find((x) => x.id === q.domaineId);
      if (d) d.total++;
      else liste.push({ id: q.domaineId, nom: q.domaineNom, premiere: q.index, total: 1 });
    }
    return liste;
  }, [questions]);

  function aller(index: number) {
    setBrouillonTexte(null);
    setErreur(undefined);
    setCourante(Math.max(0, Math.min(index, questions.length)));
  }

  async function repondre(valeur: ValeurReponse, avancer: boolean) {
    if (!question) return;
    setReponses((prev) => ({ ...prev, [question.elementId]: valeur }));
    setEnregistrement(true);
    const resultat = await enregistrerReponseAction(session.id, question.elementId, valeur);
    setEnregistrement(false);
    if (!resultat.succes) {
      setErreur(resultat.erreur);
      return;
    }
    if (avancer) aller(courante + 1);
  }

  function soumettre() {
    startSoumission(async () => {
      const resultat = await soumettreSessionAction(session.id);
      if (resultat?.erreur) setErreur(resultat.erreur);
    });
  }

  const sansReponse = questions.filter((q) => !estRepondu(reponses[q.elementId]));

  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-5 py-10 sm:px-8">
      {/* §6.2 — plan de navigation latéral */}
      <aside className="hidden w-60 flex-shrink-0 lg:block">
        <nav className="sticky top-24 flex flex-col gap-1">
          {domaines.map((d) => {
            const repondus = questions.filter((q) => q.domaineId === d.id && estRepondu(reponses[q.elementId])).length;
            const actif = question?.domaineId === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => aller(d.premiere)}
                className={`flex items-center justify-between gap-2 rounded-[var(--radius-md)] px-3 py-2 text-left text-sm transition-colors ${
                  actif ? "bg-primary-soft font-medium text-primary" : "text-text-muted hover:bg-bg-subtle hover:text-text"
                }`}
              >
                <span className="min-w-0 truncate">{d.nom}</span>
                <span className="shrink-0 text-xs tabular-nums">
                  {repondus}/{d.total}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => aller(questions.length)}
            className={`mt-2 rounded-[var(--radius-md)] px-3 py-2 text-left text-sm transition-colors ${
              courante === questions.length ? "bg-primary-soft font-medium text-primary" : "text-text-muted hover:bg-bg-subtle"
            }`}
          >
            Récapitulatif et soumission
          </button>
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        {/* §6.2 — progression visible à tout moment */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-text">{session.grille.nom}</span>
            <span className="text-text-muted tabular-nums">
              {nombreRepondus} / {questions.length} répondues
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
            <motion.div className="h-full rounded-full bg-primary" animate={{ width: `${progression}%` }} transition={{ duration: 0.3 }} />
          </div>
        </div>

        {question ? (
          <div key={question.elementId} className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 sm:p-8">
            <p className="text-xs font-medium uppercase tracking-wide text-text-faint">
              Question {courante + 1} sur {questions.length} · {question.domaineNom}
            </p>
            <p className="mt-3 text-xs text-text-muted">
              Norme {question.normeCode} — {question.normeLibelle}
            </p>
            <p className="mt-1 text-sm font-medium text-text">
              Critère {question.critereCode} — {question.critereLibelle}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-bg-subtle px-2.5 py-0.5 text-xs font-medium text-text-muted">
                {LIBELLES_TYPE_ELEMENT[question.typeElement]}
              </span>
              {!question.entreDansScore && (
                <span className="rounded-full bg-bg-subtle px-2.5 py-0.5 text-xs text-text-faint">N&apos;entre pas dans le score</span>
              )}
            </div>
            <h2 className="mt-3 font-display text-xl font-semibold text-text">{question.libelle}</h2>

            <div className="mt-6">
              {question.typeReponse === "OUI_NON" && (
                <div className="flex gap-3">
                  {[
                    { valeur: true, label: "Oui" },
                    { valeur: false, label: "Non" },
                  ].map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      disabled={enregistrement}
                      onClick={() => repondre(option.valeur, true)}
                      className={`min-w-28 rounded-[var(--radius-md)] px-6 py-3 text-sm font-semibold transition-colors disabled:opacity-60 ${
                        reponses[question.elementId] === option.valeur
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-bg text-text hover:border-primary/40"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}

              {question.typeReponse === "CHOIX" && question.optionsChoix && (
                <select
                  value={(reponses[question.elementId] as string) ?? ""}
                  onChange={(e) => repondre(e.target.value, false)}
                  className="w-full max-w-md rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2.5 text-sm text-text"
                >
                  <option value="">Sélectionner…</option>
                  {question.optionsChoix.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}

              {question.typeReponse === "TEXTE" && (
                <textarea
                  rows={3}
                  value={brouillonTexte ?? ((reponses[question.elementId] as string) ?? "")}
                  onChange={(e) => setBrouillonTexte(e.target.value)}
                  // Enregistré à la sortie du champ, pas à chaque frappe.
                  onBlur={() => {
                    if (brouillonTexte !== null && brouillonTexte !== reponses[question.elementId]) {
                      void repondre(brouillonTexte, false);
                    }
                  }}
                  className="w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2.5 text-sm text-text"
                />
              )}
            </div>

            {enregistrement && <p className="mt-3 text-xs text-text-faint">Enregistrement…</p>}
            {erreur && <p className="mt-3 text-sm text-danger">{erreur}</p>}

            <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
              <button
                type="button"
                onClick={() => aller(courante - 1)}
                disabled={courante === 0}
                className="rounded-[var(--radius-md)] border border-border px-4 py-2 text-sm font-medium text-text disabled:opacity-40"
              >
                Précédente
              </button>
              <button
                type="button"
                onClick={() => aller(courante + 1)}
                className="rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
              >
                {courante === questions.length - 1 ? "Récapitulatif" : "Suivante"}
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 sm:p-8">
            <h2 className="font-display text-xl font-semibold text-text">Récapitulatif</h2>
            <p className="mt-2 text-sm text-text-muted">
              {nombreRepondus} question{nombreRepondus > 1 ? "s" : ""} répondue{nombreRepondus > 1 ? "s" : ""} sur {questions.length}.
              Une fois soumise, l&apos;évaluation est définitive et ne peut plus être modifiée.
            </p>
            {sansReponse.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-warning">
                  {sansReponse.length} question{sansReponse.length > 1 ? "s" : ""} sans réponse (comptée{sansReponse.length > 1 ? "s" : ""} comme non validée
                  {sansReponse.length > 1 ? "s" : ""} si ce sont des documents à examiner) :
                </p>
                <ul className="mt-2 flex max-h-56 flex-col gap-1 overflow-auto text-sm">
                  {sansReponse.map((q) => (
                    <li key={q.elementId}>
                      <button type="button" onClick={() => aller(q.index)} className="text-left text-primary hover:underline">
                        {q.critereCode} — {q.libelle}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {erreur && <p className="mt-4 text-sm text-danger">{erreur}</p>}
            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => aller(questions.length - 1)}
                className="rounded-[var(--radius-md)] border border-border px-4 py-2 text-sm font-medium text-text"
              >
                Revenir aux questions
              </button>
              <button
                type="button"
                onClick={soumettre}
                disabled={pendingSoumission}
                className="rounded-[var(--radius-md)] bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
              >
                {pendingSoumission ? "Soumission…" : "Soumettre l'évaluation"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
