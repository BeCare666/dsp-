import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiFetchJson, ApiError } from "@/lib/api-server";
import { Reveal } from "@/components/motion/reveal";
import { ReserverForm } from "@/components/reservations/reserver-form";
import type { Formation } from "@/lib/types";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Réserver une formation",
  robots: { index: false, follow: false },
};

export default async function ReserverPage({ params }: { params: Promise<{ formationId: string }> }) {
  const { formationId } = await params;

  let formation: Formation;
  try {
    formation = await apiFetchJson<Formation>(`/formations/${formationId}`);
  } catch (erreur) {
    if (erreur instanceof ApiError && erreur.status === 404) notFound();
    throw erreur;
  }

  return (
    <PageContainer largeur="formulaire">
      <Reveal>
        <PageHeader
          filAriane={[{ label: "Formations", href: "/formations" }, { label: formation.titre }]}
          surtitre="Réservation"
          titre={formation.titre}
          description="Choisissez la formule qui vous convient. Le paiement se fait à l'étape suivante."
        />
      </Reveal>
      <Reveal delay={0.05}>
        <ReserverForm formation={formation} />
      </Reveal>
    </PageContainer>
  );
}
