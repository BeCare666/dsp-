import { notFound } from "next/navigation";
import Link from "next/link";
import { apiFetchJson, ApiError } from "@/lib/api-server";
import { formaterDateHeure } from "@/lib/format";
import { Reveal } from "@/components/motion/reveal";
import { Card, CardHeader } from "@/components/ui/card";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { RisqueBadge, StatutAlerteBadge } from "@/components/news/badges";
import { InterventionForm } from "@/components/news/intervention-form";
import { StatutAlerteButtons } from "@/components/news/statut-alerte-buttons";
import type { Alerte } from "@/lib/types";
import { libellePatient } from "@/lib/patient-libelle";

function Constante({ label, valeur, unite }: { label: string; valeur: string | number; unite?: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-border bg-bg-subtle/40 px-4 py-3">
      <p className="text-xs font-medium text-text-faint">{label}</p>
      <p className="mt-1 font-display text-lg font-bold text-text tabular-nums">
        {valeur}
        {unite && <span className="ml-1 text-xs font-medium text-text-faint">{unite}</span>}
      </p>
    </div>
  );
}

export default async function AlerteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let alerte: Alerte;
  try {
    alerte = await apiFetchJson<Alerte>(`/alertes/${id}`);
  } catch (erreur) {
    if (erreur instanceof ApiError && erreur.status === 404) notFound();
    throw erreur;
  }

  const interventions = alerte.interventions ?? [];
  const nomPatient = alerte.patient ? libellePatient(alerte.patient) : "Alerte";

  return (
    <PageContainer>
      <Reveal>
        <PageHeader
          filAriane={[
            { label: "Surveillance clinique", href: "/news" },
            { label: "Alertes", href: "/news/alertes" },
            { label: nomPatient },
          ]}
          surtitre="Alerte clinique"
          titre={
            <span className="inline-flex flex-wrap items-center gap-3">
              {alerte.patient ? (
                <Link href={`/news/${alerte.patient.id}`} className="hover:text-primary">
                  {nomPatient}
                </Link>
              ) : (
                nomPatient
              )}
              <RisqueBadge niveau={alerte.niveauRisque} />
              <StatutAlerteBadge statut={alerte.statut} />
            </span>
          }
          description={`Déclenchée le ${formaterDateHeure(alerte.createdAt)}`}
        />
      </Reveal>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-6 xl:col-span-2">
          {alerte.mesure && (
            <Reveal delay={0.05}>
              <Card>
                <CardHeader
                  titre="Mesure déclencheuse"
                  description={formaterDateHeure(alerte.mesure.dateMesure)}
                  action={
                    <span className="text-right">
                      <span className="block font-display text-3xl font-bold leading-none text-text tabular-nums">
                        {alerte.mesure.scoreTotal}
                      </span>
                      <span className="text-xs text-text-faint">score NEWS</span>
                    </span>
                  }
                />
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <Constante label="Fréquence respiratoire" valeur={alerte.mesure.frequenceRespiratoire} unite="/min" />
                  <Constante label="SpO2" valeur={alerte.mesure.saturationOxygene} unite="%" />
                  <Constante label="Température" valeur={alerte.mesure.temperature} unite="°C" />
                  <Constante label="PA systolique" valeur={alerte.mesure.pressionArterielleSystolique} unite="mmHg" />
                  <Constante label="Fréquence cardiaque" valeur={alerte.mesure.frequenceCardiaque} unite="/min" />
                  <Constante label="Oxygène" valeur={alerte.mesure.oxygenoSupplementation ? "Sous O2" : "Air ambiant"} />
                </div>
              </Card>
            </Reveal>
          )}

          <Reveal delay={0.1}>
            <Card>
              <CardHeader
                titre={
                  <>
                    Interventions
                    <span className="ml-2 rounded-full bg-bg-subtle px-2 py-0.5 text-xs font-medium text-text-muted tabular-nums">
                      {interventions.length}
                    </span>
                  </>
                }
              />
              {interventions.length === 0 ? (
                <p className="rounded-[var(--radius-md)] border border-dashed border-border px-4 py-5 text-center text-sm text-text-faint">
                  Aucune intervention enregistrée pour l&apos;instant.
                </p>
              ) : (
                <ol className="relative flex flex-col gap-4 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-px before:bg-border">
                  {interventions.map((i) => (
                    <li key={i.id} className="relative pl-6">
                      <span className="absolute left-0 top-1.5 h-[11px] w-[11px] rounded-full border-2 border-surface bg-primary" />
                      <p className="text-sm leading-6 text-text">{i.note}</p>
                      <p className="mt-0.5 text-xs text-text-faint">{formaterDateHeure(i.createdAt)}</p>
                    </li>
                  ))}
                </ol>
              )}
              {alerte.statut !== "CLOTUREE" && (
                <div className="mt-5 border-t border-border pt-5">
                  <InterventionForm alerteId={alerte.id} />
                </div>
              )}
            </Card>
          </Reveal>
        </div>

        {alerte.statut !== "CLOTUREE" && (
          <Reveal delay={0.1}>
            <Card>
              <CardHeader titre="Prise en charge" description="Faire évoluer le statut de l'alerte" />
              <StatutAlerteButtons alerteId={alerte.id} statutActuel={alerte.statut} />
            </Card>
          </Reveal>
        )}
      </div>
    </PageContainer>
  );
}
