import type { Metadata } from "next";
import { apiFetchJson, silencieux } from "@/lib/api-server";
import { PageHeader } from "@/components/ui/page-header";
import { ConformiteTable } from "@/components/admin/conformite-table";
import type { ConformiteEtablissement } from "@/lib/types";

export const metadata: Metadata = {
  title: "Administration · Conformité",
  robots: { index: false, follow: false },
};

export default async function AdminConformitePage() {
  const lignes = await silencieux(apiFetchJson<ConformiteEtablissement[]>("/analytics/conformite"), []);
  return (
    <div>
      <PageHeader
        surtitre="Alertes & analyse"
        titre="Conformité des établissements"
        description="Comparaison des scores d'auto-évaluation documentaire (dernière évaluation soumise par grille). Auto-évaluation déclarative, distincte d'une inspection ARS."
      />
      <ConformiteTable lignes={lignes} />
    </div>
  );
}
