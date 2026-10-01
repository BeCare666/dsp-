import { notFound } from "next/navigation";
import { apiFetchJson, ApiError } from "@/lib/api-server";
import { GrilleEditeur } from "@/components/admin/grille-editeur";
import { GrilleViewer } from "@/components/admin/grille-viewer";
import type { Grille } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";
import { Badge, type BadgeVariant } from "@/components/ui/badge";

const LIBELLES_STATUT: Record<Grille["statut"], string> = {
  BROUILLON: "Brouillon",
  PUBLIEE: "Publiée",
  ARCHIVEE: "Archivée",
};

const VARIANTES_STATUT: Record<Grille["statut"], BadgeVariant> = {
  BROUILLON: "neutral",
  PUBLIEE: "success",
  ARCHIVEE: "warning",
};

const LIBELLES_TYPE: Record<Grille["type"], string> = {
  EH: "Hôpital (EH)",
  ESPC: "ESPC",
};

export default async function GrilleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let grille: Grille;
  try {
    grille = await apiFetchJson<Grille>(`/grilles/${id}`);
  } catch (erreur) {
    if (erreur instanceof ApiError && erreur.status === 404) notFound();
    throw erreur;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        filAriane={[{ label: "Grilles d'auto-évaluation", href: "/admin/grilles" }, { label: grille.nom }]}
        surtitre={LIBELLES_TYPE[grille.type]}
        titre={
          <span className="inline-flex flex-wrap items-center gap-3">
            {grille.nom}
            <Badge variant={VARIANTES_STATUT[grille.statut]}>{LIBELLES_STATUT[grille.statut]}</Badge>
          </span>
        }
        description={`Version ${grille.version}`}
      />
      {grille.statut === "BROUILLON" ? (
        <GrilleEditeur grille={grille} grilleId={grille.id} />
      ) : (
        <GrilleViewer grille={grille} />
      )}
    </div>
  );
}
