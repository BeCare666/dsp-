import type { ReactNode } from "react";
import { Breadcrumb, type BreadcrumbItem } from "@/components/ui/breadcrumb";

// En-tête standard de toute page de dashboard (admin + établissement) :
// fil d'Ariane, sur-titre, titre, description, actions à droite, et une zone
// optionnelle sous le titre (onglets, filtres rapides). Aucune page de
// dashboard ne doit rester sans titre visible.
interface PageHeaderProps {
  titre: ReactNode;
  surtitre?: string;
  description?: ReactNode;
  filAriane?: BreadcrumbItem[];
  actions?: ReactNode;
  children?: ReactNode;
}

export function PageHeader({ titre, surtitre, description, filAriane, actions, children }: PageHeaderProps) {
  return (
    <header className="mb-8">
      {filAriane && filAriane.length > 0 && (
        <div className="mb-4">
          <Breadcrumb items={filAriane} />
        </div>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {surtitre && (
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">{surtitre}</p>
          )}
          <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-text sm:text-[1.75rem]">{titre}</h1>
          {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>}
      </div>
      {children && <div className="mt-6">{children}</div>}
    </header>
  );
}
