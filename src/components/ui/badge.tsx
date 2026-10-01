import type { ReactNode } from "react";

export type BadgeVariant = "primary" | "success" | "warning" | "danger" | "info" | "neutral";

const VARIANTS: Record<BadgeVariant, string> = {
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  neutral: "bg-bg-subtle text-text-faint",
};

// Primitive générique (Phase 2) — les badges métier (gravité EI, risque NEWS,
// statut de réservation…) deviennent de fins wrappers qui mappent leur enum
// vers une variante sémantique, voir components/ei|news|reservations/badges.tsx.
export function Badge({
  variant = "neutral",
  className = "",
  children,
}: {
  variant?: BadgeVariant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${VARIANTS[variant]} ${className}`}>
      {children}
    </span>
  );
}
