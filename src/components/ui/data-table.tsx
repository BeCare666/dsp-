"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type SVGProps,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Dropdown } from "@/components/ui/dropdown";
import { Skeleton } from "@/components/ui/skeleton";
import { usePreferenceLocale } from "@/lib/use-preference-locale";
import {
  IconArrowDown,
  IconArrowUp,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconClose,
  IconColumns,
  IconDensity,
  IconDots,
  IconDownload,
  IconFilter,
  IconInbox,
  IconSearch,
  IconSortable,
} from "@/components/icons";

// Table de données Phase 6 (DASHBOARD_PREMIUM_ROADMAP.md §5.1) : recherche,
// vues rapides avec compteurs, filtres à choix multiple avec compteurs et
// puces actives, tri, colonnes affichables, densité, menu d'actions par
// ligne, clic sur la ligne vers le détail, pagination complète, état dans
// l'URL, export CSV de la vue filtrée, mode cartes sur mobile.
// Tout le filtrage se fait sur les lignes déjà chargées (aucun nouvel appel
// API) ; pas de sélection multiple (aucune action groupée côté API, 6.0).

type Icone = ComponentType<SVGProps<SVGSVGElement>>;

export interface ColonneTable<T> {
  cle: string;
  entete: string;
  render: (ligne: T) => ReactNode;
  valeurTri?: (ligne: T) => string | number;
  valeurRecherche?: (ligne: T) => string;
  // Valeur écrite dans l'export CSV (repli : valeurTri puis valeurRecherche).
  valeurExport?: (ligne: T) => string | number;
  alignement?: "left" | "right" | "center";
  // false : colonne toujours visible (ne figure pas dans « Colonnes »).
  masquable?: boolean;
  masqueeParDefaut?: boolean;
  // false : colonne non reprise dans la carte mobile.
  mobile?: boolean;
  largeur?: string;
}

export interface FiltreTable<T> {
  cle: string;
  label: string;
  options: { valeur: string; label: string }[];
  valeur: (ligne: T) => string | string[] | null | undefined;
}

export interface VueTable<T> {
  cle: string;
  label: string;
  filtre?: (ligne: T) => boolean;
}

export interface ActionLigne {
  label: string;
  icone?: Icone;
  href?: string;
  onSelect?: () => void;
  danger?: boolean;
}

interface DataTableProps<T> {
  // Identifiant stable : préférences locales (colonnes, densité).
  id: string;
  colonnes: ColonneTable<T>[];
  lignes: T[];
  cleLigne: (ligne: T) => string;
  rechercheEspaceReserve?: string;
  filtres?: FiltreTable<T>[];
  vues?: VueTable<T>[];
  actionsLigne?: (ligne: T) => (ActionLigne | null | false | undefined)[];
  lienLigne?: (ligne: T) => string | undefined;
  exportCsv?: { nomFichier: string };
  barreOutils?: ReactNode;
  tailleDePage?: number;
  triParDefaut?: { cle: string; direction: "asc" | "desc" };
  vide?: { titre: string; description?: string; action?: ReactNode };
  // Synchronise recherche/filtres/vue/tri/page dans l'URL (partageable,
  // conservé au retour arrière). Désactivable si plusieurs tables par page.
  synchroniserUrl?: boolean;
}

const ALIGNEMENTS = { left: "text-left", right: "text-right", center: "text-center" } as const;
const TAILLES_PAGE = [10, 25, 50, 100];
const SEPARATEUR = "~";

function valeursFiltre<T>(filtre: FiltreTable<T>, ligne: T): string[] {
  const v = filtre.valeur(ligne);
  if (v === null || v === undefined) return [];
  return Array.isArray(v) ? v : [v];
}

