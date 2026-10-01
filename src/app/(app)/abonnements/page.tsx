import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { apiFetchJson, silencieux } from "@/lib/api-server";
import { aRole } from "@/lib/session";
import { formaterDate, formaterFcfa } from "@/lib/format";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KkiapayButton } from "@/components/reservations/kkiapay-button";
import { joursRestants, StatutModuleBadge } from "@/components/abonnements/statut-module";
import type { AbonnementModule, OffreAbonnement, PaiementAbonnement } from "@/lib/types";

export const metadata: Metadata = {
  title: "Abonnements",
  robots: { index: false, follow: false },
};

const MODULES = [
  { cle: "NEWS" as const, titre: "Score NEWS", description: "Surveillance clinique et détection précoce de la détérioration" },
  { cle: "EI" as const, titre: "Événements indésirables", description: "Déclaration, analyse et suivi des événements indésirables" },
];

// §5 — statut de chaque module (essai et jours restants, actif, expiré) avec
// accès direct à la souscription ; §11.1 — historique des paiements et factures.
export default async function AbonnementsPage() {
  if (!(await aRole("RESPONSABLE_COMPTE"))) redirect("/tableau-de-bord");

  const [offre, news, ei, paiements] = await Promise.all([
    apiFetchJson<OffreAbonnement>("/abonnements/offre"),
    silencieux(apiFetchJson<AbonnementModule | null>("/abonnements/NEWS"), null),
    silencieux(apiFetchJson<AbonnementModule | null>("/abonnements/EI"), null),
    silencieux(apiFetchJson<PaiementAbonnement[]>("/abonnements/paiements"), []),
  ]);
  const statuts = { NEWS: news || null, EI: ei || null };

  return (
    <PageContainer>
      <PageHeader
        surtitre="Établissement"
        titre="Abonnements"
        description={`Auto-évaluation : gratuite et permanente. Score NEWS et Événements indésirables : essai gratuit puis abonnement de ${offre.dureeJours || "—"} jours. En fin d'essai sans souscription, le module passe ${offre.comportementFinEssai === "BLOCAGE" ? "en accès bloqué" : "en lecture seule"}.`}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {MODULES.map((m) => {
          const abonnement = statuts[m.cle];
          const tarif = offre.modules[m.cle];
          const restants = joursRestants(abonnement);
          return (
            <Card key={m.cle}>
              <CardHeader titre={m.titre} description={m.description} action={<StatutModuleBadge abonnement={abonnement} />} />
              <div className="flex flex-col gap-3 text-sm">
                {abonnement?.statut === "ESSAI" && (
                  <p>
                    Essai gratuit jusqu&apos;au {formaterDate(abonnement.essaiFin)} —{" "}
                    <strong>{restants} jour{restants && restants > 1 ? "s" : ""} restant{restants && restants > 1 ? "s" : ""}</strong>
                  </p>
                )}
                {abonnement?.statut === "ACTIF" && abonnement.expireLe && (
                  <p>
                    Abonnement actif jusqu&apos;au {formaterDate(abonnement.expireLe)} ({restants} jour{restants && restants > 1 ? "s" : ""})
                  </p>
                )}
                {abonnement?.statut === "SUSPENDU" && <p className="text-danger">Accès suspendu par l&apos;équipe DSP.</p>}
                {!abonnement && <p className="text-text-muted">L&apos;essai gratuit démarre à la première utilisation du module.</p>}

                {tarif.disponible ? (
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                    <span>
                      <span className="font-display text-lg font-bold">{formaterFcfa(tarif.prix)}</span>
                      <span className="text-text-muted"> / {offre.dureeJours} jours</span>
                    </span>
                    {abonnement?.statut !== "SUSPENDU" && (
                      <KkiapayButton
                        cible={{ type: "abonnement", module: m.cle }}
                        libelle={abonnement?.statut === "ACTIF" ? "Prolonger l'abonnement" : "Souscrire"}
                      />
                    )}
                  </div>
                ) : (
                  <p className="mt-2 border-t border-border pt-4 text-text-muted">
                    Le tarif de l&apos;abonnement n&apos;est pas encore publié par l&apos;équipe DSP.
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6">
        <CardHeader titre="Historique des paiements" />
        {paiements.length === 0 ? (
          <p className="text-sm text-text-muted">Aucun paiement d&apos;abonnement.</p>
        ) : (
          <ul className="divide-y divide-border text-sm">
            {paiements.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span>
                  <span className="font-medium">{p.module === "NEWS" ? "Score NEWS" : "Événements indésirables"}</span>
                  <span className="text-text-muted">
                    {" "}
                    · {formaterFcfa(p.montant)} · {p.dureeJours} jours · {formaterDate(p.payeLe ?? p.createdAt)}
                  </span>
                </span>
                <span className="flex items-center gap-3">
                  {p.statut === "PAYE" ? <Badge variant="success">Payé</Badge> : <Badge variant="neutral">Non finalisé</Badge>}
                  {p.facture && (
                    <a href={`/api/factures/${p.facture.id}`} className="text-primary hover:underline">
                      Facture {p.facture.numero}
                    </a>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </PageContainer>
  );
}
