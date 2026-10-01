import Link from "next/link";
import type { ComponentType, ReactNode, SVGProps } from "react";

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-[var(--shadow-card)] ${className}`}
    >
      {children}
    </div>
  );
}

// En-tête de carte (titre de section + action optionnelle à droite).
export function CardHeader({ titre, description, action }: { titre: ReactNode; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 className="font-display text-base font-semibold text-text">{titre}</h2>
        {description && <p className="mt-0.5 text-xs text-text-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export type TonStat = "primary" | "success" | "warning" | "danger" | "info" | "accent" | "neutral";

const TONS: Record<TonStat, string> = {
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  accent: "bg-accent-soft text-accent",
  neutral: "bg-bg-subtle text-text-muted",
};

interface StatCardProps {
  label: string;
  valeur: string;
  sousTexte?: ReactNode;
  icone?: ComponentType<SVGProps<SVGSVGElement>>;
  ton?: TonStat;
  href?: string;
}

// Indicateur chiffré. Valeurs réelles uniquement : pas de variation affichée
// tant que l'API ne fournit pas de série temporelle (décision 6.0).
export function StatCard({ label, valeur, sousTexte, icone: Icone, ton = "primary", href }: StatCardProps) {
  const contenu = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.8125rem] font-medium text-text-muted">{label}</p>
        {Icone && (
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] ${TONS[ton]}`}>
            <Icone width={18} height={18} />
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-[1.75rem] font-bold leading-none tracking-tight text-text tabular-nums">{valeur}</p>
      {sousTexte && <p className="mt-2 text-xs text-text-faint">{sousTexte}</p>}
    </>
  );

  const classes =
    "block h-full rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]";

  if (href) {
    return (
      <Link
        href={href}
        className={`${classes} transition-[border-color,box-shadow] hover:border-primary/30 hover:shadow-[var(--shadow-soft)]`}
      >
        {contenu}
      </Link>
    );
  }
  return <div className={classes}>{contenu}</div>;
}
