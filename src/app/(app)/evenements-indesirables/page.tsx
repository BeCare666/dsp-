import type { Metadata } from "next";
import { apiFetchJson, silencieux } from "@/lib/api-server";
import { aRole, ROLES_TRAITEMENT_EI } from "@/lib/session";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { IconAlertTriangle, IconBarChart, IconPlus } from "@/components/icons";
import { EvenementsTable } from "@/components/ei/evenements-table";
import type { EvenementIndesirable } from "@/lib/types";

export const metadata: Metadata = {
  title: "Événements indésirables",
  robots: { index: false, follow: false },
};

export default async function EvenementsIndesirablesPage() {
  const [evenements, peutTraiter] = await Promise.all([
    silencieux(apiFetchJson<EvenementIndesirable[]>("/evenements-indesirables"), []),
    aRole(...ROLES_TRAITEMENT_EI),
  ]);

  const nonQualifies = evenements.filter((e) => e.statut === "DECLARE").length;

  return (
    <PageContainer>
      <Reveal>
        <PageHeader
          surtitre="Module EI"
          titre="Événements indésirables"
          description="Déclaration, qualification et suivi des actions correctives."
          actions={
            <>
              {peutTraiter && (
                <Button variant="secondary" href="/evenements-indesirables/tableau-de-bord" className="gap-1.5">
                  <IconBarChart width={16} height={16} />
                  Tableau de bord
                </Button>
              )}
              <Button href="/evenements-indesirables/nouveau" className="gap-1.5">
                <IconPlus width={16} height={16} />
                Déclarer
              </Button>
            </>
          }
        />
      </Reveal>

      {peutTraiter && nonQualifies > 0 && (
        <Reveal delay={0.05} className="mb-6">
          <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-warning/30 bg-warning-soft px-5 py-4">
            <IconAlertTriangle width={18} height={18} className="shrink-0 text-warning" />
            <p className="text-sm font-medium text-warning">
              {nonQualifies} événement{nonQualifies > 1 ? "s" : ""} en attente de qualification (vue « À qualifier »)
            </p>
          </div>
        </Reveal>
      )}

      <Reveal delay={0.1}>
        <EvenementsTable evenements={evenements} />
      </Reveal>
    </PageContainer>
  );
}
