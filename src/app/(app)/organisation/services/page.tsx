import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { apiFetchJson } from "@/lib/api-server";
import { aRole } from "@/lib/session";
import { ServicesTable } from "@/components/organisation/services-table";
import type { ServiceEtablissement } from "@/lib/types";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Services",
  robots: { index: false, follow: false },
};

export default async function ServicesPage() {
  if (!(await aRole("RESPONSABLE_COMPTE"))) redirect("/tableau-de-bord");

  const services = await apiFetchJson<ServiceEtablissement[]>("/organisation/services?inclureInactifs=true");

  return (
    <PageContainer>
      <PageHeader
        filAriane={[{ label: "Mon établissement", href: "/organisation" }, { label: "Services" }]}
        surtitre="Établissement"
        titre="Services"
        description="Services de l'établissement, utilisés pour rattacher le personnel, les patients et les événements indésirables."
      />
      <ServicesTable services={services} />
    </PageContainer>
  );
}
