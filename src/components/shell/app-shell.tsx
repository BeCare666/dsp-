"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconMenu, IconClose } from "@/components/icons";
import { Logo } from "@/components/shell/logo";
import { QuickSearch } from "@/components/shell/quick-search";
import { SidebarNav, type GroupeNav } from "@/components/shell/sidebar-nav";

// Coquille commune admin + organisation (schéma console SaaS) :
// - sidebar fixe pleine hauteur : logo seul en tête, menu scrollable dessous ;
// - header fixe à droite de la sidebar : recherche, puis actions (alertes, profil) ;
// - footer fixe à droite de la sidebar ;
// - seul le contenu principal défile avec la page.
// Remplace les deux copies quasi identiques qu'étaient AdminShell et OrgShell.
interface AppShellProps {
  logoHref: string;
  groupes: GroupeNav[];
  storagePrefix: string;
  placeholderRecherche: string;
  actions: ReactNode;
  children: ReactNode;
}

export function AppShell({ logoHref, groupes, storagePrefix, placeholderRecherche, actions, children }: AppShellProps) {
  const [menuMobileOuvert, setMenuMobileOuvert] = useState(false);
  const liensRecherche = groupes.flatMap((g) => g.liens);

  return (
    <div className="min-h-screen bg-bg-subtle">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-surface md:flex">
        <div className="flex h-16 shrink-0 items-center px-6">
          <Logo href={logoHref} />
        </div>
        <div className="scrollbar-fin flex-1 overflow-y-auto">
          <SidebarNav groupes={groupes} storagePrefix={storagePrefix} />
        </div>
      </aside>

      <header className="fixed left-0 right-0 top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-surface/85 px-4 backdrop-blur-md sm:px-6 md:left-64 lg:px-8">
        <button
          type="button"
          onClick={() => setMenuMobileOuvert(true)}
          aria-label="Ouvrir le menu"
          className="-ml-1 shrink-0 rounded-[var(--radius-md)] p-2 text-text-muted transition-colors hover:bg-bg-subtle hover:text-text md:hidden"
        >
          <IconMenu width={20} height={20} />
        </button>

        <QuickSearch liens={liensRecherche} placeholder={placeholderRecherche} />

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">{actions}</div>
      </header>

      <footer className="fixed bottom-0 left-0 right-0 z-20 flex h-11 items-center justify-between gap-4 border-t border-border bg-surface px-4 text-xs text-text-faint sm:px-6 md:left-64 lg:px-8">
        <span className="truncate">
          © {new Date().getFullYear()} DSP · Dispositif de Sécurité des Patients
        </span>
        <span className="hidden shrink-0 sm:inline">Tous droits réservés</span>
      </footer>

      <AnimatePresence>
        {menuMobileOuvert && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-[#10182b]/45 backdrop-blur-[2px] md:hidden"
              onClick={() => setMenuMobileOuvert(false)}
            />
            <motion.aside
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-border bg-surface shadow-[var(--shadow-elevated)] md:hidden"
            >
              <div className="flex h-16 shrink-0 items-center justify-between px-6">
                <Logo href={logoHref} />
                <button
                  type="button"
                  onClick={() => setMenuMobileOuvert(false)}
                  aria-label="Fermer le menu"
                  className="-mr-2 rounded-full p-2 text-text-faint transition-colors hover:bg-bg-subtle hover:text-text"
                >
                  <IconClose width={18} height={18} />
                </button>
              </div>
              <div className="scrollbar-fin flex-1 overflow-y-auto">
                <SidebarNav
                  groupes={groupes}
                  storagePrefix={storagePrefix}
                  onNavigate={() => setMenuMobileOuvert(false)}
                />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="min-h-screen pb-11 pt-16 md:pl-64">{children}</main>
    </div>
  );
}
