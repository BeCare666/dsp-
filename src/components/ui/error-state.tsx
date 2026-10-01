import type { ReactNode } from "react";
import { IconAlertTriangle } from "@/components/icons";

export function ErrorState({
  titre = "Une erreur est survenue",
  description = "Réessayez dans quelques instants. Si le problème persiste, contactez le support.",
  action,
}: {
  titre?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-danger/20 bg-danger-soft/40 px-6 py-12 text-center">
      <IconAlertTriangle width={28} height={28} className="text-danger" />
      <div>
        <p className="text-sm font-semibold text-text">{titre}</p>
        <p className="mt-1 max-w-sm text-sm text-text-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
