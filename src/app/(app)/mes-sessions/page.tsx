import type { Metadata } from "next";
import { apiFetchJson } from "@/lib/api-server";
import { SessionsList } from "@/components/comptes/sessions-list";
import type { SessionUtilisateur } from "@/lib/types";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { SectionReglage } from "@/components/ui/section-reglage";

export const metadata: Metadata = {
  title: "Paramètres",
  robots: { index: false, follow: false },
};

export default async function MesSessionsPage() {
  const sessions = await apiFetchJson<SessionUtilisateur[]>("/auth/me/sessions");

  return (
    <PageContainer>
      <div className="mx-auto max-w-5xl">
        <PageHeader surtitre="Compte" titre="Paramètres" description="Sécurité et accès à votre compte." />
        <SectionReglage
          titre="Sessions actives"
          description="Appareils et navigateurs actuellement connectés à votre compte. Révoquez toute session que vous ne reconnaissez pas."
        >
          <SessionsList sessions={sessions} />
        </SectionReglage>
      </div>
    </PageContainer>
  );
}
