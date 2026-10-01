import { notFound } from "next/navigation";
import { apiFetchJson, ApiError, silencieux } from "@/lib/api-server";
import { formaterDate, formaterDateCourte, formaterDateHeure } from "@/lib/format";
import { Reveal } from "@/components/motion/reveal";
import { Card, CardHeader, StatCard } from "@/components/ui/card";
import { ListeProprietes } from "@/components/ui/fiche";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { RisqueBadge, StatutPatientBadge } from "@/components/news/badges";
import { MesureForm } from "@/components/news/mesure-form";
import { CloturerPatientButton } from "@/components/news/cloturer-patient-button";
import { MesuresTable } from "@/components/news/mesures-table";
import { ScoreNewsChart } from "@/components/news/score-news-chart";
import { IconCalendar, IconFileText, IconHistory, IconVitals } from "@/components/icons";
import type { MesureNews, ParametrageNews, Patient } from "@/lib/types";
import { libellePatient } from "@/lib/patient-libelle";

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let patient: Patient;
  let mesures: MesureNews[];
  let parametrage: ParametrageNews | null = null;
  try {
    [patient, mesures] = await Promise.all([
      apiFetchJson<Patient>(`/patients/${id}`),
      apiFetchJson<MesureNews[]>(`/patients/${id}/mesures`),
    ]);
    parametrage = await silencieux(apiFetchJson<ParametrageNews>("/patients/parametrage-news"), null);
  } catch (erreur) {
    if (erreur instanceof ApiError && erreur.status === 404) notFound();
    throw erreur;
  }

  // L'API renvoie les mesures dans l'ordre chronologique : la dernière est la plus récente.
  const derniere = mesures.at(-1);
  const points = mesures.map((m) => ({ date: formaterDateCourte(m.dateMesure), score: m.scoreTotal }));

  return (
    <PageContainer>
      <Reveal>
        <PageHeader
          filAriane={[{ label: "Surveillance clinique", href: "/news" }, { label: libellePatient(patient) }]}
          surtitre="Fiche patient"
          titre={
            <span className="inline-flex flex-wrap items-center gap-3">
              {libellePatient(patient)}
              <StatutPatientBadge statut={patient.statut} />
              {derniere && <RisqueBadge niveau={derniere.niveauRisque} />}
            </span>
          }
          description={patient.service ? `Service : ${patient.service.nom}` : undefined}
          actions={
            <div className="flex flex-wrap gap-2">
              {/* §7.4 — fiche de surveillance imprimable / exportable. */}
              <a
                href={`/news/${patient.id}/fiche`}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-surface px-4 py-2 text-sm font-medium text-text transition-colors hover:border-primary/40"
              >
                <IconFileText width={16} height={16} />
                Fiche de surveillance
              </a>
              {patient.statut === "HOSPITALISE" && <CloturerPatientButton patientId={patient.id} />}
            </div>
          }
        />
      </Reveal>

      <Reveal delay={0.05} className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Dernier score NEWS"
          valeur={derniere ? `${derniere.scoreTotal}` : "Aucun"}
          sousTexte={derniere ? formaterDateHeure(derniere.dateMesure) : "aucune mesure enregistrée"}
          icone={IconVitals}
          ton={
            !derniere
              ? "neutral"
              : derniere.niveauRisque === "ELEVE"
                ? "danger"
                : derniere.niveauRisque === "MOYEN"
                  ? "warning"
                  : "success"
          }
        />
        <StatCard
          label="Surveillance suggérée"
          valeur={derniere?.frequenceSurveillance ?? "—"}
          sousTexte={derniere ? `${mesures.length} mesure${mesures.length > 1 ? "s" : ""} enregistrée${mesures.length > 1 ? "s" : ""}` : "aucune mesure enregistrée"}
          icone={IconHistory}
          ton="info"
        />
        <StatCard
          label="Admission"
          valeur={formaterDateCourte(patient.dateAdmission)}
          sousTexte={patient.dateSortie ? `sortie le ${formaterDate(patient.dateSortie)}` : "hospitalisation en cours"}
          icone={IconCalendar}
          ton="neutral"
        />
      </Reveal>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-6 xl:col-span-2">
          {mesures.length > 0 && (
            <Reveal delay={0.1}>
              <Card>
                <CardHeader titre="Évolution du score NEWS" description="Une valeur par mesure" />
                <ScoreNewsChart points={points} />
              </Card>
            </Reveal>
          )}
          <Reveal delay={0.15}>
            <h2 className="mb-3 font-display text-base font-semibold text-text">Historique des mesures</h2>
            <MesuresTable mesures={mesures} patientId={patient.id} />
          </Reveal>
        </div>

        <div className="flex flex-col gap-6">
          {patient.statut === "HOSPITALISE" && (
            <Reveal delay={0.1}>
              <Card className="border-primary/25">
                <CardHeader titre="Nouvelle mesure" description="Le score est calculé automatiquement" />
                <MesureForm patientId={patient.id} />
                {parametrage && (
                  <div className="mt-5 border-t border-border pt-4 text-xs text-text-muted">
                    <p className="font-medium text-text">Niveaux de risque et surveillance suggérée</p>
                    <ul className="mt-1.5 flex flex-col gap-1">
                      <li>
                        Faible (score 0 à {parametrage.seuils.moyen - 1}) : {parametrage.frequences.BAS}
                      </li>
                      <li>
                        Moyen (score {parametrage.seuils.moyen} à {parametrage.seuils.eleve - 1}, ou un paramètre à 3) :{" "}
                        {parametrage.frequences.MOYEN}
                      </li>
                      <li>
                        Élevé (score {parametrage.seuils.eleve} ou plus) : {parametrage.frequences.ELEVE}
                      </li>
                    </ul>
                  </div>
                )}
              </Card>
            </Reveal>
          )}
          <Reveal delay={0.15}>
            <Card>
              <CardHeader titre="Informations" />
              <ListeProprietes
                elements={[
                  { label: "Identifiant interne", valeur: patient.identifiantInterne },
                  { label: "Service", valeur: patient.service?.nom ?? null, vide: "Non précisé" },
                  { label: "Numéro de lit", valeur: patient.numeroLit, vide: "Non renseigné" },
                  { label: "Admission", valeur: formaterDate(patient.dateAdmission) },
                  {
                    label: "Sortie",
                    valeur: patient.dateSortie ? formaterDate(patient.dateSortie) : null,
                    vide: "Hospitalisation en cours",
                  },
                ]}
              />
            </Card>
          </Reveal>
        </div>
      </div>
    </PageContainer>
  );
}
