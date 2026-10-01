import type { Metadata } from "next";
import { apiFetchJson, silencieux } from "@/lib/api-server";
import { Reveal } from "@/components/motion/reveal";
import { Card, CardHeader, StatCard } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Repartition, type TonRepartition } from "@/components/ui/repartition";
import { IconChecklist, IconGraduationCap, IconOrganisation, IconShieldAlert, IconUsers } from "@/components/icons";
import type { ActivitePlateforme, AnalyticsPlateforme } from "@/lib/types";
import { ActiviteChart } from "@/components/admin/activite-chart";
import { formaterDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Administration · Analytics",
  robots: { index: false, follow: false },
};

// Transforme une répartition { cle: nombre } de l'API en lignes affichables,
// dans l'ordre des libellés fournis (clés inconnues ajoutées à la fin).
function lignes(
  donnees: Record<string, number>,
  libelles: Record<string, string>,
  tons: Record<string, TonRepartition> = {},
  tonDefaut: TonRepartition = "primary",
) {
  const cles = [...Object.keys(libelles), ...Object.keys(donnees).filter((c) => !(c in libelles))];
  return cles
    .filter((c) => c in donnees)
    .map((c) => ({ cle: c, label: libelles[c] ?? c, valeur: donnees[c], ton: tons[c] ?? tonDefaut }));
}

