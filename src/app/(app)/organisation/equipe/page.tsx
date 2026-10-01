import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { apiFetchJson } from "@/lib/api-server";
import { aRole, obtenirSession } from "@/lib/session";
import { MembresTable } from "@/components/organisation/membres-table";
import type { MembreEtablissement, ServiceEtablissement } from "@/lib/types";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Équipe",
  robots: { index: false, follow: false },
};

export default async function EquipePage() {
  if (!(await aRole("RESPONSABLE_COMPTE"))) redirect("/tableau-de-bord");

  const [session, membres, services] = await Promise.all([
    obtenirSession(),
    apiFetchJson<MembreEtablissement[]>("/organisation/membres"),
    apiFetchJson<ServiceEtablissement[]>("/organisation/services?inclureInactifs=true"),
  ]);

  return (
    <PageContainer>
      <PageHeader
        filAriane={[{ label: "Mon établissement", href: "/organisation" }, { label: "Équipe" }]}
        surtitre="Établissement"
        titre="Équipe"
        description="Utilisateurs internes de l'établissement : chacun dispose de son propre identifiant, de son mot de passe personnel et de rôles définissant ses accès."
      />
      <MembresTable membres={membres} services={services} moiId={session?.sub ?? ""} />
    </PageContainer>
  );
}
