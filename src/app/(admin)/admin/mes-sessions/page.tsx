import type { Metadata } from "next";
import { apiFetchJson } from "@/lib/api-server";
import { SessionsList } from "@/components/comptes/sessions-list";
import type { SessionUtilisateur } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";
import { SectionReglage } from "@/components/ui/section-reglage";

export const metadata: Metadata = {
  title: "Mes sessions",
  robots: { index: false, follow: false },
};

// Atteinte depuis le groupe « Compte » de la sidebar admin.
export default async function AdminMesSessionsPage() {
  const sessions = await apiFetchJson<SessionUtilisateur[]>("/auth/me/sessions");

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader surtitre="Compte" titre="Mes sessions" description="Sécurité et accès à votre compte administrateur." />
      <SectionReglage
        titre="Sessions actives"
        description="Appareils et navigateurs actuellement connectés à votre compte administrateur. Révoquez toute session que vous ne reconnaissez pas."
      >
        <SessionsList sessions={sessions} />
      </SectionReglage>
    </div>
  );
}
