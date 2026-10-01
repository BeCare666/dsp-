import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { apiFetchJson, silencieux } from "@/lib/api-server";
import { aRole, ROLES_TRAITEMENT_EI } from "@/lib/session";
import { formaterDate } from "@/lib/format";
import { Reveal } from "@/components/motion/reveal";
import { Card, CardHeader, StatCard } from "@/components/ui/card";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Repartition } from "@/components/ui/repartition";
import { StatutEiBadge } from "@/components/ei/badges";
import {
  IconAlertTriangle,
  IconArrowRight,
  IconCalendarClock,
  IconCheckCircle,
  IconShieldAlert,
} from "@/components/icons";
import type { EvenementIndesirable, NiveauGraviteEi, TableauDeBordEi, TypeEi } from "@/lib/types";
import { ExportEiForm } from "@/components/ei/export-ei-form";

export const metadata: Metadata = {
  title: "Tableau de bord EI",
  robots: { index: false, follow: false },
};

export default async function TableauDeBordEiPage() {
  const autorise = await aRole(...ROLES_TRAITEMENT_EI);
  if (!autorise) redirect("/evenements-indesirables");

  const [stats, evenements, niveaux, types] = await Promise.all([
    apiFetchJson<TableauDeBordEi>("/evenements-indesirables/tableau-de-bord"),
    silencieux(apiFetchJson<EvenementIndesirable[]>("/evenements-indesirables"), []),
    silencieux(apiFetchJson<NiveauGraviteEi[]>("/niveaux-gravite-ei?inclureInactifs=true"), []),
    silencieux(apiFetchJson<TypeEi[]>("/types-ei?inclureInactifs=true"), []),
  ]);

  // parService est indexé par identifiant : les noms viennent de la liste
  // (qui inclut le service de chaque événement).
  const nomsServices = new Map(evenements.filter((e) => e.service).map((e) => [e.serviceId!, e.service!.nom]));
  const aQualifier = evenements.filter((e) => e.statut === "DECLARE").length;
  const gravesOuverts = evenements.filter((e) => e.niveauGravite?.critique && e.statut !== "CLOTURE").slice(0, 5);
  const nomsTypes = new Map(types.map((t) => [t.id, t.libelle]));

  return (
    <PageContainer>
      <Reveal>
        <PageHeader
          filAriane={[{ label: "Événements indésirables", href: "/evenements-indesirables" }, { label: "Tableau de bord" }]}
          surtitre="Module EI"
          titre="Tableau de bord"
          description="Vue d'ensemble des événements indésirables de l'organisation."
        />
      </Reveal>

      <Reveal delay={0.03} className="mb-6">
        <ExportEiForm />
      </Reveal>

      <Reveal delay={0.05} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Événements déclarés"
          valeur={`${stats.total}`}
          sousTexte="depuis l'ouverture du module"
          icone={IconShieldAlert}
          href="/evenements-indesirables"
        />
        <StatCard
          label="À qualifier"
          valeur={`${aQualifier}`}
          sousTexte="en attente de qualification"
          icone={IconAlertTriangle}
          ton={aQualifier > 0 ? "warning" : "neutral"}
          href="/evenements-indesirables?vue=a-qualifier"
        />
        <StatCard
          label="Taux de clôture"
          valeur={`${stats.tauxCloture}%`}
          sousTexte="événements clôturés sur le total"
          icone={IconCheckCircle}
          ton="success"
        />
        <StatCard
          label="Délai moyen de clôture"
          valeur={stats.delaiMoyenClotureJours !== null ? `${stats.delaiMoyenClotureJours} j` : "Aucun"}
          sousTexte={stats.delaiMoyenClotureJours !== null ? "de la déclaration à la clôture" : "aucun EI clôturé"}
          icone={IconCalendarClock}
          ton="info"
        />
      </Reveal>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Reveal delay={0.1}>
          <Card className="h-full">
            <CardHeader titre="Par statut" />
            <Repartition
              elements={[
                { cle: "DECLARE", label: "Déclarés", valeur: stats.parStatut.DECLARE ?? 0, ton: "primary", href: "/evenements-indesirables?vue=a-qualifier" },
                { cle: "QUALIFIE", label: "Qualifiés", valeur: stats.parStatut.QUALIFIE ?? 0, ton: "info", href: "/evenements-indesirables?vue=en-analyse" },
                { cle: "EN_ANALYSE", label: "En analyse", valeur: stats.parStatut.EN_ANALYSE ?? 0, ton: "warning", href: "/evenements-indesirables?vue=en-analyse" },
                { cle: "PLAN_ACTION", label: "Plan d'action", valeur: stats.parStatut.PLAN_ACTION ?? 0, ton: "warning", href: "/evenements-indesirables?vue=plan-action" },
                { cle: "CLOTURE", label: "Clôturés", valeur: stats.parStatut.CLOTURE ?? 0, ton: "success", href: "/evenements-indesirables?vue=clotures" },
              ]}
            />
          </Card>
        </Reveal>
        <Reveal delay={0.15}>
          <Card className="h-full">
            <CardHeader titre="Par gravité" />
            <Repartition
              vide="Aucun événement pour l'instant."
              elements={[...niveaux]
                .sort((x, y) => y.ordre - x.ordre)
                .filter((n) => (stats.parGravite[n.id] ?? 0) > 0 || n.actif)
                .map((n) => ({
                  cle: n.id,
                  label: n.libelle,
                  valeur: stats.parGravite[n.id] ?? 0,
                  ton: n.critique ? ("danger" as const) : ("warning" as const),
                }))}
            />
          </Card>
        </Reveal>
        <Reveal delay={0.2}>
          <Card className="h-full">
            <CardHeader titre="Par service" description="Événements rattachés à un service" />
            <Repartition
              vide="Aucun événement rattaché à un service."
              elements={Object.entries(stats.parService)
                .sort((a, b) => b[1] - a[1])
                .map(([id, n]) => ({ cle: id, label: nomsServices.get(id) ?? "Service", valeur: n, ton: "info" as const }))}
            />
          </Card>
        </Reveal>
      </div>

      <Reveal delay={0.22} className="mt-6">
        <Card>
          <CardHeader titre="Par typologie" description="Type d'événement" />
          <Repartition
            vide="Aucun événement typé pour l'instant."
            elements={Object.entries(stats.parType)
              .sort((a, b) => b[1] - a[1])
              .map(([id, n]) => ({ cle: id, label: nomsTypes.get(id) ?? "Type", valeur: n, ton: "primary" as const }))}
          />
        </Card>
      </Reveal>

      <Reveal delay={0.25} className="mt-6">
        <Card>
          <CardHeader
            titre="Événements graves non clôturés"
            description="Gravité élevée, les plus récents"
            action={
              <Link href="/evenements-indesirables" className="text-xs font-medium text-primary hover:underline">
                Tous les événements
              </Link>
            }
          />
          {gravesOuverts.length === 0 ? (
            <div className="flex items-center gap-3 rounded-[var(--radius-md)] bg-success-soft/60 px-4 py-4 text-sm text-success">
              <IconCheckCircle width={18} height={18} />
              Aucun événement grave en cours.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {gravesOuverts.map((e) => (
                <li key={e.id}>
                  <Link
                    href={`/evenements-indesirables/${e.id}`}
                    className="group flex items-center gap-4 py-3 transition-colors hover:bg-bg-subtle/50 sm:px-2"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-1 font-medium text-text">{e.description}</span>
                      <span className="text-xs text-text-muted">
                        Survenu le {formaterDate(e.dateSurvenue)}
                        {e.service ? ` · ${e.service.nom}` : ""}
                      </span>
                    </span>
                    <StatutEiBadge statut={e.statut} />
                    <IconArrowRight width={16} height={16} className="hidden shrink-0 text-text-faint group-hover:text-primary sm:block" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </Reveal>
    </PageContainer>
  );
}
