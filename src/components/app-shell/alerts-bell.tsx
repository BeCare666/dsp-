"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { IconBell } from "@/components/icons";
import { formaterDateHeure } from "@/lib/format";

export interface AlerteResume {
  id: string;
  titre: string;
  sousTitre: string;
  lienUrl: string;
  createdAt: string;
}

// Équivalent côté organisation de NotificationsBell (admin) : agrège les
// éléments déjà réellement ouverts/non traités des modules NEWS+EI (RM9) —
// pas une file de notifications avec lu/non-lu, mais l'état courant des
// items qui demandent attention. Données calculées côté serveur dans
// (app)/layout.tsx à partir d'endpoints déjà scopés organisation (aucun
// nouvel endpoint API). Pas de polling (contrairement à NotificationsBell) :
// la liste reflète déjà l'état courant à chaque navigation/revalidation des
// pages NEWS/EI qui la modifient.
export function AlertsBell({ alertes }: { alertes: AlerteResume[] }) {
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const conteneurRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClicExterieur(e: MouseEvent) {
      if (conteneurRef.current && !conteneurRef.current.contains(e.target as Node)) setOuvert(false);
    }
    document.addEventListener("mousedown", onClicExterieur);
    return () => document.removeEventListener("mousedown", onClicExterieur);
  }, []);

  function ouvrir(alerte: AlerteResume) {
    setOuvert(false);
    router.push(alerte.lienUrl);
  }

  return (
    <div ref={conteneurRef} className="relative">
      <button
        type="button"
        onClick={() => setOuvert((v) => !v)}
        aria-label="Alertes"
        className="relative rounded-full p-2 text-text-muted transition-colors hover:bg-bg-subtle hover:text-text"
      >
        <IconBell width={20} height={20} />
        {alertes.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
            {alertes.length > 9 ? "9+" : alertes.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {ouvert && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-elevated)]"
          >
            <div className="border-b border-border px-4 py-3">
              <span className="text-sm font-semibold text-text">Nécessite votre attention</span>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {alertes.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-text-muted">Rien à signaler pour le moment.</p>
              ) : (
                alertes.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => ouvrir(a)}
                    className="flex w-full flex-col gap-0.5 border-b border-border px-4 py-3 text-left transition-colors last:border-0 hover:bg-bg-subtle"
                  >
                    <span className="text-sm font-medium text-text">{a.titre}</span>
                    <span className="text-xs text-text-muted">{a.sousTitre}</span>
                    <span className="text-[11px] text-text-faint">{formaterDateHeure(a.createdAt)}</span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
