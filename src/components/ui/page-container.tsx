import type { ReactNode } from "react";

// Conteneur des pages établissement : mêmes marges et même largeur maximale
// que le conteneur posé par AdminShell pour les pages admin, pour un rythme
// identique dans les deux dashboards. `largeur` borne le contenu interne :
// formulaire (lecture confortable), detail (fiche), large (listes, dashboards).
const LARGEURS = {
  formulaire: "max-w-2xl",
  detail: "max-w-4xl",
  large: "",
} as const;

export function PageContainer({
  largeur = "large",
  children,
}: {
  largeur?: keyof typeof LARGEURS;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-5 py-8 sm:px-8">
      <div className={`mx-auto ${LARGEURS[largeur]}`}>{children}</div>
    </div>
  );
}