const STATUTS_MODULE: Record<string, string> = { ESSAI: "Essai", ACTIF: "Actif", EXPIRE: "Expiré", SUSPENDU: "Suspendu" };

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ debut?: string; fin?: string }>;
}) {
  const { debut, fin } = await searchParams;
  const filtre = new URLSearchParams();
  if (debut) filtre.set("debut", debut);
  if (fin) filtre.set("fin", fin);
  const [a, activite] = await Promise.all([
    silencieux(apiFetchJson<AnalyticsPlateforme>("/analytics"), null),
    silencieux(apiFetchJson<ActivitePlateforme>(`/analytics/activite?${filtre.toString()}`), null),
  ]);

  return (
    <div>
      <Reveal>
        <PageHeader
          surtitre="Alertes & analyse"
          titre="Analytics"
          description="Indicateurs de la plateforme calculés en temps réel. Seules des données agrégées sont présentées (établissements, rôles, statuts), sans aucune information sur les patients ni sur le contenu des événements."
        />
      </Reveal>

      {/* §12.6 — activité par période et évolution dans le temps */}
      {activite && (
        <Reveal delay={0.03} className="mb-6">
          <Card>
            <CardHeader
              titre="Activité sur la période"
              description={`Du ${formaterDate(activite.periode.debut)} au ${formaterDate(activite.periode.fin)}`}
              action={
                <form method="get" className="flex flex-wrap items-end gap-2 text-xs">
                  <label className="flex flex-col gap-1">
                    Du
                    <input type="date" name="debut" defaultValue={debut} className="rounded-[var(--radius-md)] border border-border bg-surface px-2 py-1" />
                  </label>
                  <label className="flex flex-col gap-1">
                    Au
                    <input type="date" name="fin" defaultValue={fin} className="rounded-[var(--radius-md)] border border-border bg-surface px-2 py-1" />
                  </label>
                  <button type="submit" className="rounded-[var(--radius-md)] border border-border px-3 py-1.5 font-medium hover:border-primary/40">
                    Appliquer
                  </button>
                </form>
              }
            />
            <div className="mb-4 grid gap-3 sm:grid-cols-5">
              {[
                ["Établissements inscrits", activite.totaux.etablissementsInscrits],
                ["Évaluations soumises", activite.totaux.evaluationsSoumises],
                ["Alertes NEWS", activite.totaux.alertesNews],
                ["EI déclarés", activite.totaux.evenementsIndesirables],
                ["Réservations", activite.totaux.reservations],
              ].map(([label, valeur]) => (
                <div key={label} className="rounded-[var(--radius-md)] border border-border px-3 py-2">
                  <p className="text-xs text-text-muted">{label}</p>
                  <p className="font-display text-lg font-bold tabular-nums">{valeur}</p>
                </div>
              ))}
            </div>
            <ActiviteChart activite={activite} />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(["NEWS", "EI"] as const).map((m) => (
                <div key={m} className="text-sm">
                  <p className="font-medium text-text">Établissements par statut · {m === "NEWS" ? "Score NEWS" : "Événements indésirables"}</p>
                  <p className="text-text-muted">
                    {Object.entries(activite.modulesParStatut[m] ?? {})
                      .map(([statut, n]) => `${STATUTS_MODULE[statut] ?? statut} : ${n}`)
                      .join(" · ") || "Aucun établissement"}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </Reveal>
      )}

      {!a ? (
        <p className="text-sm text-text-muted">Analytics indisponibles pour l&apos;instant.</p>
      ) : (
        <>
          <Reveal delay={0.05} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Établissements actifs"
              valeur={`${a.etablissements.actifs} / ${a.etablissements.total}`}
              sousTexte="actifs sur le total"
              icone={IconOrganisation}
            />
            <StatCard
              label="Utilisateurs actifs"
              valeur={`${a.utilisateurs.actifs} / ${a.utilisateurs.total}`}
              sousTexte="actifs sur le total"
              icone={IconUsers}
              ton="info"
            />
            <StatCard
              label="Formations actives"
              valeur={`${a.formations.actives} / ${a.formations.total}`}
              sousTexte="actives sur le total"
              icone={IconGraduationCap}
              ton="accent"
            />
            <StatCard
              label="Taux de clôture des EI"
              valeur={`${a.evenementsIndesirables.tauxClotureePct}%`}
              sousTexte={
                a.evenementsIndesirables.delaiMoyenClotureJours !== null
                  ? `délai moyen ${a.evenementsIndesirables.delaiMoyenClotureJours} j · ${a.evenementsIndesirables.total} au total`
                  : "aucune clôture pour l'instant"
              }
              icone={IconShieldAlert}
              ton="warning"
            />
          </Reveal>

          <div className="mt-6 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            <Reveal delay={0.1}>
              <Card className="h-full">
                <CardHeader titre="Utilisateurs par rôle" description="Un utilisateur peut cumuler plusieurs rôles" />
                <Repartition
                  pourcentage={false}
                  elements={lignes(
                    a.utilisateurs.parRole,
                    {
                      RESPONSABLE_COMPTE: "Responsable de compte",
                      RESP_QUALITE: "Responsable qualité",
                      PERSONNEL_SOIGNANT: "Personnel soignant",
                      GESTIONNAIRE_FORMATION: "Gestionnaire formation",
                      ADMIN_PLATEFORME: "Admin plateforme",
                    },
                    {},
                    "info",
                  )}
                />
              </Card>
            </Reveal>
            <Reveal delay={0.15}>
              <Card className="h-full">
                <CardHeader titre="Établissements par type" />
                <Repartition elements={lignes(a.etablissements.parType, { EH: "Hôpital (EH)", ESPC: "ESPC" })} />
              </Card>
            </Reveal>
            <Reveal delay={0.2}>
              <Card className="h-full">
                <CardHeader titre="Réservations par statut" />
                <Repartition
                  elements={lignes(
                    a.reservationsParStatut,
                    {
                      ATTENTE_PAIEMENT: "En attente de paiement",
                      PAYEE: "Payée",
                      CONFIRMEE: "Confirmée",
                      REALISEE: "Réalisée",
                      ANNULEE: "Annulée",
                    },
                    { ATTENTE_PAIEMENT: "warning", PAYEE: "primary", CONFIRMEE: "success", REALISEE: "info", ANNULEE: "neutral" },
                  )}
                />
              </Card>
            </Reveal>
            <Reveal delay={0.25}>
              <Card className="h-full">
                <CardHeader titre="Événements indésirables par gravité" />
                <Repartition
                  vide="Aucun événement pour l'instant."
                  elements={Object.entries(a.evenementsIndesirables.parGravite)
                    .sort((x, y) => y[1] - x[1])
                    .map(([libelle, n]) => ({ cle: libelle, label: libelle, valeur: n, ton: "warning" as const }))}
                />
              </Card>
            </Reveal>
            <Reveal delay={0.3}>
              <Card className="h-full">
                <CardHeader titre="Mesures NEWS par niveau de risque" />
                <Repartition
                  vide="Aucune mesure NEWS pour l'instant."
                  elements={lignes(
                    a.mesuresNewsParNiveau,
                    { ELEVE: "Élevé", MOYEN: "Moyen", BAS: "Bas" },
                    { ELEVE: "danger", MOYEN: "warning", BAS: "success" },
                  )}
                />
              </Card>
            </Reveal>
            <Reveal delay={0.35}>
              <Card className="h-full">
                <CardHeader
                  titre="Score moyen d'auto-évaluation"
                  description={`${a.autoEvaluation.nombreSessionsSoumises} session(s) soumise(s) au total`}
                />
                {Object.keys(a.autoEvaluation.scoreMoyenParType).length === 0 ? (
                  <p className="py-6 text-center text-sm text-text-faint">Aucune session soumise pour l&apos;instant.</p>
                ) : (
                  <ul className="flex flex-col gap-4">
                    {Object.entries(a.autoEvaluation.scoreMoyenParType).map(([type, score]) => (
                      <li key={type}>
                        <div className="flex items-baseline justify-between text-sm">
                          <span className="flex items-center gap-2 text-text-muted">
                            <IconChecklist width={15} height={15} className="text-text-faint" />
                            {type === "EH" ? "Hôpital (EH)" : type === "ESPC" ? "ESPC" : type}
                          </span>
                          <span className="font-display text-lg font-bold text-text tabular-nums">{score}%</span>
                        </div>
                        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-bg-subtle">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, score))}%` }} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </Reveal>
          </div>
        </>
      )}
    </div>
  );
}
