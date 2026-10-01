import type { Metadata } from "next";
import { apiFetchJson, silencieux } from "@/lib/api-server";
import { FormationsTable } from "@/components/admin/formations-table";
import type { Formation } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Administration · Formations",
  robots: { index: false, follow: false },
};

export default async function AdminFormationsPage() {
  const formations = await silencieux(apiFetchJson<Formation[]>("/formations?inclureInactives=true"), []);

  return (
    <div>
      <PageHeader
        surtitre="Opérations"
        titre="Formations"
        description={`${formations.length} formation${formations.length > 1 ? "s" : ""} au catalogue (actives et inactives).`}
      />
      <FormationsTable formations={formations} />
    </div>
  );
}
