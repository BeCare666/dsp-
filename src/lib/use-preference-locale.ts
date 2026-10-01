"use client";

import { useCallback, useSyncExternalStore } from "react";

// Préférence d'affichage persistée par viewer dans localStorage (colonnes
// visibles, densité d'une table…). Même principe que la sidebar : lecture via
// useSyncExternalStore (rendu serveur = valeur par défaut, puis valeur stockée
// côté client, sans setState dans un effet), écriture tolérante aux erreurs.
const EVENEMENT = "dps:preference-locale";

function abonner(rappel: () => void) {
  window.addEventListener("storage", rappel);
  window.addEventListener(EVENEMENT, rappel);
  return () => {
    window.removeEventListener("storage", rappel);
    window.removeEventListener(EVENEMENT, rappel);
  };
}

function lire(cle: string): string | null {
  try {
    return window.localStorage.getItem(cle);
  } catch {
    return null;
  }
}

export function usePreferenceLocale(cle: string | undefined, defaut: string): [string, (valeur: string) => void] {
  const stocke = useSyncExternalStore(
    abonner,
    () => (cle ? lire(cle) : null),
    () => null,
  );

  const ecrire = useCallback(
    (valeur: string) => {
      if (!cle) return;
      try {
        window.localStorage.setItem(cle, valeur);
      } catch {
        // ignoré : la préférence ne sera simplement pas mémorisée.
      }
      window.dispatchEvent(new Event(EVENEMENT));
    },
    [cle],
  );

  return [stocke ?? defaut, ecrire];
}