function lireEtatUrl(params: URLSearchParams | null, filtres: FiltreTable<unknown>[]) {
  const actifs: Record<string, string[]> = {};
  for (const f of filtres) {
    const brut = params?.get(`f.${f.cle}`);
    if (brut) actifs[f.cle] = brut.split(SEPARATEUR).filter(Boolean);
  }
  const tri = params?.get("tri");
  const [cleTri, dirTri] = tri ? tri.split(".") : [];
  return {
    recherche: params?.get("q") ?? "",
    vue: params?.get("vue") ?? null,
    actifs,
    tri:
      cleTri && (dirTri === "asc" || dirTri === "desc")
        ? { cle: cleTri, direction: dirTri as "asc" | "desc" }
        : null,
    // « tri=aucun » : l'utilisateur a explicitement retiré le tri par défaut.
    triAucun: tri === "aucun",
    page: Math.max(1, Number(params?.get("page")) || 1),
    taille: TAILLES_PAGE.includes(Number(params?.get("taille"))) ? Number(params?.get("taille")) : null,
  };
}

function echapperCsv(valeur: string | number): string {
  const texte = String(valeur);
  return /[";\n\r]/.test(texte) ? `"${texte.replace(/"/g, '""')}"` : texte;
}

function pagesVisibles(courante: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, courante - 1, courante, courante + 1]);
  const triees = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const resultat: (number | "…")[] = [];
  triees.forEach((p, i) => {
    if (i > 0 && p - triees[i - 1] > 1) resultat.push("…");
    resultat.push(p);
  });
  return resultat;
}

export function DataTable<T>({
  id,
  colonnes,
  lignes,
  cleLigne,
  rechercheEspaceReserve = "Rechercher…",
  filtres = [],
  vues,
  actionsLigne,
  lienLigne,
  exportCsv,
  barreOutils,
  tailleDePage = 10,
  triParDefaut,
  vide,
  synchroniserUrl = true,
}: DataTableProps<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [etatInitial] = useState(() =>
    lireEtatUrl(synchroniserUrl ? searchParams : null, filtres as FiltreTable<unknown>[]),
  );
  const [recherche, setRecherche] = useState(etatInitial.recherche);
  const [vue, setVue] = useState<string | null>(
    etatInitial.vue && vues?.some((v) => v.cle === etatInitial.vue) ? etatInitial.vue : null,
  );
  const [actifs, setActifs] = useState<Record<string, string[]>>(etatInitial.actifs);
  const [tri, setTri] = useState<{ cle: string; direction: "asc" | "desc" } | null>(
    etatInitial.triAucun ? null : (etatInitial.tri ?? triParDefaut ?? null),
  );
  const [page, setPage] = useState(etatInitial.page);
  const [taille, setTaille] = useState(etatInitial.taille ?? tailleDePage);

  const [masqueesBrut, setMasqueesBrut] = usePreferenceLocale(
    `dps:table:${id}:colonnes`,
    JSON.stringify(colonnes.filter((c) => c.masqueeParDefaut).map((c) => c.cle)),
  );
  const masquees = useMemo<string[]>(() => {
    try {
      const v = JSON.parse(masqueesBrut);
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  }, [masqueesBrut]);
  const [densite, setDensite] = usePreferenceLocale(`dps:table:${id}:densite`, "confortable");
  const compact = densite === "compact";

  // Écriture de l'état dans l'URL sans navigation serveur (replaceState natif,
  // pris en charge par le routeur Next) : aucun rechargement de données.
  useEffect(() => {
    if (!synchroniserUrl) return;
    const params = new URLSearchParams(window.location.search);
    const definir = (cle: string, valeur: string | null) => {
      if (valeur) params.set(cle, valeur);
      else params.delete(cle);
    };
    definir("q", recherche.trim() || null);
    definir("vue", vue);
    for (const f of filtres) definir(`f.${f.cle}`, actifs[f.cle]?.length ? actifs[f.cle].join(SEPARATEUR) : null);
    const triDefautStr = triParDefaut ? `${triParDefaut.cle}.${triParDefaut.direction}` : null;
    const triStr = tri ? `${tri.cle}.${tri.direction}` : null;
    definir("tri", triStr !== triDefautStr ? triStr ?? "aucun" : null);
    definir("page", page > 1 ? String(page) : null);
    definir("taille", taille !== tailleDePage ? String(taille) : null);
    const chaine = params.toString();
    const cible = `${pathname}${chaine ? `?${chaine}` : ""}`;
    if (cible !== `${window.location.pathname}${window.location.search}`) {
      window.history.replaceState(window.history.state, "", cible);
    }
  }, [synchroniserUrl, recherche, vue, actifs, tri, page, taille, filtres, pathname, triParDefaut, tailleDePage]);

  const colonnesVisibles = colonnes.filter((c) => c.masquable === false || !masquees.includes(c.cle));
  const colonnesMasquables = colonnes.filter((c) => c.masquable !== false);

  // Pipeline : vue → recherche → filtres (compteurs de facettes calculés en
  // excluant le filtre concerné, comme sur les plateformes de référence).
  const lignesVue = useMemo(() => {
    const def = vues?.find((v) => v.cle === vue) ?? vues?.[0];
    return def?.filtre ? lignes.filter(def.filtre) : lignes;
  }, [lignes, vues, vue]);

  const lignesRecherche = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (!q) return lignesVue;
    return lignesVue.filter((l) => colonnes.some((c) => c.valeurRecherche?.(l).toLowerCase().includes(q)));
  }, [lignesVue, recherche, colonnes]);

  function appliquerFiltres(source: T[], sauf?: string) {
    return source.filter((l) =>
      filtres.every((f) => {
        if (f.cle === sauf) return true;
        const choisis = actifs[f.cle];
        if (!choisis?.length) return true;
        const valeurs = valeursFiltre(f, l);
        return valeurs.some((v) => choisis.includes(v));
      }),
    );
  }

  const lignesFiltrees = appliquerFiltres(lignesRecherche);

  const lignesTriees = useMemo(() => {
    if (!tri) return lignesFiltrees;
    const colonne = colonnes.find((c) => c.cle === tri.cle);
    if (!colonne?.valeurTri) return lignesFiltrees;
    return [...lignesFiltrees].sort((a, b) => {
      const va = colonne.valeurTri!(a);
      const vb = colonne.valeurTri!(b);
      const cmp =
        typeof va === "number" && typeof vb === "number"
          ? va - vb
          : String(va).localeCompare(String(vb), "fr", { sensitivity: "base", numeric: true });
      return tri.direction === "asc" ? cmp : -cmp;
    });
  }, [lignesFiltrees, tri, colonnes]);

  const total = lignesTriees.length;
  const totalPages = Math.max(1, Math.ceil(total / taille));
  const pageCourante = Math.min(page, totalPages);
  const debut = (pageCourante - 1) * taille;
  const lignesPage = lignesTriees.slice(debut, debut + taille);

  const nbFiltresActifs = Object.values(actifs).reduce((s, v) => s + v.length, 0);
  const filtrage = recherche.trim() !== "" || nbFiltresActifs > 0;

  function basculerTri(cle: string) {
    setTri((p) => {
      if (!p || p.cle !== cle) return { cle, direction: "asc" };
      if (p.direction === "asc") return { cle, direction: "desc" };
      return null;
    });
    setPage(1);
  }

  function basculerOption(cleFiltre: string, valeur: string) {
    setActifs((p) => {
      const courant = p[cleFiltre] ?? [];
      const suivant = courant.includes(valeur) ? courant.filter((v) => v !== valeur) : [...courant, valeur];
      return { ...p, [cleFiltre]: suivant };
    });
    setPage(1);
  }

  function reinitialiser() {
    setRecherche("");
    setActifs({});
    setPage(1);
  }

  function basculerColonne(cle: string) {
    const suivant = masquees.includes(cle) ? masquees.filter((c) => c !== cle) : [...masquees, cle];
    setMasqueesBrut(JSON.stringify(suivant));
  }

  function exporter() {
    if (!exportCsv) return;
    const cols = colonnesVisibles.filter((c) => c.valeurExport || c.valeurTri || c.valeurRecherche);
    const lignesCsv = [
      cols.map((c) => echapperCsv(c.entete)).join(";"),
      ...lignesTriees.map((l) =>
        cols.map((c) => echapperCsv((c.valeurExport ?? c.valeurTri ?? c.valeurRecherche)!(l))).join(";"),
      ),
    ];
    // BOM UTF-8 + séparateur « ; » : ouverture correcte des accents dans Excel (fr).
    const blob = new Blob([`﻿${lignesCsv.join("\r\n")}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportCsv.nomFichier}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function surClicLigne(e: ReactMouseEvent, ligne: T) {
    const href = lienLigne?.(ligne);
    if (!href) return;
    if ((e.target as HTMLElement).closest("a,button,input,select,textarea,label,form,[data-pas-de-clic]")) return;
    if (window.getSelection()?.toString()) return; // sélection de texte : pas de navigation
    if (e.metaKey || e.ctrlKey) window.open(href, "_blank");
    else router.push(href);
  }

  const cellule = compact ? "px-4 py-2" : "px-4 py-3.5";

  return (
    <div>
      {vues && vues.length > 1 && (
        <div role="tablist" className="scrollbar-fin -mx-1 mb-4 flex gap-1 overflow-x-auto px-1 pb-px">
          {vues.map((v, i) => {
            const actif = (vue ?? vues[0].cle) === v.cle;
            const n = v.filtre ? lignes.filter(v.filtre).length : lignes.length;
            return (
              <button
                key={v.cle}
                type="button"
                role="tab"
                aria-selected={actif}
                onClick={() => {
                  setVue(i === 0 ? null : v.cle);
                  setPage(1);
                }}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  actif ? "bg-text text-surface" : "text-text-muted hover:bg-surface hover:text-text"
                }`}
              >
                {v.label}
                <span
                  className={`rounded-full px-1.5 text-xs tabular-nums ${
                    actif ? "bg-surface/20 text-surface" : "bg-bg-subtle text-text-faint"
                  }`}
                >
                  {n}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-card)] lg:overflow-visible">
        {/* Barre d'outils */}
        <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <label className="relative w-full sm:w-72">
              <span className="sr-only">{rechercheEspaceReserve}</span>
              <IconSearch
                width={16}
                height={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-faint"
              />
              <input
                type="search"
                value={recherche}
                onChange={(e) => {
                  setRecherche(e.target.value);
                  setPage(1);
                }}
                placeholder={rechercheEspaceReserve}
                className="h-9 w-full rounded-[var(--radius-md)] border border-border bg-bg-subtle/60 pl-9 pr-3 text-sm text-text placeholder:text-text-faint transition-colors focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary-soft"
              />
            </label>

            {filtres.map((f) => {
              const choisis = actifs[f.cle] ?? [];
              const base = appliquerFiltres(lignesRecherche, f.cle);
              return (
                <Dropdown
                  key={f.cle}
                  align="left"
                  className="w-64"
                  trigger={({ ouvert, toggle }) => (
                    <button
                      type="button"
                      onClick={toggle}
                      aria-expanded={ouvert}
                      className={`inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-md)] border px-3 text-sm font-medium transition-colors ${
                        choisis.length
                          ? "border-primary/30 bg-primary-soft text-primary"
                          : "border-dashed border-border text-text-muted hover:border-text-faint hover:text-text"
                      }`}
                    >
                      <IconFilter width={15} height={15} />
                      {f.label}
                      {choisis.length > 0 && (
                        <span className="rounded-full bg-primary px-1.5 text-[0.6875rem] font-semibold text-primary-foreground tabular-nums">
                          {choisis.length}
                        </span>
                      )}
                    </button>
                  )}
                >
                  <div className="p-1.5">
                    <p className="px-2.5 pb-1.5 pt-1 text-xs font-semibold uppercase tracking-wide text-text-faint">
                      {f.label}
                    </p>
                    <div className="scrollbar-fin max-h-72 overflow-y-auto">
                      {f.options.map((o) => {
                        const coche = choisis.includes(o.valeur);
                        const n = base.filter((l) => valeursFiltre(f, l).includes(o.valeur)).length;
                        return (
                          <button
                            key={o.valeur}
                            type="button"
                            role="menuitemcheckbox"
                            aria-checked={coche}
                            onClick={() => basculerOption(f.cle, o.valeur)}
                            className="flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-left text-sm text-text transition-colors hover:bg-bg-subtle"
                          >
                            <span
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
                                coche ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface"
                              }`}
                            >
                              {coche && <IconCheck width={12} height={12} strokeWidth={2.4} />}
                            </span>
                            <span className="min-w-0 flex-1 truncate">{o.label}</span>
                            <span className="text-xs text-text-faint tabular-nums">{n}</span>
                          </button>
                        );
                      })}
                    </div>
                    {choisis.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setActifs((p) => ({ ...p, [f.cle]: [] }));
                          setPage(1);
                        }}
                        className="mt-1 w-full border-t border-border px-2.5 pb-1 pt-2.5 text-center text-xs font-medium text-text-muted transition-colors hover:text-text"
                      >
                        Effacer ce filtre
                      </button>
                    )}
                  </div>
                </Dropdown>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {barreOutils}
            {exportCsv && (
              <button
                type="button"
                onClick={exporter}
                disabled={total === 0}
                className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-md)] border border-border px-3 text-sm font-medium text-text-muted transition-colors hover:border-text-faint hover:text-text disabled:opacity-40"
              >
                <IconDownload width={15} height={15} />
                <span className="hidden sm:inline">Exporter</span>
              </button>
            )}
            <Dropdown
              className="w-60"
              trigger={({ ouvert, toggle }) => (
                <button
                  type="button"
                  onClick={toggle}
                  aria-expanded={ouvert}
                  aria-label="Affichage"
                  className="hidden h-9 items-center gap-1.5 rounded-[var(--radius-md)] border border-border px-3 text-sm font-medium text-text-muted transition-colors hover:border-text-faint hover:text-text md:inline-flex"
                >
                  <IconColumns width={15} height={15} />
                  Affichage
                </button>
              )}
            >
              <div className="p-1.5">
                <p className="px-2.5 pb-1.5 pt-1 text-xs font-semibold uppercase tracking-wide text-text-faint">
                  Densité
                </p>
                <div className="mx-1 mb-2 grid grid-cols-2 gap-1 rounded-[var(--radius-md)] bg-bg-subtle p-1">
                  {(["confortable", "compact"] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDensite(d)}
                      className={`inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-sm)] py-1.5 text-xs font-medium capitalize transition-colors ${
                        densite === d ? "bg-surface text-text shadow-[var(--shadow-card)]" : "text-text-muted hover:text-text"
                      }`}
                    >
                      <IconDensity width={13} height={13} />
                      {d}
                    </button>
                  ))}
                </div>
                {colonnesMasquables.length > 0 && (
                  <>
                    <p className="border-t border-border px-2.5 pb-1.5 pt-2.5 text-xs font-semibold uppercase tracking-wide text-text-faint">
                      Colonnes
                    </p>
                    {colonnesMasquables.map((c) => {
                      const visible = !masquees.includes(c.cle);
                      return (
                        <button
                          key={c.cle}
                          type="button"
                          role="menuitemcheckbox"
                          aria-checked={visible}
                          onClick={() => basculerColonne(c.cle)}
                          className="flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-left text-sm text-text transition-colors hover:bg-bg-subtle"
                        >
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border ${
                              visible ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface"
                            }`}
                          >
                            {visible && <IconCheck width={12} height={12} strokeWidth={2.4} />}
                          </span>
                          {c.entete}
                        </button>
                      );
                    })}
                  </>
                )}
              </div>
            </Dropdown>
          </div>
        </div>

        {/* Puces des filtres actifs */}
        {filtrage && (
          <div className="flex flex-wrap items-center gap-2 border-b border-border bg-bg-subtle/40 px-3 py-2.5 sm:px-4">
            {recherche.trim() && (
              <PuceFiltre
                libelle={`Recherche : « ${recherche.trim()} »`}
                onRetirer={() => {
                  setRecherche("");
                  setPage(1);
                }}
              />
            )}
            {filtres.flatMap((f) =>
              (actifs[f.cle] ?? []).map((v) => (
                <PuceFiltre
                  key={`${f.cle}-${v}`}
                  libelle={`${f.label} : ${f.options.find((o) => o.valeur === v)?.label ?? v}`}
                  onRetirer={() => basculerOption(f.cle, v)}
                />
              )),
            )}
            <button
              type="button"
              onClick={reinitialiser}
              className="ml-auto text-xs font-medium text-text-muted transition-colors hover:text-text"
            >
              Tout réinitialiser
            </button>
          </div>
        )}

        {/* Table (écrans moyens et plus) */}
        <div className="hidden overflow-x-auto md:block lg:overflow-visible">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                {colonnesVisibles.map((c) => (
                  <th
                    key={c.cle}
                    scope="col"
                    style={c.largeur ? { width: c.largeur } : undefined}
                    className={`whitespace-nowrap bg-bg-subtle/70 px-4 py-2.5 text-xs font-semibold text-text-muted lg:sticky lg:top-16 lg:z-[5] lg:backdrop-blur ${ALIGNEMENTS[c.alignement ?? "left"]}`}
                  >
                    {c.valeurTri ? (
                      <button
                        type="button"
                        onClick={() => basculerTri(c.cle)}
                        className={`group inline-flex items-center gap-1 transition-colors hover:text-text ${
                          tri?.cle === c.cle ? "text-text" : ""
                        }`}
                      >
                        {c.entete}
                        {tri?.cle === c.cle ? (
                          tri.direction === "asc" ? (
                            <IconArrowUp width={13} height={13} />
                          ) : (
                            <IconArrowDown width={13} height={13} />
                          )
                        ) : (
                          <IconSortable width={13} height={13} className="opacity-0 transition-opacity group-hover:opacity-60" />
                        )}
                      </button>
                    ) : (
                      c.entete
                    )}
                  </th>
                ))}
                {actionsLigne && (
                  <th className="w-12 bg-bg-subtle/70 px-2 py-2.5 lg:sticky lg:top-16 lg:z-[5] lg:backdrop-blur">
                    <span className="sr-only">Actions</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {lignesPage.map((ligne) => {
                const cliquable = Boolean(lienLigne?.(ligne));
                return (
                  <tr
                    key={cleLigne(ligne)}
                    onClick={cliquable ? (e) => surClicLigne(e, ligne) : undefined}
                    className={`group border-b border-border transition-colors last:border-0 hover:bg-bg-subtle/60 ${
                      cliquable ? "cursor-pointer" : ""
                    }`}
                  >
                    {colonnesVisibles.map((c) => (
                      <td key={c.cle} className={`${cellule} align-middle ${ALIGNEMENTS[c.alignement ?? "left"]}`}>
                        {c.render(ligne)}
                      </td>
                    ))}
                    {actionsLigne && (
                      <td className="px-2 py-1 text-right align-middle">
                        <MenuActions actions={actionsLigne(ligne)} />
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Cartes (mobile) */}
        <ul className="divide-y divide-border md:hidden">
          {lignesPage.map((ligne) => {
            const [premiere, ...autres] = colonnesVisibles.filter((c) => c.mobile !== false);
            // Pas de lien englobant : la première colonne contient souvent déjà
            // un lien (un <a> dans un <a> casse l'hydratation). La carte entière
            // reste cliquable, comme une ligne de table.
            const cliquable = Boolean(lienLigne?.(ligne));
            return (
              <li
                key={cleLigne(ligne)}
                onClick={cliquable ? (e) => surClicLigne(e, ligne) : undefined}
                className={`relative p-4 ${cliquable ? "cursor-pointer active:bg-bg-subtle/60" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">{premiere?.render(ligne)}</div>
                  {actionsLigne && <MenuActions actions={actionsLigne(ligne)} />}
                </div>
                {autres.length > 0 && (
                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
                    {autres.map((c) => (
                      <div key={c.cle} className="min-w-0">
                        <dt className="text-[0.6875rem] font-medium uppercase tracking-wide text-text-faint">{c.entete}</dt>
                        <dd className="mt-0.5 text-sm text-text">{c.render(ligne)}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </li>
            );
          })}
        </ul>

        {/* États vides */}
        {total === 0 && (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-subtle text-text-faint">
              {filtrage || vue ? <IconSearch width={22} height={22} /> : <IconInbox width={22} height={22} />}
            </span>
            {filtrage ? (
              <>
                <p className="mt-4 text-sm font-semibold text-text">Aucun résultat</p>
                <p className="mt-1 max-w-sm text-sm text-text-muted">
                  Aucune ligne ne correspond à la recherche ou aux filtres appliqués.
                </p>
                <button
                  type="button"
                  onClick={reinitialiser}
                  className="mt-4 rounded-[var(--radius-md)] border border-border px-3.5 py-2 text-sm font-medium text-text transition-colors hover:bg-bg-subtle"
                >
                  Réinitialiser les filtres
                </button>
              </>
            ) : (
              <>
                <p className="mt-4 text-sm font-semibold text-text">{vide?.titre ?? "Aucune donnée pour l'instant"}</p>
                {vide?.description && <p className="mt-1 max-w-sm text-sm text-text-muted">{vide.description}</p>}
                {vide?.action && <div className="mt-4">{vide.action}</div>}
              </>
            )}
          </div>
        )}

        {/* Pied : compte + pagination */}
        {total > 0 && (
          <div className="flex flex-col gap-3 border-t border-border px-3 py-3 text-sm text-text-muted sm:flex-row sm:items-center sm:justify-between sm:px-4">
            <div className="flex items-center gap-3">
              <span className="tabular-nums">
                <span className="font-medium text-text">
                  {debut + 1} à {Math.min(debut + taille, total)}
                </span>{" "}
                sur <span className="font-medium text-text">{total}</span>
                {total !== lignes.length && <span className="text-text-faint"> (filtré sur {lignes.length})</span>}
              </span>
              <label className="hidden items-center gap-1.5 sm:flex">
                <span className="text-text-faint">Lignes</span>
                <select
                  value={taille}
                  onChange={(e) => {
                    setTaille(Number(e.target.value));
                    setPage(1);
                  }}
                  className="h-8 rounded-[var(--radius-sm)] border border-border bg-surface px-1.5 text-sm text-text focus:border-primary focus:outline-none"
                >
                  {TAILLES_PAGE.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {totalPages > 1 && (
              <nav aria-label="Pagination" className="flex items-center gap-1">
                <BoutonPage
                  label="Page précédente"
                  disabled={pageCourante === 1}
                  onClick={() => setPage(pageCourante - 1)}
                >
                  <IconChevronLeft width={16} height={16} />
                </BoutonPage>
                {pagesVisibles(pageCourante, totalPages).map((p, i) =>
                  p === "…" ? (
                    <span key={`e${i}`} className="px-1.5 text-text-faint">
                      …
                    </span>
                  ) : (
                    <BoutonPage key={p} label={`Page ${p}`} actif={p === pageCourante} onClick={() => setPage(p)}>
                      {p}
                    </BoutonPage>
                  ),
                )}
                <BoutonPage
                  label="Page suivante"
                  disabled={pageCourante === totalPages}
                  onClick={() => setPage(pageCourante + 1)}
                >
                  <IconChevronRight width={16} height={16} />
                </BoutonPage>
              </nav>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PuceFiltre({ libelle, onRetirer }: { libelle: string; onRetirer: () => void }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-border bg-surface py-1 pl-3 pr-1 text-xs font-medium text-text">
      <span className="truncate">{libelle}</span>
      <button
        type="button"
        onClick={onRetirer}
        aria-label={`Retirer : ${libelle}`}
        className="rounded-full p-0.5 text-text-faint transition-colors hover:bg-bg-subtle hover:text-text"
      >
        <IconClose width={12} height={12} />
      </button>
    </span>
  );
}

function BoutonPage({
  children,
  label,
  onClick,
  disabled,
  actif,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  actif?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={actif ? "page" : undefined}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-[var(--radius-sm)] px-2 text-sm font-medium tabular-nums transition-colors disabled:pointer-events-none disabled:opacity-35 ${
        actif ? "bg-text text-surface" : "text-text-muted hover:bg-bg-subtle hover:text-text"
      }`}
    >
      {children}
    </button>
  );
}

// Menu « ⋯ » d'une ligne. Rendu dans un portail en position fixe : il n'est
// jamais rogné par le conteneur à défilement horizontal de la table.
function MenuActions({ actions }: { actions: (ActionLigne | null | false | undefined)[] }) {
  const valides = actions.filter((a): a is ActionLigne => Boolean(a));
  const [position, setPosition] = useState<{ top: number; right: number; versLeHaut: boolean } | null>(null);
  const boutonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!position) return;
    function fermerSiExterieur(e: MouseEvent) {
      const cible = e.target as Node;
      if (menuRef.current?.contains(cible) || boutonRef.current?.contains(cible)) return;
      setPosition(null);
    }
    function fermer() {
      setPosition(null);
    }
    function surTouche(e: KeyboardEvent) {
      if (e.key === "Escape") setPosition(null);
    }
    document.addEventListener("mousedown", fermerSiExterieur);
    document.addEventListener("keydown", surTouche);
    window.addEventListener("scroll", fermer, true);
    window.addEventListener("resize", fermer);
    return () => {
      document.removeEventListener("mousedown", fermerSiExterieur);
      document.removeEventListener("keydown", surTouche);
      window.removeEventListener("scroll", fermer, true);
      window.removeEventListener("resize", fermer);
    };
  }, [position]);

  if (valides.length === 0) return <span className="inline-block h-8 w-8" aria-hidden />;

  function ouvrir() {
    const r = boutonRef.current?.getBoundingClientRect();
    if (!r) return;
    const hauteurEstimee = valides.length * 38 + 12;
    const versLeHaut = r.bottom + hauteurEstimee > window.innerHeight - 8;
    setPosition({ top: versLeHaut ? r.top - 6 : r.bottom + 6, right: window.innerWidth - r.right, versLeHaut });
  }

  return (
    <>
      <button
        ref={boutonRef}
        type="button"
        aria-label="Actions"
        aria-haspopup="menu"
        aria-expanded={position !== null}
        onClick={() => (position ? setPosition(null) : ouvrir())}
        className={`inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-text-faint transition-colors hover:bg-bg-subtle hover:text-text ${
          position ? "bg-bg-subtle text-text" : ""
        }`}
      >
        <IconDots width={18} height={18} />
      </button>
      {position &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{
              position: "fixed",
              right: position.right,
              ...(position.versLeHaut ? { bottom: window.innerHeight - position.top } : { top: position.top }),
            }}
            className="z-[60] min-w-48 overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface p-1 shadow-[var(--shadow-elevated)]"
          >
            {valides.map((a, i) => {
              const Icone = a.icone;
              const classes = `flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-left text-sm transition-colors ${
                a.danger ? "text-danger hover:bg-danger-soft" : "text-text hover:bg-bg-subtle"
              }`;
              const contenu = (
                <>
                  {Icone && <Icone width={16} height={16} className={a.danger ? "" : "text-text-faint"} />}
                  {a.label}
                </>
              );
              const separateur = a.danger && i > 0 && !valides[i - 1].danger;
              return (
                <div key={a.label}>
                  {separateur && <div className="my-1 border-t border-border" />}
                  {a.href ? (
                    <Link role="menuitem" href={a.href} className={classes} onClick={() => setPosition(null)}>
                      {contenu}
                    </Link>
                  ) : (
                    <button
                      role="menuitem"
                      type="button"
                      className={classes}
                      onClick={() => {
                        setPosition(null);
                        a.onSelect?.();
                      }}
                    >
                      {contenu}
                    </button>
                  )}
                </div>
              );
            })}
          </div>,
          document.body,
        )}
    </>
  );
}

// Squelette de table pour les loading.tsx et états de chargement.
export function DataTableSkeleton({ lignes = 6, colonnes = 5 }: { lignes?: number; colonnes?: number }) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-card)]">
      <div className="flex gap-2 border-b border-border p-4">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: lignes }, (_, i) => (
          <div key={i} className="flex items-center gap-6 px-4 py-4">
            {Array.from({ length: colonnes }, (_, j) => (
              <Skeleton key={j} className={`h-4 ${j === 0 ? "w-48" : "flex-1"}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
