import type { Metadata } from "next";
import { apiFetchJson, silencieux } from "@/lib/api-server";
import { GrillesTable } from "@/components/admin/grilles-table";
import type { Grille } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Administration · Grilles d'auto-évaluation",
  robots: { index: false, follow: false },
};

export default async function AdminGrillesPage() {
  const grilles = await silencieux(apiFetchJson<Grille[]>("/grilles"), []);

  return (
    <div>
      <PageHeader
        surtitre="Opérations"
        titre="Grilles d'auto-évaluation"
        description={`${grilles.length} grille${grilles.length > 1 ? "s" : ""} d'auto-évaluation (tous statuts).`}
        actions={<Button href="/admin/grilles/nouveau">+ Nouvelle grille</Button>}
      />
      <GrillesTable grilles={grilles} />
    </div>
  );
}
