"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shell/logo";
import { ListeReseauxSociaux } from "@/components/marketing/social-icons";
import { IconChevronDown, IconClose, IconHome, IconMenu } from "@/components/icons";
import { MENUS_EN_TETE, type LienVitrine } from "@/lib/navigation-vitrine";
import { SITE } from "@/lib/site-config";

const EASE = [0.22, 1, 0.36, 1] as const;

// Vrai côté client uniquement : le tiroir est rendu en portail dans <body>
// (le header a un backdrop-filter, qui piégerait un élément `fixed`).
const sAbonnerRien = () => () => {};
function useEstMonte() {
  return useSyncExternalStore(sAbonnerRien, () => true, () => false);
}

// Lien de menu : les adresses mailto passent par un <a> classique.
function LienMenu({ lien, className, onClick, children }: { lien: LienVitrine; className: string; onClick?: () => void; children: React.ReactNode }) {
  if (lien.href.startsWith("mailto:")) {
    return (
      <a href={lien.href} className={className} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <Link href={lien.href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

export function SiteHeader() {
  const [menuOuvert, setMenuOuvert] = useState<string | null>(null);
  const [tiroirOuvert, setTiroirOuvert] = useState(false);
  const [defile, setDefile] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setDefile(y > 12));

  // Référence stable : l'effet du tiroir (verrou du défilement, focus) ne doit
  // pas se relancer à chaque rendu du header (ex. pendant le défilement).
  const fermerTiroir = useCallback(() => setTiroirOuvert(false), []);
  const navRef = useRef<HTMLElement>(null);
  const surAccueil = usePathname() === "/";
  const baseId = useId();

  // Fermeture des menus déroulants : clic en dehors, touche Échap.
  useEffect(() => {
    if (!menuOuvert) return;
    function surPointeur(e: PointerEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setMenuOuvert(null);
    }
    function surTouche(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      const declencheur = document.getElementById(`${baseId}-btn-${menuOuvert}`);
      setMenuOuvert(null);
      declencheur?.focus();
    }
    document.addEventListener("pointerdown", surPointeur);
    document.addEventListener("keydown", surTouche);
    return () => {
      document.removeEventListener("pointerdown", surPointeur);
      document.removeEventListener("keydown", surTouche);
    };
  }, [menuOuvert, baseId]);

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-300 ${
        defile ? "border-border/70 bg-bg/90 shadow-[0_8px_30px_-18px_rgba(10,26,56,0.35)]" : "border-transparent bg-bg/70"
      }`}
    >
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
        <Logo />

        <nav ref={navRef} aria-label="Navigation principale" className="hidden shrink-0 items-center gap-1 lg:flex">
          <Link
            href="/"
            aria-current={surAccueil ? "page" : undefined}
            onClick={() => setMenuOuvert(null)}
            className={`whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
              surAccueil ? "text-text" : "text-text-muted hover:text-text"
            }`}
          >
            Accueil
          </Link>
          {MENUS_EN_TETE.map((menu, i) => {
            const ouvert = menuOuvert === menu.titre;
            const idPanneau = `${baseId}-menu-${i}`;
            return (
              <div key={menu.titre} className="relative">
                <button
                  type="button"
                  id={`${baseId}-btn-${menu.titre}`}
                  aria-expanded={ouvert}
                  aria-controls={idPanneau}
                  onClick={() => setMenuOuvert(ouvert ? null : menu.titre)}
                  className={`relative flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                    ouvert ? "text-text" : "text-text-muted hover:text-text"
                  }`}
                >
                  {ouvert && (
                    <motion.span
                      layoutId="vitrine-menu-actif"
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full bg-bg-subtle"
                      transition={{ duration: 0.35, ease: EASE }}
                    />
                  )}
                  <span className="relative">{menu.titre}</span>
                  <IconChevronDown
                    width={15}
                    height={15}
                    className={`relative transition-transform duration-300 ${ouvert ? "rotate-180 text-primary" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {ouvert && (
                    <motion.div
                      id={idPanneau}
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.1 } }}
                      transition={{ duration: 0.28, ease: EASE }}
                      style={{ transformOrigin: "top center" }}
                      className="absolute left-1/2 top-full z-50 mt-3 w-[19rem] -translate-x-1/2"
                    >
                      {/* Petite flèche reliant le panneau à son menu. */}
                      <span
                        aria-hidden="true"
                        className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 rounded-[3px] border-l border-t border-border bg-surface"
                      />
                      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-2 shadow-[var(--shadow-elevated)]">
                        <p className="flex items-center gap-2 px-3 pb-2 pt-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-faint">
                          <menu.icon width={14} height={14} />
                          {menu.titre}
                        </p>
                        {menu.sections.map((section) => (
                          <div key={section.titre ?? menu.titre}>
                            {section.titre && (
                              <p className="mx-3 mt-2 border-t border-border px-0 pb-2 pt-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-faint">
                                {section.titre}
                              </p>
                            )}
                            <ul className="flex flex-col">
                              {section.liens.map((lien, j) => (
                                <motion.li
                                  key={lien.label}
                                  initial={{ opacity: 0, x: -6 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.3, delay: 0.04 + j * 0.035, ease: EASE }}
                                >
                                  <LienMenu
                                    lien={lien}
                                    onClick={() => setMenuOuvert(null)}
                                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text transition-colors hover:bg-bg-subtle"
                                  >
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                                      <lien.icon width={17} height={17} />
                                    </span>
                                    <span className="flex-1">{lien.label}</span>
                                    <IconChevronDown
                                      width={14}
                                      height={14}
                                      className="-rotate-90 text-text-faint opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
                                    />
                                  </LienMenu>
                                </motion.li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 whitespace-nowrap lg:flex">
          {/* Entre 1024 et 1280 px, la place manque : « Se connecter » reste
              accessible dans le menu Établissement. */}
          <span className="hidden xl:block">
            <Button href="/login" variant="ghost">
              Se connecter
            </Button>
          </span>
          <Button href="/inscription" variant="primary">
            Créer un compte
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setTiroirOuvert(true)}
          aria-label="Ouvrir le menu"
          aria-expanded={tiroirOuvert}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-text shadow-[var(--shadow-card)] transition-colors hover:border-primary/30 hover:text-primary lg:hidden"
        >
          <IconMenu width={20} height={20} />
        </button>
      </div>

      <TiroirNavigation ouvert={tiroirOuvert} onFermer={fermerTiroir} />
    </header>
  );
}

// Tiroir de navigation (mobile et tablette) : glisse depuis la droite.
function TiroirNavigation({ ouvert, onFermer }: { ouvert: boolean; onFermer: () => void }) {
  const monte = useEstMonte();
  const [groupeOuvert, setGroupeOuvert] = useState<string | null>(MENUS_EN_TETE[0].titre);
  const boutonFermerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!ouvert) return;
    const overflowAvant = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    boutonFermerRef.current?.focus();

    function surTouche(e: KeyboardEvent) {
      if (e.key === "Escape") onFermer();
    }
    // Passage en affichage grand écran : le tiroir n'a plus lieu d'être.
    const grandEcran = window.matchMedia("(min-width: 1024px)");
    function surChangement(e: MediaQueryListEvent) {
      if (e.matches) onFermer();
    }
    document.addEventListener("keydown", surTouche);
    grandEcran.addEventListener("change", surChangement);
    return () => {
      document.body.style.overflow = overflowAvant;
      document.removeEventListener("keydown", surTouche);
      grandEcran.removeEventListener("change", surChangement);
    };
  }, [ouvert, onFermer]);

  if (!monte) return null;

  return createPortal(
    <AnimatePresence>
      {ouvert && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onFermer}
            className="absolute inset-0 bg-navy-deep/50 backdrop-blur-[3px]"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: EASE }}
            className="absolute inset-y-0 right-0 flex h-dvh w-[23rem] max-w-[88vw] flex-col bg-surface shadow-[-30px_0_60px_-30px_rgba(10,26,56,0.45)]"
          >
            <div className="flex h-[4.5rem] shrink-0 items-center justify-between border-b border-border px-5">
              <Logo />
              <button
                ref={boutonFermerRef}
                type="button"
                onClick={onFermer}
                aria-label="Fermer le menu"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-text-muted transition-all duration-300 hover:rotate-90 hover:border-primary/30 hover:text-primary"
              >
                <IconClose width={18} height={18} />
              </button>
            </div>

            <nav aria-label="Navigation principale" className="scrollbar-fin flex-1 overflow-y-auto px-3 py-4">
              <ul className="flex flex-col gap-1">
                <motion.li
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.06, ease: EASE }}
                >
                  <Link
                    href="/"
                    onClick={onFermer}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-[0.95rem] font-semibold text-text transition-colors hover:bg-bg-subtle"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                      <IconHome width={18} height={18} />
                    </span>
                    <span className="flex-1 font-display">Accueil</span>
                  </Link>
                </motion.li>
                {MENUS_EN_TETE.map((menu, i) => {
                  const deplie = groupeOuvert === menu.titre;
                  return (
                    <motion.li
                      key={menu.titre}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.45, delay: 0.12 + i * 0.06, ease: EASE }}
                    >
                      <button
                        type="button"
                        aria-expanded={deplie}
                        onClick={() => setGroupeOuvert(deplie ? null : menu.titre)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[0.95rem] font-semibold transition-colors ${
                          deplie ? "bg-bg-subtle text-text" : "text-text hover:bg-bg-subtle"
                        }`}
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-300 ${
                            deplie ? "bg-primary text-white" : "bg-primary-soft text-primary"
                          }`}
                        >
                          <menu.icon width={18} height={18} />
                        </span>
                        <span className="flex-1 font-display">{menu.titre}</span>
                        <IconChevronDown
                          width={17}
                          height={17}
                          className={`text-text-faint transition-transform duration-300 ${deplie ? "rotate-180 text-primary" : ""}`}
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {deplie && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: EASE }}
                            className="overflow-hidden"
                          >
                            {menu.sections.map((section) => (
                              <div key={section.titre ?? menu.titre}>
                                {section.titre && (
                                  <p className="ml-[3.35rem] mt-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-faint">
                                    {section.titre}
                                  </p>
                                )}
                                <ul className="ml-[1.9rem] mt-1 flex flex-col border-l border-border py-1 pl-3">
                                  {section.liens.map((lien) => (
                                    <li key={lien.label}>
                                      <LienMenu
                                        lien={lien}
                                        onClick={onFermer}
                                        className="group flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-bg-subtle hover:text-text"
                                      >
                                        <lien.icon
                                          width={17}
                                          height={17}
                                          className="shrink-0 text-text-faint transition-colors group-hover:text-primary"
                                        />
                                        {lien.label}
                                      </LienMenu>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.li>
                  );
                })}
              </ul>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.4, ease: EASE }}
                className="mt-5 flex flex-col gap-2 px-2"
              >
                <Button href="/inscription" variant="primary" className="w-full py-3">
                  Créer un compte
                </Button>
                <Button href="/login" variant="secondary" className="w-full py-3">
                  Se connecter
                </Button>
              </motion.div>
            </nav>

            <div className="relative shrink-0 overflow-hidden bg-navy px-5 pb-6 pt-5 text-white">
              <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">Réseaux sociaux</p>
              <ListeReseauxSociaux className="mt-3" />
              <a
                href={`mailto:${SITE.emailContact}`}
                className="mt-4 inline-flex text-xs text-white/60 transition-colors hover:text-white"
              >
                {SITE.emailContact}
              </a>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
