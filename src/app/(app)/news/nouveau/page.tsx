import type { Metadata } from "next";
import { Reveal } from "@/components/motion/reveal";
import { PatientForm } from "@/components/news/patient-form";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { apiFetchJson, silencieux } from "@/lib/api-server";
import { obtenirSession } from "@/lib/session";
import type { ServiceEtablissement } from "@/lib/types";

export const metadata: Metadata = {
  title: "Nouveau patient · NEWS",
  robots: { index: false, follow: false },
};

export default async function NouveauPatientPage() {
  const [services, session] = await Promise.all([
    silencieux(apiFetchJson<ServiceEtablissement[]>("/organisation/services"), []),
    obtenirSession(),
  ]);

  return (
    <PageContainer largeur="formulaire">
      <Reveal>
        <PageHeader
          filAriane={[{ label: "Surveillance clinique", href: "/news" }, { label: "Nouveau patient" }]}
          surtitre="Module NEWS"
          titre="Nouvelle fiche patient"
          description="Identifiant interne, service et lit : aucune donnée d'identité n'est enregistrée."
        />
      </Reveal>
      <Reveal delay={0.05}>
        <Card>
          <PatientForm services={services} serviceParDefaut={session?.serviceId} />
        </Card>
      </Reveal>
    </PageContainer>
  );
}
