import type { ReactNode } from "react";

// Liste de propriétés d'une fiche (libellé au-dessus de la valeur), en une ou
// deux colonnes. Une valeur absente s'affiche en texte atténué.
export function ListeProprietes({
  elements,
  colonnes = 1,
}: {
  elements: { label: string; valeur: ReactNode; vide?: string }[];
  colonnes?: 1 | 2;
}) {
  return (
    <dl className={`grid gap-x-6 gap-y-4 ${colonnes === 2 ? "sm:grid-cols-2" : ""}`}>
      {elements.map((e) => (
        <div key={e.label} className="min-w-0">
          <dt className="text-xs font-medium text-text-faint">{e.label}</dt>
          <dd className="mt-1 break-words text-sm text-text">
            {e.valeur === null || e.valeur === undefined || e.valeur === "" ? (
              <span className="text-text-faint">{e.vide ?? "Non renseigné"}</span>
            ) : (
              e.valeur
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
