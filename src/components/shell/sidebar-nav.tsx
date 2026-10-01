"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore, type ComponentType, type SVGProps } from "react";
import { IconChevronDown, IconLogout } from "@/components/icons";
import { deconnexionAction } from "@/lib/auth-actions";

export interface LienNav {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  exact?: boolean;
}

export interface GroupeNav {
  titre?: string;
  liens: LienNav[];
  // Ajoute un bouton « Déconnexion » en fin de groupe (groupe « Compte »).
  avecDeconnexion?: boolean;
}

const CLASSE_ITEM =
  "group/item relative flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-colors";

function estActif(pathname: string, lien: LienNav): boolean {
  return lien.exact ? pathname === lien.href : pathname === lien.href || pathname.startsWith(`${lien.href}/`);
}

// État replié/déplié persisté par viewer dans localStorage (simple confort
// d'affichage local). Lu via useSyncExternalStore : rendu serveur toujours
// « ouvert », puis valeur stockée côté client, sans setState dans un effet.
const EVENEMENT_SIDEBAR = "dps:sidebar-groupe";

function abonner(rappel: () => void) {
  window.addEventListener("storage", rappel);
  window.addEventListener(EVENEMENT_SIDEBAR, rappel);
  return () => {
    window.removeEventListener("storage", rappel);
    window.removeEventListener(EVENEMENT_SIDEBAR, rappel);
  };
}

function lireStockage(cle: string): string | null {
  try {
    return window.localStorage.getItem(cle);
  } catch {
    return null; // localStorage indisponible (navigation privée…) : groupe ouvert par défaut.
  }
}

// Un groupe contenant la page active reste toujours visible, même replié.
function Groupe({
  groupe,
  storageKey,
  onNavigate,
}: {
  groupe: GroupeNav;
  storageKey: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const contientActif = groupe.liens.some((l) => estActif(pathname, l));
  const stocke = useSyncExternalStore(
    abonner,
    () => (groupe.titre ? lireStockage(storageKey) : null),
    () => null,
  );
  const ouvert = stocke === null ? true : stocke === "1";

  function basculer() {
    try {
      window.localStorage.setItem(storageKey, ouvert ? "0" : "1");
    } catch {
      // ignoré : l'état ne sera simplement pas mémorisé.
    }
    window.dispatchEvent(new Event(EVENEMENT_SIDEBAR));
  }

  return (
    <div>
      {groupe.titre && (
        <button
          type="button"
          onClick={basculer}
          className="mb-1 flex w-full items-center justify-between px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-faint transition-colors hover:text-text-muted"
        >
          {groupe.titre}
          <IconChevronDown width={12} height={12} className={`transition-transform ${ouvert ? "" : "-rotate-90"}`} />
        </button>
      )}
      {(ouvert || contientActif) && (
        <div className="flex flex-col gap-0.5">
          {groupe.liens.map((lien) => {
            const actif = estActif(pathname, lien);
            const Icon = lien.icon;
            return (
              <Link
                key={lien.href}
                href={lien.href}
                onClick={onNavigate}
                aria-current={actif ? "page" : undefined}
                className={`${CLASSE_ITEM} ${
                  actif ? "bg-primary-soft text-primary" : "text-text-muted hover:bg-bg-subtle hover:text-text"
                }`}
              >
                {actif && (
                  <span aria-hidden className="absolute -left-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
                )}
                <Icon width={18} height={18} className={actif ? "" : "text-text-faint group-hover/item:text-text-muted"} />
                <span className="truncate">{lien.label}</span>
              </Link>
            );
          })}
          {groupe.avecDeconnexion && (
            <form action={deconnexionAction}>
              <button type="submit" className={`${CLASSE_ITEM} text-text-muted hover:bg-danger-soft hover:text-danger`}>
                <IconLogout width={18} height={18} className="text-text-faint group-hover/item:text-danger" />
                Déconnexion
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export function SidebarNav({
  groupes,
  storagePrefix,
  onNavigate,
}: {
  groupes: GroupeNav[];
  storagePrefix: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-5 px-3 py-5">
      {groupes.map((groupe, i) => (
        <Groupe
          key={groupe.titre ?? i}
          groupe={groupe}
          storageKey={`${storagePrefix}:groupe:${groupe.titre ?? i}`}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
}
