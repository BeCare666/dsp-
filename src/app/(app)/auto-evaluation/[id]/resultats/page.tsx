import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { apiFetchJson, ApiError } from "@/lib/api-server";
import Link from "next/link";
import { formaterDate, formaterDateHeure } from "@/lib/format";
import { RapportPdf } from "@/components/auto-evaluation/rapport-pdf";
import { Reveal } from "@/components/motion/reveal";
import { Card, CardHeader, StatCard } from "@/components/ui/card";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { IconAlertTriangle, IconCheckCircle, IconChecklist } from "@/components/icons";
import type { ResultatScore, SessionEvaluation } from "@/lib/types";

export const metadata: Metadata = {
  title: "Résultats de l'auto-évaluation",
  robots: { index: false, follow: false },
};

export default async function ResultatsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let session: SessionEvaluation;
  let resultats: ResultatScore;
  try {
    [session, resultats] = await Promise.all([
      apiFetchJson<SessionEvaluation>(`/sessions-evaluation/${id}`),
      apiFetchJson<ResultatScore>(`/sessions-evaluation/${id}/resultats`),
    ]);
  } catch (erreur) {
    if (erreur instanceof ApiError && (erreur.status === 404 || erreur.status === 409)) {
      redirect("/auto-evaluation");
    }
    throw erreur;
  }

  const criteresValides = resultats.parDomaine.reduce((s, d) => s + d.criteresValides, 0);
  const criteresTotal = resultats.parDomaine.reduce((s, d) => s + d.criteresTotal, 0);

  // Regroupement des écarts par domaine (ordre des domaines conservé).
  const ecartsParDomaine = new Map<string, typeof resultats.criteresNonValides>();
  for (const c of resultats.criteresNonValides) {
    ecartsParDomaine.set(c.domaineNom, [...(ecartsParDomaine.get(c.domaineNom) ?? []), c]);
  }

  return (
    <PageContainer>
      <Reveal>
        <PageHeader
          filAriane={[{ label: "Auto-évaluation", href: "/auto-evaluation" }, { label: "Résultats" }]}
          surtitre="Résultats de l'auto-évaluation"
          titre={session.grille.nom}
          description={session.dateSoumission ? `Soumise le ${formaterDateHeure(session.dateSoumission)}` : undefined}
          actions={<RapportPdf sessionId={session.id} rapport={resultats.rapport ?? null} />}
        />
      </Reveal>

      <Reveal delay={0.05} className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Score global" valeur={`${resultats.scoreGlobal}%`} sousTexte="calculé à la soumission" icone={IconChecklist} />
        <StatCard
          label="Critères validés"
          valeur={`${criteresValides} / ${criteresTotal}`}
          sousTexte="tous domaines confondus"
          icone={IconCheckCircle}
          ton="success"
        />
        <StatCard
          label="Écarts à corriger"
          valeur={`${resultats.criteresNonValides.length}`}
          sousTexte="critères non validés"
          icone={IconAlertTriangle}
          ton={resultats.criteresNonValides.length > 0 ? "warning" : "neutral"}
        />
      </Reveal>

      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <Reveal delay={0.1} className="xl:col-span-2">
          <Card className="h-full">
            <CardHeader titre="Score par domaine" />
            <ul className="flex flex-col gap-4">
              {resultats.parDomaine.map((domaine) => (
                <li key={domaine.domaineId}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="min-w-0 font-medium text-text">{domaine.nom}</span>
                    <span className="shrink-0 font-display font-bold text-text tabular-nums">{domaine.scorePct}%</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-bg-subtle">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${domaine.scorePct}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-text-faint tabular-nums">
                    {domaine.criteresValides} / {domaine.criteresTotal} critères
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>

        <Reveal delay={0.15} className="xl:col-span-3">
          <Card className="h-full">
            <CardHeader
              titre="Écarts à corriger"
              description="Critères non validés : au moins un document à examiner manquant"
            />
            {resultats.criteresNonValides.length === 0 ? (
              <div className="flex items-center gap-3 rounded-[var(--radius-md)] bg-success-soft/60 px-4 py-4 text-sm text-success">
                <IconCheckCircle width={18} height={18} />
                Tous les critères sont validés.
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {[...ecartsParDomaine.entries()].map(([domaine, criteres]) => (
                  <div key={domaine}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-faint">
                      {domaine} · {criteres.length}
                    </p>
                    <ul className="divide-y divide-border overflow-hidden rounded-[var(--radius-md)] border border-border">
                      {criteres.map((critere) => {
                        const exemples = (resultats.eiLies ?? []).filter((ei) => ei.critereId === critere.critereId);
                        return (
                          <li key={critere.critereId} className="flex flex-col gap-2 px-4 py-3 text-sm">
                            <div className="flex gap-3">
                              <span className="shrink-0 rounded-[var(--radius-sm)] bg-warning-soft px-1.5 py-0.5 font-mono text-xs font-medium text-warning">
                                {critere.code}
                              </span>
                              <span className="font-medium text-text">{critere.libelle}</span>
                            </div>
                            {/* §6.4 — documents non validés */}
                            {critere.documentsNonValides.length > 0 ? (
                              <ul className="ml-1 flex flex-col gap-0.5 text-text-muted">
                                {critere.documentsNonValides.map((d) => (
                                  <li key={d.elementMesurableId}>
                                    • {d.libelle}
                                    {d.reponse === "SANS_REPONSE" && <span className="text-text-faint"> (sans réponse)</span>}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-xs text-text-faint">Aucun document à examiner n&apos;est défini pour ce critère.</p>
                            )}
                            {/* §6.4 — recommandation synthétique */}
                            <p className="rounded-[var(--radius-md)] bg-bg-subtle px-3 py-2 text-xs text-text">
                              <span className="font-medium">Recommandation : </span>
                              {critere.recommandation ??
                                (critere.documentsNonValides.length > 0
                                  ? `mettre à disposition ${critere.documentsNonValides.map((d) => `« ${d.libelle} »`).join(", ")}.`
                                  : "aucune recommandation n'a été définie pour ce critère.")}
                            </p>
                            {/* §8.4 — exemples concrets d'écarts terrain */}
                            {exemples.length > 0 && (
                              <div className="text-xs text-text-muted">
                                <p className="font-medium text-text">Événements indésirables liés ({exemples.length})</p>
                                <ul className="mt-1 flex flex-col gap-0.5">
                                  {exemples.slice(0, 5).map((ei) => (
                                    <li key={ei.id}>
                                      <Link href={`/evenements-indesirables/${ei.id}`} className="text-primary hover:underline">
                                        {formaterDate(ei.dateSurvenue)} — {ei.description.slice(0, 120)}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Reveal>
      </div>
    </PageContainer>
  );
}
