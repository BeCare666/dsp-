import type { Metadata } from "next";
import { apiFetchJson, silencieux } from "@/lib/api-server";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { MesReservationsTable } from "@/components/reservations/mes-reservations-table";
import type { Reservation } from "@/lib/types";

export const metadata: Metadata = {
  title: "Mes réservations",
  robots: { index: false, follow: false },
};

export default async function MesReservationsPage() {
  const reservations = await silencieux(apiFetchJson<Reservation[]>("/reservations"), []);

  return (
    <PageContainer>
      <Reveal>
        <PageHeader
          surtitre="Formations"
          titre="Mes réservations"
          actions={
            <Button variant="secondary" href="/formations">
              Voir le catalogue
            </Button>
          }
        />
      </Reveal>
      <Reveal delay={0.05}>
        <MesReservationsTable reservations={reservations} />
      </Reveal>
    </PageContainer>
  );
}
