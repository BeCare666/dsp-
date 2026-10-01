import { notFound } from "next/navigation";
import { apiFetchJson, ApiError } from "@/lib/api-server";
import { formaterDate, formaterDateHeure, formaterFcfa } from "@/lib/format";
import { Reveal } from "@/components/motion/reveal";
import { Card, CardHeader } from "@/components/ui/card";
import { ListeProprietes } from "@/components/ui/fiche";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { StatutReservationBadge } from "@/components/reservations/badges";
import { KkiapayButton } from "@/components/reservations/kkiapay-button";
import { AnnulerReservationButton } from "@/components/reservations/annuler-reservation-button";
import { IconCheck } from "@/components/icons";
import type { FormuleFormation, Reservation, StatutReservation } from "@/lib/types";

const LIBELLES_FORMULE: Record<FormuleFormation, string> = {
  INDIVIDUEL: "Individuel",
  GROUPE_5: "Groupe de 5",
  GROUPE_10: "Groupe de 10",
};

// Étapes du parcours de réservation (RM5/RM11), déduites du seul statut.
const ETAPES: { statut: StatutReservation; label: string }[] = [
  { statut: "ATTENTE_PAIEMENT", label: "Réservée" },
  { statut: "PAYEE", label: "Payée" },
  { statut: "CONFIRMEE", label: "Rendez-vous fixé" },
  { statut: "REALISEE", label: "Réalisée" },
];

function Progression({ statut }: { statut: StatutReservation }) {
  const indexCourant = ETAPES.findIndex((e) => e.statut === statut);
  return (
    <ol className="grid grid-cols-4 gap-2">
      {ETAPES.map((e, i) => {
        const faite = i < indexCourant || statut === "REALISEE";
        const courante = i === indexCourant && statut !== "REALISEE";
        return (
          <li key={e.statut} className="flex flex-col items-center gap-2 text-center">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold tabular-nums ${
                faite
                  ? "bg-success text-white"
                  : courante
                    ? "bg-primary text-primary-foreground ring-4 ring-primary-soft"
                    : "bg-bg-subtle text-text-faint"
              }`}
            >
              {faite ? <IconCheck width={15} height={15} strokeWidth={2.4} /> : i + 1}
            </span>
            <span className={`text-xs ${courante ? "font-semibold text-text" : "text-text-muted"}`}>{e.label}</span>
          </li>
        );
      })}
    </ol>
  );
}

export default async function ReservationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let reservation: Reservation;
  try {
    reservation = await apiFetchJson<Reservation>(`/reservations/${id}`);
  } catch (erreur) {
    if (erreur instanceof ApiError && erreur.status === 404) notFound();
    throw erreur;
  }

  const peutAnnuler = reservation.statut !== "REALISEE" && reservation.statut !== "ANNULEE";

  return (
    <PageContainer largeur="detail">
      <Reveal>
        <PageHeader
          filAriane={[
            { label: "Mes réservations", href: "/mes-reservations" },
            { label: reservation.formation?.titre ?? "Formation" },
          ]}
          surtitre="Réservation"
          titre={
            <span className="inline-flex flex-wrap items-center gap-3">
              {reservation.formation?.titre ?? "Formation"}
              <StatutReservationBadge statut={reservation.statut} />
            </span>
          }
          description={`${LIBELLES_FORMULE[reservation.formule]} · réservée le ${formaterDate(reservation.createdAt)}`}
        />
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="flex flex-col gap-6 lg:col-span-3">
          {reservation.statut !== "ANNULEE" && (
            <Reveal delay={0.05}>
              <Card>
                <Progression statut={reservation.statut} />
              </Card>
            </Reveal>
          )}

          <Reveal delay={0.1}>
            <Card>
              <CardHeader titre="Suivi" />
              {reservation.statut === "ATTENTE_PAIEMENT" && (
                <div>
                  <p className="mb-4 text-sm text-text-muted">Réglez pour confirmer votre place.</p>
                  <KkiapayButton cible={{ type: "reservation", id: reservation.id, montant: reservation.tarifApplique }} />
                </div>
              )}

              {reservation.statut === "PAYEE" && (
                <p className="text-sm leading-6 text-text-muted">
                  Paiement confirmé{reservation.facture ? ` (facture ${reservation.facture.numero})` : ""}. La date de
                  rendez-vous vous sera communiquée sous 48h.
                </p>
              )}

              {reservation.statut === "CONFIRMEE" && reservation.dateRdv && (
                <div className="rounded-[var(--radius-md)] bg-primary-soft/60 px-4 py-4">
                  <p className="text-sm text-text-muted">Rendez-vous le</p>
                  <p className="font-display text-lg font-bold text-primary">{formaterDateHeure(reservation.dateRdv)}</p>
                </div>
              )}

              {reservation.statut === "REALISEE" && (
                <p className="text-sm text-success">
                  Session réalisée{reservation.presenceConfirmee ? ", présence confirmée" : ""}.
                </p>
              )}

              {reservation.statut === "ANNULEE" && (
                <p className="text-sm text-text-faint">Cette réservation a été annulée.</p>
              )}
            </Card>
          </Reveal>

          {peutAnnuler && (
            <Reveal delay={0.15}>
              <AnnulerReservationButton reservationId={reservation.id} />
            </Reveal>
          )}
        </div>

        <Reveal delay={0.1} className="lg:col-span-2">
          <Card>
            <CardHeader titre="Récapitulatif" />
            <ListeProprietes
              elements={[
                { label: "Formation", valeur: reservation.formation?.titre },
                { label: "Formule", valeur: LIBELLES_FORMULE[reservation.formule] },
                {
                  label: "Montant",
                  valeur: (
                    <span className="font-display text-lg font-bold text-text tabular-nums">
                      {formaterFcfa(reservation.tarifApplique)}
                    </span>
                  ),
                },
                {
                  label: "Facture",
                  valeur: reservation.facture ? (
                    <a href={`/api/factures/${reservation.facture.id}`} className="text-primary hover:underline">
                      {reservation.facture.numero} (PDF)
                    </a>
                  ) : null,
                  vide: "Pas encore émise",
                },
                { label: "Réservée le", valeur: formaterDate(reservation.createdAt) },
                {
                  label: "Rendez-vous",
                  valeur: reservation.dateRdv ? formaterDateHeure(reservation.dateRdv) : null,
                  vide: "Non fixé",
                },
              ]}
            />
          </Card>
        </Reveal>
      </div>
    </PageContainer>
  );
}
