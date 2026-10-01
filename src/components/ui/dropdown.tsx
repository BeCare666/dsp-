"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

// Primitive générique (Phase 2) factorisant le pattern déjà câblé ad hoc dans
// ProfileMenu/NotificationsBell (trigger + panneau flottant + clic-dehors).
// Phase 6 : fermeture par Échap, et `children` peut être une fonction qui
// reçoit `fermer` (ex. menu de filtres, choix de colonnes). Usage existant
// (children simple) inchangé.
export function Dropdown({
  trigger,
  children,
  align = "right",
  className = "",
}: {
  trigger: (props: { ouvert: boolean; toggle: () => void }) => ReactNode;
  children: ReactNode | ((props: { fermer: () => void }) => ReactNode);
  align?: "left" | "right";
  className?: string;
}) {
  const [ouvert, setOuvert] = useState(false);
  const conteneurRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClicExterieur(e: MouseEvent) {
      if (conteneurRef.current && !conteneurRef.current.contains(e.target as Node)) setOuvert(false);
    }
    function onTouche(e: KeyboardEvent) {
      if (e.key === "Escape") setOuvert(false);
    }
    document.addEventListener("mousedown", onClicExterieur);
    document.addEventListener("keydown", onTouche);
    return () => {
      document.removeEventListener("mousedown", onClicExterieur);
      document.removeEventListener("keydown", onTouche);
    };
  }, []);

  const fermer = () => setOuvert(false);

  return (
    <div ref={conteneurRef} className="relative">
      {trigger({ ouvert, toggle: () => setOuvert((v) => !v) })}
      <AnimatePresence>
        {ouvert && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            className={`absolute z-40 mt-2 overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-elevated)] ${
              align === "right" ? "right-0" : "left-0"
            } ${className}`}
          >
            {typeof children === "function" ? children({ fermer }) : children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
