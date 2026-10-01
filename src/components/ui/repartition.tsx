import Link from "next/link";

export type TonRepartition = "primary" | "success" | "warning" | "danger" | "info" | "accent" | "neutral";

const TONS: Record<TonRepartition, string> = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  accent: "bg-accent",
  neutral: "bg-text-faint",
};

export interface ElementRepartition {
  cle: string;
  label: string;
  valeur: number;
  ton?: TonRepartition;
  href?: string;
}

// Répartition en barres horizontales (part de chaque valeur dans le total).
// Rendu serveur, sans librairie de graphiques : lisible, responsive, et
// chaque ligne peut mener à la liste filtrée correspondante.
// `pourcentage={false}` quand les catégories se recouvrent (ex. un utilisateur
// peut avoir plusieurs rôles) : la barre est alors relative à la plus grande
// valeur et aucun pourcentage trompeur n'est affiché.
export function Repartition({
  elements,
  vide = "Aucune donnée pour l'instant.",
  pourcentage = true,
}: {
  elements: ElementRepartition[];
  vide?: string;
  pourcentage?: boolean;
}) {
  const total = elements.reduce((s, e) => s + e.valeur, 0);
  const max = Math.max(0, ...elements.map((e) => e.valeur));
  if (elements.length === 0 || total === 0) {
    return <p className="py-6 text-center text-sm text-text-faint">{vide}</p>;
  }

  return (
    <ul className="flex flex-col gap-3.5">
      {elements.map((e) => {
        const part = Math.round((e.valeur / total) * 100);
        const largeur = pourcentage ? part : Math.round((e.valeur / max) * 100);
        const contenu = (
          <>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 truncate text-text-muted">{e.label}</span>
              <span className="shrink-0 tabular-nums">
                <span className="font-semibold text-text">{e.valeur}</span>
                {pourcentage && <span className="ml-1.5 text-xs text-text-faint">{part}%</span>}
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-bg-subtle">
              <div
                className={`h-full rounded-full ${TONS[e.ton ?? "primary"]}`}
                style={{ width: `${e.valeur === 0 ? 0 : Math.max(2, largeur)}%` }}
              />
            </div>
          </>
        );
        return (
          <li key={e.cle}>
            {e.href ? (
              <Link href={e.href} className="block rounded-[var(--radius-sm)] transition-opacity hover:opacity-80">
                {contenu}
              </Link>
            ) : (
              contenu
            )}
          </li>
        );
      })}
    </ul>
  );
}
