import type { ReactNode } from "react";

// Phase 2 — état vide "pédagogique" (règle §19 du prompt maître : jamais un
// simple "Aucune donnée.", toujours pourquoi + quoi faire).
export function EmptyState({
  icon,
  titre,
  description,
  action,
}: {
  icon?: ReactNode;
  titre: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-border px-6 py-12 text-center">
      {icon && <div className="text-text-faint">{icon}</div>}
      <div>
        <p className="text-sm font-semibold text-text">{titre}</p>
        <p className="mt-1 max-w-sm text-sm text-text-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
