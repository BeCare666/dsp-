import type { Metadata } from "next";
import Link from "next/link";
import { apiFetchJson, silencieux } from "@/lib/api-server";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { IconAlertTriangle, IconArrowRight, IconPlus } from "@/components/icons";
import { PatientsTable } from "@/components/news/patients-table";
import type { Alerte, Patient } from "@/lib/types";

export const metadata: Metadata = {
  title: "NEWS · Surveillance clinique",
  robots: { index: false, follow: false },
};

export default async function NewsPage() {
  const [patients, alertesOuvertes] = await Promise.all([
    silencieux(apiFetchJson<Patient[]>("/patients"), []),
    silencieux(apiFetchJson<Alerte[]>("/alertes?statut=OUVERTE"), []),
  ]);

  return (
    <PageContainer>
      <Reveal>
        <PageHeader
          surtitre="Module NEWS"
          titre="Surveillance clinique"
          description="Score NEWS calculé automatiquement à chaque mesure. Les alertes sont une aide à la priorisation, pas un diagnostic."
          actions={
            <>
              <Button variant="secondary" href="/news/alertes">
                Alertes
              </Button>
              <Button href="/news/nouveau" className="gap-1.5">
                <IconPlus width={16} height={16} />
                Nouveau patient
              </Button>
            </>
          }
        />
      </Reveal>

      {alertesOuvertes.length > 0 && (
        <Reveal delay={0.05} className="mb-6">
          <Link
            href="/news/alertes"
            className="group flex items-center gap-3 rounded-[var(--radius-lg)] border border-danger/30 bg-danger-soft px-5 py-4 transition-colors hover:border-danger/50"
          >
            <IconAlertTriangle width={18} height={18} className="shrink-0 text-danger" />
            <p className="flex-1 text-sm font-medium text-danger">
              {alertesOuvertes.length} alerte{alertesOuvertes.length > 1 ? "s" : ""} ouverte
              {alertesOuvertes.length > 1 ? "s" : ""} nécessite{alertesOuvertes.length > 1 ? "nt" : ""} une prise en
              charge
            </p>
            <IconArrowRight width={16} height={16} className="text-danger transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Reveal>
      )}

      <Reveal delay={0.1}>
        <PatientsTable patients={patients} />
      </Reveal>
    </PageContainer>
  );
}
