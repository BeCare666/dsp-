"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { verifierPaiementAction } from "@/lib/reservations-actions";
import { souscrireAbonnementAction, verifierPaiementAbonnementAction } from "@/lib/abonnements-actions";

declare global {
  interface Window {
    openKkiapayWidget?: (options: {
      amount: number;
      key: string;
      sandbox: boolean;
      position?: "left" | "right" | "center";
      theme?: string;
      data?: string;
      partnerId?: string;
    }) => void;
    addSuccessListener?: (callback: (response: { transactionId: string }) => void) => void;
    addFailedListener?: (callback: (error: unknown) => void) => void;
  }
}

const CLE_PUBLIQUE = process.env.NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY ?? "";
const SANDBOX = process.env.NEXT_PUBLIC_KKIAPAY_SANDBOX !== "false";

// Ce que l'on paie : une réservation existante (montant figé, RM5), ou un
// abonnement NEWS / EI (la demande de paiement est créée au clic, tarif figé
// côté serveur).
export type CiblePaiement = { type: "reservation"; id: string; montant: number } | { type: "abonnement"; module: "NEWS" | "EI" };

// §10.4 — widget KKiaPay. La référence `partnerId` (RES-… / ABO-…) est
// renvoyée par KKiaPay au webhook : elle permet de rattacher un paiement
// finalisé après la fermeture de la page. Toute transaction est revérifiée
// côté serveur (RM11).
export function KkiapayButton({ cible, libelle = "Payer maintenant" }: { cible: CiblePaiement; libelle?: string }) {
  const router = useRouter();
  const [scriptPret, setScriptPret] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string>();
  const inscrit = useRef(false);
  const paiementAbonnementId = useRef<string | null>(null);

  useEffect(() => {
    if (!scriptPret || inscrit.current || !window.addSuccessListener || !window.addFailedListener) return;
    inscrit.current = true;

    window.addSuccessListener(async (response) => {
      setEnCours(true);
      const resultat =
        cible.type === "reservation"
          ? await verifierPaiementAction(cible.id, response.transactionId)
          : paiementAbonnementId.current
            ? await verifierPaiementAbonnementAction(paiementAbonnementId.current, response.transactionId)
            : { erreur: "Demande de paiement introuvable." };
      setEnCours(false);
      if (resultat.erreur) {
        setErreur(resultat.erreur);
        return;
      }
      router.refresh();
    });

    window.addFailedListener(() => {
      setErreur("Le paiement a été annulé ou a échoué.");
    });
  }, [scriptPret, cible, router]);

  async function ouvrirWidget() {
    setErreur(undefined);
    let montant: number;
    let partnerId: string;
    if (cible.type === "reservation") {
      montant = cible.montant;
      partnerId = `RES-${cible.id}`;
    } else {
      setEnCours(true);
      const demande = await souscrireAbonnementAction(cible.module);
      setEnCours(false);
      if (!demande.paiement) {
        setErreur(demande.erreur ?? "Souscription impossible.");
        return;
      }
      paiementAbonnementId.current = demande.paiement.id;
      montant = demande.paiement.montant;
      partnerId = `ABO-${demande.paiement.id}`;
    }
    window.openKkiapayWidget?.({
      amount: montant,
      key: CLE_PUBLIQUE,
      sandbox: SANDBOX,
      position: "center",
      theme: "#1657CC",
      data: partnerId,
      partnerId,
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <Script src="https://cdn.kkiapay.me/k.js" strategy="afterInteractive" onReady={() => setScriptPret(true)} />
      <button
        type="button"
        onClick={ouvrirWidget}
        disabled={!scriptPret || enCours || !CLE_PUBLIQUE}
        className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
      >
        {enCours ? "Vérification du paiement…" : !scriptPret ? "Chargement du paiement…" : libelle}
      </button>
      {erreur && <p className="text-sm text-danger">{erreur}</p>}
    </div>
  );
}
