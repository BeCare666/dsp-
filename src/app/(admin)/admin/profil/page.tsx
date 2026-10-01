import type { Metadata } from "next";
import { apiFetchJson } from "@/lib/api-server";
import { ProfilForm } from "@/components/comptes/profil-form";
import type { UtilisateurProfil } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";
import { SectionReglage } from "@/components/ui/section-reglage";

export const metadata: Metadata = {
  title: "Mon profil",
  robots: { index: false, follow: false },
};

export default async function ProfilAdminPage() {
  const profil = await apiFetchJson<UtilisateurProfil>("/auth/me/profil");

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader surtitre="Compte" titre="Mon profil" description="Vos informations personnelles." />
      <SectionReglage
        titre="Informations personnelles"
        description="Nom, prénom et téléphone associés à votre compte administrateur."
      >
        <ProfilForm profil={profil} />
      </SectionReglage>
    </div>
  );
}
