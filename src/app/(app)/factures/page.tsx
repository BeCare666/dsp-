import type { Metadata } from "next";
import { apiFetchJson, silencieux } from "@/lib/api-server";
import { formaterDate, formaterFcfa } from "@/lib/format";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import type { Facture } from "@/lib/types";

export const metadata: Metadata = {
  title: "Factures",
  robots: { index: false, follow: false },
};

// §11.1 — historique de toutes les transactions, factures téléchargeables.
export default async function FacturesPage() {
  const factures = await silencieux(apiFetchJson<Facture[]>("/factures"), []);

  return (
    <PageContainer>
      <PageHeader
        surtitre="Compte"
        titre="Factures"
        description="Une facture est émise automatiquement pour chaque paiement (abonnement ou réservation de formation)."
      />
      <Card>
        {factures.length === 0 ? (
          <p className="text-sm text-text-muted">Aucune facture pour l&apos;instant.</p>
        ) : (
          <ul className="divide-y divide-border text-sm">
            {factures.map((f) => (
              <li key={f.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span className="min-w-0">
                  <span className="block font-medium text-text">{f.numero}</span>
                  <span className="text-text-muted">
                    {f.reservation
                      ? `Formation « ${f.reservation.formation.titre} »`
                      : f.paiementAbonnement
                        ? `Abonnement ${f.paiementAbonnement.module === "NEWS" ? "Score NEWS" : "Événements indésirables"} · ${f.paiementAbonnement.dureeJours} jours`
                        : ""}{" "}
                    · {formaterDate(f.emiseLe)}
                  </span>
                </span>
                <span className="flex items-center gap-4">
                  <span className="font-display font-bold tabular-nums">
                    {f.devise === "XOF" ? formaterFcfa(f.montant) : `${f.montant} ${f.devise}`}
                  </span>
                  <a href={`/api/factures/${f.id}`} className="text-primary hover:underline">
                    Télécharger (PDF)
                  </a>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </PageContainer>
  );
}
