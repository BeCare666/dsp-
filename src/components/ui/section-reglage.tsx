import type { ReactNode } from "react";

// Section d'une page de réglages (profil, paramètres, sécurité…) : intitulé
// et explication à gauche, contenu à droite sur grand écran ; empilés sur
// mobile. Les formulaires existants gardent leur propre carte.
export function SectionReglage({
  titre,
  description,
  children,
}: {
  titre: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-5 border-b border-border py-8 first:pt-0 last:border-0 last:pb-0 lg:grid-cols-3 lg:gap-10">
      <div>
        <h2 className="font-display text-base font-semibold text-text">{titre}</h2>
        {description && <p className="mt-1.5 text-sm leading-6 text-text-muted">{description}</p>}
      </div>
      <div className="min-w-0 lg:col-span-2">{children}</div>
    </section>
  );
}
