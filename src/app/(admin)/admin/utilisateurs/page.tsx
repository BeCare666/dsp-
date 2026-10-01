import type { Metadata } from "next";
import { apiFetchJson, silencieux } from "@/lib/api-server";
import { UtilisateursTable } from "@/components/admin/utilisateurs-table";
import type { UtilisateurAdmin } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Administration · Utilisateurs",
  robots: { index: false, follow: false },
};

export default async function AdminUtilisateursPage() {
  const utilisateurs = await silencieux(apiFetchJson<UtilisateurAdmin[]>("/utilisateurs"), []);

  return (
    <div>
      <PageHeader
        surtitre="Gestion"
        titre="Utilisateurs"
        description={`${utilisateurs.length} utilisateur${utilisateurs.length > 1 ? "s" : ""} sur la plateforme.`}
      />
      <UtilisateursTable utilisateurs={utilisateurs} />
    </div>
  );
}
