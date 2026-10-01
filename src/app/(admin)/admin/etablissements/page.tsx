import type { Metadata } from "next";
import { apiFetchJson, silencieux } from "@/lib/api-server";
import { EtablissementsTable } from "@/components/admin/etablissements-table";
import type { Organisation } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Administration · Établissements",
  robots: { index: false, follow: false },
};

export default async function AdminEtablissementsPage() {
  const organisations = await silencieux(apiFetchJson<Organisation[]>("/organisations"), []);

  return (
    <div>
      <PageHeader
        surtitre="Gestion"
        titre="Établissements"
        description={`${organisations.length} établissement${organisations.length > 1 ? "s" : ""} inscrit${organisations.length > 1 ? "s" : ""} sur la plateforme.`}
      />
      <EtablissementsTable organisations={organisations} />
    </div>
  );
}
