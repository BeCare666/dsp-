import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { apiFetchJson } from "@/lib/api-server";
import { aRole } from "@/lib/session";
import { OrganisationForm } from "@/components/organisation/organisation-form";
import type { Organisation } from "@/lib/types";
import Link from "next/link";
import { LIBELLES_TYPE_STRUCTURE } from "@/lib/libelles-comptes";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { SectionReglage } from "@/components/ui/section-reglage";

export const metadata: Metadata = {
  title: "Mon établissement",
  robots: { index: false, follow: false },
};

export default async function MonOrganisationPage() {
  const autorise = await aRole("RESPONSABLE_COMPTE");
  if (!autorise) redirect("/tableau-de-bord");

  const organisation = await apiFetchJson<Organisation>("/organisations/me");

  return (
    <PageContainer>
      <div className="mx-auto max-w-5xl">
        <PageHeader
          surtitre="Établissement"
          titre="Mon établissement"
          description={`${organisation.typeStructure ? `${LIBELLES_TYPE_STRUCTURE[organisation.typeStructure]} · ` : ""}Catégorie ARS : ${organisation.type === "EH" ? "Établissement hospitalier (EH)" : "Établissement de soins de premiers contacts (ESPC)"} · IFU ${organisation.ifu}`}
          actions={
            <div className="flex gap-2">
              <Link
                href="/organisation/equipe"
                className="inline-flex items-center justify-center rounded-[var(--radius-md)] border border-border bg-surface px-4 py-2 text-sm font-medium text-text transition-colors hover:border-primary/40"
              >
                Équipe
              </Link>
              <Link
                href="/organisation/services"
                className="inline-flex items-center justify-center rounded-[var(--radius-md)] border border-border bg-surface px-4 py-2 text-sm font-medium text-text transition-colors hover:border-primary/40"
              >
                Services
              </Link>
            </div>
          }
        />
        <SectionReglage
          titre="Coordonnées"
          description="Coordonnées de votre établissement. La catégorie ARS et l'IFU ne sont pas modifiables ici."
        >
          <OrganisationForm organisation={organisation} />
        </SectionReglage>
      </div>
    </PageContainer>
  );
}
