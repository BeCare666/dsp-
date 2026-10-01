import type { Metadata } from "next";
import type { ComponentType, ReactNode, SVGProps } from "react";
import Link from "next/link";
import { apiFetchJson, silencieux } from "@/lib/api-server";
import { aRole, ROLES_TRAITEMENT_EI } from "@/lib/session";
import { formaterDate, formaterDateCourte, formaterIlYa } from "@/lib/format";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, StatCard } from "@/components/ui/card";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { RisqueBadge } from "@/components/news/badges";
import { EvolutionChart } from "@/components/auto-evaluation/evolution-chart";
import {
  IconAlertTriangle,
  IconArrowRight,
  IconCalendar,
  IconCheckCircle,
  IconChecklist,
  IconGraduationCap,
  IconShieldAlert,
  IconUsers,
  IconVitals,
} from "@/components/icons";
import { libellePatient } from "@/lib/patient-libelle";
import { StatutModuleBadge } from "@/components/abonnements/statut-module";
import type {
  AbonnementModule,
  Alerte,
  EvenementIndesirable,
  Organisation,
  Patient,
  SessionEvaluationResume,
} from "@/lib/types";

export const metadata: Metadata = {
  title: "Tableau de bord",
  robots: { index: false, follow: false },
};

interface PointEvolutionApi {
  id: string;
  dateSoumission: string | null;
  scoreGlobal: number | null;
  grille: { nom: string; version: number };
}

// §5 — statut du module avec jours restants, lien direct vers la souscription.
function StatutAbonnementBadge({ abonnement }: { abonnement: AbonnementModule | null }) {
  return <StatutModuleBadge abonnement={abonnement || null} />;
}

function LigneModule({
  href,
  icone: Icone,
  titre,
  description,
  badge,
}: {
  href: string;
  icone: ComponentType<SVGProps<SVGSVGElement>>;
  titre: string;
  description: string;
  badge: ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="group flex items-center gap-4 rounded-[var(--radius-md)] px-2 py-3 transition-colors hover:bg-bg-subtle/70"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary-soft text-primary">
          <Icone width={19} height={19} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-medium text-text">{titre}</span>
          <span className="block truncate text-xs text-text-muted">{description}</span>
        </span>
        <span className="shrink-0">{badge}</span>
      </Link>
    </li>
  );
}

const formateurJour = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

