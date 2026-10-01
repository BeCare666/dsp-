import type { Metadata } from "next";
import { apiFetchJson, silencieux } from "@/lib/api-server";
import { TypesEiTable } from "@/components/admin/types-ei-table";
import type { NiveauGraviteEi, TypeEi } from "@/lib/types";
import { NiveauxGraviteTable } from "@/components/admin/niveaux-gravite-table";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Administration · Types d'EI",
  robots: { index: false, follow: false },
};

export default async function AdminTypesEiPage() {
  const [types, niveaux] = await Promise.all([
    silencieux(apiFetchJson<TypeEi[]>("/types-ei?inclureInactifs=true"), []),
    silencieux(apiFetchJson<NiveauGraviteEi[]>("/niveaux-gravite-ei?inclureInactifs=true"), []),
  ]);

  return (
    <div>
      <PageHeader
        surtitre="Opérations"
        titre="Événements indésirables : référentiels"
        description="Catalogue des types d'événements indésirables proposés à la déclaration."
      />
      <TypesEiTable types={types} />

      <div className="mt-10">
        <PageHeader
          titre="Échelle de gravité"
          description="Niveaux de gravité proposés à la déclaration et à la qualification. Un niveau déjà utilisé ne se modifie pas : désactivez-le et créez-en un nouveau."
        />
        <NiveauxGraviteTable niveaux={niveaux} />
      </div>
    </div>
  );
}
