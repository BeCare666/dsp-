import type { Metadata } from "next";
import { GrilleEditeur } from "@/components/admin/grille-editeur";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Administration · Nouvelle grille",
  robots: { index: false, follow: false },
};

export default function NouvelleGrillePage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        filAriane={[{ label: "Grilles d'auto-évaluation", href: "/admin/grilles" }, { label: "Nouvelle grille" }]}
        surtitre="Opérations"
        titre="Nouvelle grille d'auto-évaluation"
        description="Construisez la structure complète (domaines → normes → critères → éléments mesurables), puis enregistrez. La grille sera créée en statut brouillon."
      />
      <GrilleEditeur />
    </div>
  );
}
