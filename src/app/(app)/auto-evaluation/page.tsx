import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { apiFetchJson, silencieux } from "@/lib/api-server";
import { formaterDate } from "@/lib/format";
import { Reveal } from "@/components/motion/reveal";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { IconArrowRight, IconChecklist } from "@/components/icons";
import { DemarrerSessionButton } from "@/components/auto-evaluation/demarrer-session-button";
import { HistoriqueTable } from "@/components/auto-evaluation/historique-table";
import type { Grille, Organisation, SessionEvaluationResume } from "@/lib/types";

export const metadata: Metadata = {
  title: "Auto-évaluation",
  robots: { index: false, follow: false },
};

function TitreSection({ children, compteur }: { children: ReactNode; compteur?: number }) {
  return (
    <h2 className="mb-3 flex items-center gap-2 font-display text-base font-semibold text-text">
      {children}
      {compteur !== undefined && (
        <span className="rounded-full bg-bg-subtle px-2 py-0.5 text-xs font-medium text-text-muted tabular-nums">{compteur}</span>
      )}
    </h2>
  );
}

export default async function AutoEvaluationPage() {
  const organisation = await silencieux(apiFetchJson<Organisation | null>("/organisations/me"), null);
  const [grilles, sessions] = await Promise.all([
    silencieux(apiFetchJson<Grille[]>(`/grilles${organisation ? `?type=${organisation.type}` : ""}`), []),
    silencieux(apiFetchJson<SessionEvaluationResume[]>("/sessions-evaluation"), []),
  ]);

  const enCours = sessions.filter((s) => s.statut === "EN_COURS");
  const soumises = sessions.filter((s) => s.statut === "SOUMISE");

  return (
    <PageContainer>
      <Reveal>
        <PageHeader
          surtitre="Module gratuit"
          titre="Auto-évaluation"
          description={`Grille${organisation ? ` ${organisation.type}` : ""}. Répondez critère par critère : le score est calculé automatiquement à la soumission.`}
        />
      </Reveal>

      {enCours.length > 0 && (
        <Reveal delay={0.05} className="mb-10">
          <TitreSection compteur={enCours.length}>Sessions en cours</TitreSection>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {enCours.map((s) => (
              <Link
                key={s.id}
                href={`/auto-evaluation/${s.id}`}
                className="group flex flex-col rounded-[var(--radius-lg)] border border-primary/25 bg-surface p-5 shadow-[var(--shadow-card)] transition-[border-color,box-shadow] hover:border-primary/50 hover:shadow-[var(--shadow-soft)]"
              >
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  En cours
                </span>
                <p className="mt-3 font-medium text-text">{s.grille.nom}</p>
                <p className="mt-0.5 text-xs text-text-muted">Démarrée le {formaterDate(s.dateDebut)}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  Continuer
                  <IconArrowRight width={15} height={15} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </Reveal>
      )}

      <Reveal delay={0.1} className="mb-10">
        <TitreSection compteur={grilles.length}>Démarrer une évaluation</TitreSection>
        {grilles.length === 0 ? (
          <p className="rounded-[var(--radius-lg)] border border-dashed border-border bg-surface px-5 py-8 text-center text-sm text-text-muted">
            Aucune grille disponible pour votre type d&apos;établissement pour le moment.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {grilles.map((grille) => (
              <div
                key={grille.id}
                className="flex flex-col rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-primary-soft text-primary">
                  <IconChecklist width={20} height={20} />
                </span>
                <p className="mt-4 font-medium text-text">{grille.nom}</p>
                <p className="mt-0.5 text-xs text-text-muted">Version {grille.version}</p>
                <div className="mt-5">
                  <DemarrerSessionButton grilleId={grille.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Reveal>

      {soumises.length > 0 && (
        <Reveal delay={0.15}>
          <TitreSection compteur={soumises.length}>Historique</TitreSection>
          <HistoriqueTable sessions={soumises} />
        </Reveal>
      )}
    </PageContainer>
  );
}
