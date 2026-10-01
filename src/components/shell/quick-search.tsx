"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IconSearch } from "@/components/icons";
import type { LienNav } from "@/components/shell/sidebar-nav";

// Recherche rapide *réellement* fonctionnelle (Phase 5) : filtre en direct
// les pages accessibles dans ce shell et navigue au clic/Entrée. Remplace la
// barre de recherche purement visuelle identifiée en Phase 0
// (FRONTEND_AUDIT.md §1, "recherche visuelle non fonctionnelle"). Portée
// volontairement limitée à la navigation entre pages déjà connues du shell —
// une recherche de données transverses (établissements, utilisateurs...)
// demanderait un nouvel endpoint API, hors périmètre frontend.
export function QuickSearch({ liens, placeholder = "Rechercher une page…" }: { liens: LienNav[]; placeholder?: string }) {
  const router = useRouter();
  const [valeur, setValeur] = useState("");
  const [ouvert, setOuvert] = useState(false);
  const conteneurRef = useRef<HTMLDivElement>(null);
  const champRef = useRef<HTMLInputElement>(null);

  // Raccourci Ctrl+K / Cmd+K : place le curseur dans la recherche.
  useEffect(() => {
    function onRaccourci(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        champRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onRaccourci);
    return () => document.removeEventListener("keydown", onRaccourci);
  }, []);

  useEffect(() => {
    function onClicExterieur(e: MouseEvent) {
      if (conteneurRef.current && !conteneurRef.current.contains(e.target as Node)) setOuvert(false);
    }
    document.addEventListener("mousedown", onClicExterieur);
    return () => document.removeEventListener("mousedown", onClicExterieur);
  }, []);

  const resultats = useMemo(() => {
    const q = valeur.trim().toLowerCase();
    if (!q) return [];
    return liens.filter((l) => l.label.toLowerCase().includes(q)).slice(0, 8);
  }, [valeur, liens]);

  function naviguer(href: string) {
    setValeur("");
    setOuvert(false);
    router.push(href);
  }

  return (
    <div ref={conteneurRef} className="relative min-w-0 max-w-md flex-1">
      <div className="flex h-10 items-center gap-2.5 rounded-[var(--radius-md)] border border-border bg-bg-subtle px-3 text-sm transition-all focus-within:border-primary/40 focus-within:bg-surface focus-within:ring-4 focus-within:ring-primary/10">
        <IconSearch width={16} height={16} className="shrink-0 text-text-faint" />
        <input
          ref={champRef}
          type="search"
          aria-label="Rechercher une page"
          value={valeur}
          onChange={(e) => {
            setValeur(e.target.value);
            setOuvert(true);
          }}
          onFocus={() => setOuvert(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && resultats[0]) naviguer(resultats[0].href);
            if (e.key === "Escape") setOuvert(false);
          }}
          placeholder={placeholder}
          className="w-full min-w-0 bg-transparent text-text placeholder:text-text-faint focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        <kbd className="hidden shrink-0 rounded border border-border bg-surface px-1.5 py-0.5 font-sans text-[10px] font-medium text-text-faint lg:inline">
          Ctrl K
        </kbd>
      </div>

      {ouvert && resultats.length > 0 && (
        <div className="absolute left-0 right-0 z-40 mt-2 overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-elevated)]">
          {resultats.map((r) => {
            const Icon = r.icon;
            return (
              <button
                key={r.href}
                type="button"
                onClick={() => naviguer(r.href)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-text transition-colors hover:bg-bg-subtle"
              >
                <Icon width={16} height={16} className="text-text-faint" />
                {r.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
