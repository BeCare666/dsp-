import type { Metadata } from "next";
import { apiFetchJson, silencieux } from "@/lib/api-server";
import { AuditTable } from "@/components/admin/audit-table";
import type { JournalAuditEntry } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Administration · Audit",
  robots: { index: false, follow: false },
};

export default async function AdminAuditPage() {
  const entrees = await silencieux(apiFetchJson<JournalAuditEntry[]>("/audit"), []);

  return (
    <div>
      <PageHeader
        surtitre="Alertes & analyse"
        titre="Journal d'audit"
        description={`${entrees.length} action${entrees.length > 1 ? "s" : ""} tracée${entrees.length > 1 ? "s" : ""} (200 plus récentes maximum).`}
      />
      <AuditTable entrees={entrees} />
    </div>
  );
}
