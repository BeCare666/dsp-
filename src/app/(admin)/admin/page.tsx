import type { Metadata } from "next";
import type { ComponentType, SVGProps } from "react";
import Link from "next/link";
import { apiFetchJson, silencieux } from "@/lib/api-server";
import { Reveal } from "@/components/motion/reveal";
import { formaterFcfa, formaterIlYa } from "@/lib/format";
import { COULEURS } from "@/lib/chart-theme";
import { libelleAction } from "@/lib/audit-libelles";
import { ReservationsParStatutChart } from "@/components/admin/dashboard-charts";
import { Card, CardHeader, StatCard } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Repartition } from "@/components/ui/repartition";
import {
  IconAlertTriangle,
  IconArrowRight,
  IconCalendarClock,
  IconCheckCircle,
  IconOrganisation,
  IconShieldAlert,
  IconUsers,
  IconVitals,
} from "@/components/icons";
import type {
  AnalyticsPlateforme,
  JournalAuditEntry,
  LigneAlertePlateforme,
  Reservation,
  StatutReservation,
  UtilisateurProfil,
} from "@/lib/types";

export const metadata: Metadata = {
  title: "Administration · Tableau de bord",
  robots: { index: false, follow: false },
};

const LIBELLES_STATUT: Record<StatutReservation, string> = {
  ATTENTE_PAIEMENT: "En attente de paiement",
  PAYEE: "Payée",
  CONFIRMEE: "Confirmée",
  REALISEE: "Réalisée",
  ANNULEE: "Annulée",
};

const COULEURS_STATUT: Record<StatutReservation, string> = {
  ATTENTE_PAIEMENT: COULEURS.warning,
  PAYEE: COULEURS.primary,
  CONFIRMEE: COULEURS.success,
  REALISEE: COULEURS.navy,
  ANNULEE: COULEURS.neutre,
};

const LIBELLES_ROLE: Record<string, string> = {
  RESPONSABLE_COMPTE: "Responsable de compte",
  RESP_QUALITE: "Responsable qualité",
  PERSONNEL_SOIGNANT: "Personnel soignant",
  GESTIONNAIRE_FORMATION: "Gestionnaire formation",
  ADMIN_PLATEFORME: "Admin plateforme",
};

interface ElementATraiter {
  cle: string;
  icone: ComponentType<SVGProps<SVGSVGElement>>;
  ton: string;
  titre: string;
  detail: string;
  href: string;
}

const formateurJour = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

