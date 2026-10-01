"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { IconChevronDown, IconUser, IconSettings, IconLogout } from "@/components/icons";
import { deconnexionAction } from "@/lib/auth-actions";
import type { UtilisateurProfil } from "@/lib/types";

function initiales(profil: UtilisateurProfil): string {
  return `${profil.prenom.charAt(0)}${profil.nom.charAt(0)}`.toUpperCase();
}

const CLASSE_ITEM =
  "group flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm text-text transition-colors hover:bg-bg-subtle";

// Menu de l'avatar, partagé par les shells admin et organisation :
// Profil, Paramètres, Déconnexion (mêmes entrées que le groupe « Compte »
// de la sidebar).
export function ProfileMenu({
  profil,
  profilHref,
  parametresHref,
  contexte,
}: {
  profil: UtilisateurProfil;
  profilHref: string;
  parametresHref: string;
  // Ligne secondaire sous l'email (nom de l'établissement, « Administrateur »…).
  contexte?: string;
}) {
  const [ouvert, setOuvert] = useState(false);
  const conteneurRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClicExterieur(e: MouseEvent) {
      if (conteneurRef.current && !conteneurRef.current.contains(e.target as Node)) setOuvert(false);
    }
    function onEchap(e: KeyboardEvent) {
      if (e.key === "Escape") setOuvert(false);
    }
    document.addEventListener("mousedown", onClicExterieur);
    document.addEventListener("keydown", onEchap);
    return () => {
      document.removeEventListener("mousedown", onClicExterieur);
      document.removeEventListener("keydown", onEchap);
    };
  }, []);

  return (
    <div ref={conteneurRef} className="relative">
      <button
        type="button"
        onClick={() => setOuvert((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={ouvert}
        aria-label="Menu du compte"
        className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-bg-subtle sm:pr-2.5"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[#0f3d8a] text-xs font-semibold text-primary-foreground ring-2 ring-surface">
          {initiales(profil)}
        </span>
        <span className="hidden max-w-[9rem] truncate text-sm font-medium text-text sm:inline">{profil.prenom}</span>
        <IconChevronDown
          width={14}
          height={14}
          className={`hidden text-text-faint transition-transform sm:inline ${ouvert ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {ouvert && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            className="absolute right-0 z-40 mt-2 w-64 origin-top-right overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-elevated)]"
          >
            <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[#0f3d8a] text-sm font-semibold text-primary-foreground">
                {initiales(profil)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text">
                  {profil.prenom} {profil.nom}
                </p>
                <p className="truncate text-xs text-text-muted">{profil.email}</p>
                {contexte && <p className="mt-0.5 truncate text-xs text-text-faint">{contexte}</p>}
              </div>
            </div>

            <div className="p-1.5">
              <Link href={profilHref} role="menuitem" onClick={() => setOuvert(false)} className={CLASSE_ITEM}>
                <IconUser width={17} height={17} className="text-text-faint group-hover:text-text-muted" />
                Profil
              </Link>
              <Link href={parametresHref} role="menuitem" onClick={() => setOuvert(false)} className={CLASSE_ITEM}>
                <IconSettings width={17} height={17} className="text-text-faint group-hover:text-text-muted" />
                Paramètres
              </Link>
            </div>

            <form action={deconnexionAction} className="border-t border-border p-1.5">
              <button
                type="submit"
                role="menuitem"
                className={`${CLASSE_ITEM} hover:bg-danger-soft hover:text-danger`}
              >
                <IconLogout width={17} height={17} className="text-text-faint group-hover:text-danger" />
                Déconnexion
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
