import type { ReactNode } from "react";
import { IconAlertTriangle } from "@/components/icons";

type AlertVariant = "info" | "success" | "warning" | "danger";

const VARIANTS: Record<AlertVariant, string> = {
  info: "border-info/20 bg-info-soft text-info",
  success: "border-success/20 bg-success-soft text-success",
  warning: "border-warning/20 bg-warning-soft text-warning",
  danger: "border-danger/20 bg-danger-soft text-danger",
};

// Bannière statique (page/formulaire) — distinct de Toast (ui/toast.tsx), qui
// est transitoire et flotte au-dessus du contenu.
export function Alert({
  variant = "info",
  titre,
  children,
}: {
  variant?: AlertVariant;
  titre?: string;
  children: ReactNode;
}) {
  return (
    <div className={`flex items-start gap-3 rounded-[var(--radius-md)] border px-4 py-3 text-sm ${VARIANTS[variant]}`}>
      <IconAlertTriangle width={18} height={18} className="mt-0.5 shrink-0" />
      <div>
        {titre && <p className="font-semibold">{titre}</p>}
        <div className={titre ? "mt-0.5" : ""}>{children}</div>
      </div>
    </div>
  );
}
