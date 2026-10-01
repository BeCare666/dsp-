import type { ReactNode } from "react";

// Pages destinées à l'impression : aucune coquille (barre latérale, en-tête),
// fond blanc. L'accès reste protégé par proxy.ts (préfixes protégés).
export default function ImpressionLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-white text-black">{children}</div>;
}