export default async function AdminAccueilPage() {
  const [profil, analytics, alertes, reservations, audit] = await Promise.all([
    silencieux(apiFetchJson<UtilisateurProfil>("/auth/me/profil"), null),
    silencieux(apiFetchJson<AnalyticsPlateforme>("/analytics"), null),
    silencieux(
      apiFetchJson<{ lignes: LigneAlertePlateforme[]; totalNews: number; totalEi: number }>("/alertes-plateforme"),
      null,
    ),
    silencieux(apiFetchJson<Reservation[]>("/reservations"), null),
    silencieux(apiFetchJson<JournalAuditEntry[]>("/audit"), null),
  ]);

  const montantEncaisse = (reservations ?? [])
    .filter((r) => r.statut !== "ATTENTE_PAIEMENT" && r.statut !== "ANNULEE")
    .reduce((s, r) => s + r.tarifApplique, 0);
  const aPlanifier = (reservations ?? []).filter((r) => r.statut === "PAYEE").length;

  const parStatut = (Object.keys(LIBELLES_STATUT) as StatutReservation[]).map((statut) => ({
    statut: LIBELLES_STATUT[statut],
    nombre: (reservations ?? []).filter((r) => r.statut === statut).length,
    couleur: COULEURS_STATUT[statut],
  }));

  const aTraiter: ElementATraiter[] = [];
  if (aPlanifier > 0) {
    aTraiter.push({
      cle: "rdv",
      icone: IconCalendarClock,
      ton: "bg-primary-soft text-primary",
      titre: `${aPlanifier} réservation${aPlanifier > 1 ? "s" : ""} payée${aPlanifier > 1 ? "s" : ""} à planifier`,
      detail: "Fixer la date de rendez-vous de la formation",
      href: "/admin/reservations?vue=a-planifier",
    });
  }
  if (alertes && alertes.totalNews > 0) {
    aTraiter.push({
      cle: "news",
      icone: IconVitals,
      ton: "bg-danger-soft text-danger",
      titre: `${alertes.totalNews} alerte${alertes.totalNews > 1 ? "s" : ""} NEWS non clôturée${alertes.totalNews > 1 ? "s" : ""}`,
      detail: "Niveau moyen ou élevé, tous établissements",
      href: "/admin/alertes?vue=news",
    });
  }
  if (alertes && alertes.totalEi > 0) {
    aTraiter.push({
      cle: "ei",
      icone: IconShieldAlert,
      ton: "bg-warning-soft text-warning",
      titre: `${alertes.totalEi} événement${alertes.totalEi > 1 ? "s" : ""} indésirable${alertes.totalEi > 1 ? "s" : ""} grave${alertes.totalEi > 1 ? "s" : ""}`,
      detail: "Gravité élevée, non clôturés",
      href: "/admin/alertes?vue=ei",
    });
  }

  const maintenant = new Date();
  const activite = (audit ?? []).slice(0, 7);
  const totalAlertes = alertes ? alertes.totalNews + alertes.totalEi : null;

  return (
    <div>
      <Reveal>
        <PageHeader
          surtitre={formateurJour.format(maintenant)}
          titre={profil ? `Bonjour, ${profil.prenom}` : "Tableau de bord"}
          description="Vue d'ensemble de la plateforme, calculée en temps réel à partir des données de tous les établissements."
        />
      </Reveal>

      <Reveal delay={0.05} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {analytics && (
          <StatCard
            label="Établissements actifs"
            valeur={`${analytics.etablissements.actifs}`}
            sousTexte={`sur ${analytics.etablissements.total} inscrit${analytics.etablissements.total > 1 ? "s" : ""}`}
            icone={IconOrganisation}
            href="/admin/etablissements"
          />
        )}
        {analytics && (
          <StatCard
            label="Utilisateurs actifs"
            valeur={`${analytics.utilisateurs.actifs}`}
            sousTexte={`sur ${analytics.utilisateurs.total} compte${analytics.utilisateurs.total > 1 ? "s" : ""}`}
            icone={IconUsers}
            ton="info"
            href="/admin/utilisateurs"
          />
        )}
        {reservations && (
          <StatCard
            label="Montant encaissé"
            valeur={formaterFcfa(montantEncaisse)}
            sousTexte="Réservations payées, confirmées ou réalisées"
            icone={IconCheckCircle}
            ton="success"
            href="/admin/reservations"
          />
        )}
        {totalAlertes !== null && (
          <StatCard
            label="Alertes ouvertes"
            valeur={`${totalAlertes}`}
            sousTexte={`${alertes!.totalNews} NEWS · ${alertes!.totalEi} EI grave${alertes!.totalEi > 1 ? "s" : ""}`}
            icone={IconAlertTriangle}
            ton={totalAlertes > 0 ? "danger" : "neutral"}
            href="/admin/alertes"
          />
        )}
      </Reveal>

      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <Reveal delay={0.1} className="xl:col-span-3">
          <Card className="h-full">
            <CardHeader titre="À traiter" description="Actions en attente de l'administration" />
            {aTraiter.length === 0 ? (
              <div className="flex items-center gap-3 rounded-[var(--radius-md)] bg-success-soft/60 px-4 py-4 text-sm text-success">
                <IconCheckCircle width={18} height={18} />
                Rien à traiter pour le moment.
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {aTraiter.map((e) => {
                  const Icone = e.icone;
                  return (
                    <li key={e.cle}>
                      <Link
                        href={e.href}
                        className="group flex items-center gap-4 rounded-[var(--radius-md)] border border-border px-4 py-3.5 transition-colors hover:border-primary/30 hover:bg-bg-subtle/60"
                      >
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] ${e.ton}`}>
                          <Icone width={19} height={19} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium text-text">{e.titre}</span>
                          <span className="block text-xs text-text-muted">{e.detail}</span>
                        </span>
                        <IconArrowRight
                          width={16}
                          height={16}
                          className="shrink-0 text-text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </Reveal>

        <Reveal delay={0.15} className="xl:col-span-2">
          <Card className="h-full">
            <CardHeader
              titre="Activité récente"
              description="Journal d'audit"
              action={
                <Link href="/admin/audit" className="text-xs font-medium text-primary hover:underline">
                  Tout voir
                </Link>
              }
            />
            {activite.length === 0 ? (
              <p className="py-6 text-center text-sm text-text-faint">Aucune activité enregistrée.</p>
            ) : (
              <ol className="relative flex flex-col gap-4 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-px before:bg-border">
                {activite.map((e) => (
                  <li key={e.id} className="relative flex gap-3 pl-6">
                    <span className="absolute left-0 top-1.5 h-[11px] w-[11px] rounded-full border-2 border-surface bg-primary/60" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-text">
                        <span className="font-medium">{libelleAction(e.action)}</span>
                        {e.utilisateur && (
                          <span className="text-text-muted">
                            {" "}
                            par {e.utilisateur.prenom} {e.utilisateur.nom}
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-text-faint">
                        {formaterIlYa(e.createdAt, maintenant)}
                        {e.organisation ? ` · ${e.organisation.nom}` : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </Reveal>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {reservations && (
          <Reveal delay={0.2} className="lg:col-span-2 xl:col-span-1">
            <Card className="h-full">
              <CardHeader titre="Réservations par statut" description="Toutes formations confondues" />
              <ReservationsParStatutChart donnees={parStatut} />
            </Card>
          </Reveal>
        )}
        {analytics && (
          <Reveal delay={0.25}>
            <Card className="h-full">
              <CardHeader titre="Utilisateurs par rôle" description="Un utilisateur peut cumuler plusieurs rôles" />
              <Repartition
                pourcentage={false}
                elements={Object.entries(analytics.utilisateurs.parRole).map(([role, n]) => ({
                  cle: role,
                  label: LIBELLES_ROLE[role] ?? role,
                  valeur: n,
                  ton: "info",
                }))}
              />
            </Card>
          </Reveal>
        )}
        {analytics && (
          <Reveal delay={0.3}>
            <Card className="h-full">
              <CardHeader
                titre="Événements indésirables"
                description={`Taux de clôture ${analytics.evenementsIndesirables.tauxClotureePct}%`}
              />
              <Repartition
                vide="Aucun événement pour l'instant."
                elements={Object.entries(analytics.evenementsIndesirables.parGravite)
                  .sort((x, y) => y[1] - x[1])
                  .map(([libelle, n]) => ({ cle: libelle, label: libelle, valeur: n, ton: "warning" as const }))}
              />
            </Card>
          </Reveal>
        )}
      </div>
    </div>
  );
}
