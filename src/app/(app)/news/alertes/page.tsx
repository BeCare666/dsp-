import type { Metadata } from "next";
import { apiFetchJson, silencieux } from "@/lib/api-server";
import { Reveal } from "@/components/motion/reveal";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { AlertesNewsTable } from "@/components/news/alertes-table";
import type { Alerte } from "@/lib/types";

export const metadata: Metadata = {
  title: "Alertes NEWS",
  robots: { index: false, follow: false },
};

export default async function AlertesPage() {
  const alertes = await silencieux(apiFetchJson<Alerte[]>("/alertes"), []);

  return (
    <PageContainer>
      <Reveal>
        <PageHeader
          filAriane={[{ label: "Surveillance clinique", href: "/news" }, { label: "Alertes" }]}
          surtitre="Module NEWS"
          titre="Alertes cliniques"
          description="Déclenchées automatiquement dès qu'un score NEWS dépasse le seuil bas."
        />
      </Reveal>
      <Reveal delay={0.05}>
        <AlertesNewsTable alertes={alertes} />
      </Reveal>
    </PageContainer>
  );
}