export default async function TableauDeBordPage() {
  const organisation = await silencieux(apiFetchJson<Organisation>("/organisations/me"), null);

  // Chaque source peut être refusée selon le rôle (ex. auto-évaluation réservée
  // aux responsables) ou le module (NEWS/EI non souscrit ou expiré) : `null`
  // signifie « non disponible », le bloc correspondant n'est alors pas affiché.
  const [abonnementNews, abonnementEi, sessions, evolution, alertesOuvertes, hospitalises, evenements, peutTraiterEi] =
    organisation
      ? await Promise.all([
          silencieux(apiFetchJson<AbonnementModule | null>("/abonnements/NEWS"), null),
          silencieux(apiFetchJson<AbonnementModule | null>("/abonnements/EI"), null),
          silencieux(apiFetchJson<SessionEvaluationResume[]>("/sessions-evaluation"), null),
          silencieux(apiFetchJson<PointEvolutionApi[]>("/sessions-evaluation/evolution"), null),
          silencieux(apiFetchJson<Alerte[]>("/alertes?statut=OUVERTE"), null),
          silencieux(apiFetchJson<Patient[]>("/patients?statut=HOSPITALISE"), null),
          silencieux(apiFetchJson<EvenementIndesirable[]>("/evenements-indesirables"), null),
          aRole(...ROLES_TRAITEMENT_EI),
        ])
      : [null, null, null, null, null, null, null, false];

  const maintenant = new Date();
  const peutGererAbonnements = await aRole("RESPONSABLE_COMPTE");

  if (!organisation) {
    return (
      <PageContainer largeur="detail">
        <Reveal>
          <PageHeader surtitre={formateurJour.format(maintenant)} titre="Bienvenue" description="Votre espace formations." />
        </Reveal>
        <Reveal delay={0.05}>
          <Card>
            <CardHeader titre="Formations" />
            <ul className="-mx-2 flex flex-col">
              <LigneModule
                href="/formations"
                icone={IconGraduationCap}
                titre="Catalogue"
                description="Formations proposées et réservation"
                badge={<Badge variant="primary">À l&apos;unité</Badge>}
              />
              <LigneModule
                href="/mes-reservations"
                icone={IconCalendar}
                titre="Mes réservations"
                description="Suivi de vos réservations et rendez-vous"
                badge={<IconArrowRight width={16} height={16} className="text-text-faint" />}
              />
            </ul>
          </Card>
        </Reveal>
      </PageContainer>
    );
  }

  const soumises = sessions?.filter((s) => s.statut === "SOUMISE") ?? [];
  const enCours = sessions?.filter((s) => s.statut === "EN_COURS") ?? [];
  const derniereSoumise = soumises.at(0);
  const eiNonClotures = evenements?.filter((e) => e.statut !== "CLOTURE") ?? [];
  const eiAQualifier = evenements?.filter((e) => e.statut === "DECLARE").length ?? 0;
  const eiGravesOuverts = evenements?.filter((e) => e.niveauGravite?.critique && e.statut !== "CLOTURE").length ?? 0;
  const points = (evolution ?? [])
    .filter((p) => p.dateSoumission && p.scoreGlobal !== null)
    .map((p) => ({ date: formaterDateCourte(p.dateSoumission!), score: p.scoreGlobal!, grille: p.grille.nom }));

  const aTraiter: { cle: string; contenu: ReactNode }[] = [];
  for (const a of (alertesOuvertes ?? []).slice(0, 4)) {
    aTraiter.push({
      cle: `alerte-${a.id}`,
      contenu: (
        <Link
          href={`/news/alertes/${a.id}`}
          className="group flex items-center gap-4 rounded-[var(--radius-md)] border border-border px-4 py-3 transition-colors hover:border-danger/30 hover:bg-danger-soft/30"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-danger-soft text-danger">
            <IconVitals width={19} height={19} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium text-text">
              Alerte NEWS · {libellePatient(a.patient)}
            </span>
            <span className="block text-xs text-text-muted">
              {a.mesure ? `Score ${a.mesure.scoreTotal} · ` : ""}
              {formaterIlYa(a.createdAt, maintenant)}
            </span>
          </span>
          <RisqueBadge niveau={a.niveauRisque} />
        </Link>
      ),
    });
  }
  if ((alertesOuvertes?.length ?? 0) > 4) {
    aTraiter.push({
      cle: "alertes-suite",
      contenu: (
        <Link href="/news/alertes?vue=ouvertes" className="block px-1 text-sm font-medium text-primary hover:underline">
          Voir les {alertesOuvertes!.length} alertes ouvertes
        </Link>
      ),
    });
  }
  const liensSynthese: { cle: string; href: string; icone: ComponentType<SVGProps<SVGSVGElement>>; ton: string; texte: string }[] = [];
  if (eiGravesOuverts > 0) {
    liensSynthese.push({
      cle: "ei-graves",
      href: "/evenements-indesirables",
      icone: IconShieldAlert,
      ton: "bg-danger-soft text-danger",
      texte: `${eiGravesOuverts} événement${eiGravesOuverts > 1 ? "s" : ""} indésirable${eiGravesOuverts > 1 ? "s" : ""} grave${eiGravesOuverts > 1 ? "s" : ""} non clôturé${eiGravesOuverts > 1 ? "s" : ""}`,
    });
  }
  if (peutTraiterEi && eiAQualifier > 0) {
    liensSynthese.push({
      cle: "ei-qualifier",
      href: "/evenements-indesirables?vue=a-qualifier",
      icone: IconAlertTriangle,
      ton: "bg-warning-soft text-warning",
      texte: `${eiAQualifier} événement${eiAQualifier > 1 ? "s" : ""} à qualifier`,
    });
  }
  for (const s of enCours) {
    liensSynthese.push({
      cle: `session-${s.id}`,
      href: `/auto-evaluation/${s.id}`,
      icone: IconChecklist,
      ton: "bg-primary-soft text-primary",
      texte: `Auto-évaluation en cours : ${s.grille.nom}`,
    });
  }
  for (const l of liensSynthese) {
    const Icone = l.icone;
    aTraiter.push({
      cle: l.cle,
      contenu: (
        <Link
          href={l.href}
          className="group flex items-center gap-4 rounded-[var(--radius-md)] border border-border px-4 py-3 transition-colors hover:border-primary/30 hover:bg-bg-subtle/60"
        >
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] ${l.ton}`}>
            <Icone width={19} height={19} />
          </span>
          <span className="min-w-0 flex-1 font-medium text-text">{l.texte}</span>
          <IconArrowRight
            width={16}
            height={16}
            className="shrink-0 text-text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
          />
        </Link>
      ),
    });
  }

  const kpis = [
    alertesOuvertes && (
      <StatCard
        key="alertes"
        label="Alertes NEWS ouvertes"
        valeur={`${alertesOuvertes.length}`}
        sousTexte="en attente de prise en charge"
        icone={IconVitals}
        ton={alertesOuvertes.length > 0 ? "danger" : "neutral"}
        href="/news/alertes?vue=ouvertes"
      />
    ),
    hospitalises && (
      <StatCard
        key="patients"
        label="Patients hospitalisés"
        valeur={`${hospitalises.length}`}
        sousTexte="sous surveillance NEWS"
        icone={IconUsers}
        ton="info"
        href="/news"
      />
    ),
    evenements && (
      <StatCard
        key="ei"
        label="Événements en cours"
        valeur={`${eiNonClotures.length}`}
        sousTexte={eiAQualifier > 0 ? `dont ${eiAQualifier} à qualifier` : "non clôturés"}
        icone={IconShieldAlert}
        ton={eiGravesOuverts > 0 ? "warning" : "primary"}
        href="/evenements-indesirables"
      />
    ),
    sessions && (
      <StatCard
        key="score"
        label="Dernier score d'auto-évaluation"
        valeur={derniereSoumise?.scoreGlobal !== null && derniereSoumise ? `${derniereSoumise.scoreGlobal}%` : "Aucun"}
        sousTexte={
          derniereSoumise?.dateSoumission
            ? `soumis le ${formaterDate(derniereSoumise.dateSoumission)}`
            : "aucune évaluation soumise"
        }
        icone={IconChecklist}
        ton="accent"
        href="/auto-evaluation"
      />
    ),
  ].filter(Boolean);

  return (
    <PageContainer>
      <Reveal>
        <PageHeader
          surtitre={formateurJour.format(maintenant)}
          titre={organisation.nom}
          description={organisation.type === "EH" ? "Établissement hospitalier (EH)" : "Établissement de soins de premiers contacts (ESPC)"}
        />
      </Reveal>

      {kpis.length > 0 && (
        <Reveal delay={0.05} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis}
        </Reveal>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <Reveal delay={0.1} className="xl:col-span-3">
          <Card className="h-full">
            <CardHeader titre="À traiter" description="Éléments en attente dans votre établissement" />
            {aTraiter.length === 0 ? (
              <div className="flex items-center gap-3 rounded-[var(--radius-md)] bg-success-soft/60 px-4 py-4 text-sm text-success">
                <IconCheckCircle width={18} height={18} />
                Rien à traiter pour le moment.
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {aTraiter.map((e) => (
                  <li key={e.cle}>{e.contenu}</li>
                ))}
              </ul>
            )}
          </Card>
        </Reveal>

        <Reveal delay={0.15} className="xl:col-span-2">
          <Card className="h-full">
            <CardHeader
              titre="Modules"
              description="Accès et abonnements"
              action={
                peutGererAbonnements ? (
                  <Link href="/abonnements" className="text-xs font-medium text-primary hover:underline">
                    Gérer les abonnements
                  </Link>
                ) : undefined
              }
            />
            <ul className="-mx-2 flex flex-col">
              <LigneModule
                href="/auto-evaluation"
                icone={IconChecklist}
                titre="Auto-évaluation"
                description="Grilles de conformité et scores"
                badge={<Badge variant="primary">Gratuit</Badge>}
              />
              <LigneModule
                href="/news"
                icone={IconVitals}
                titre="Score NEWS"
                description="Surveillance clinique au chevet du patient"
                badge={<StatutAbonnementBadge abonnement={abonnementNews} />}
              />
              <LigneModule
                href="/evenements-indesirables"
                icone={IconShieldAlert}
                titre="Événements indésirables"
                description="Déclaration, qualification et actions correctives"
                badge={<StatutAbonnementBadge abonnement={abonnementEi} />}
              />
              <LigneModule
                href="/formations"
                icone={IconGraduationCap}
                titre="Formations"
                description="Catalogue et réservation"
                badge={<Badge variant="primary">À l&apos;unité</Badge>}
              />
            </ul>
          </Card>
        </Reveal>
      </div>

      {evolution && (
        <Reveal delay={0.2} className="mt-6">
          <Card>
            <CardHeader
              titre="Évolution des scores d'auto-évaluation"
              description="Score global de chaque évaluation soumise"
              action={
                <Link href="/auto-evaluation" className="text-xs font-medium text-primary hover:underline">
                  Historique complet
                </Link>
              }
            />
            {points.length === 0 ? (
              <p className="py-10 text-center text-sm text-text-faint">
                Le graphique apparaîtra après la première évaluation soumise.
              </p>
            ) : (
              <EvolutionChart points={points} />
            )}
          </Card>
        </Reveal>
      )}
    </PageContainer>
  );
}
