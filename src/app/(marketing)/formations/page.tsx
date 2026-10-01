import type { Metadata } from "next";
import Link from "next/link";
import { apiFetchJson } from "@/lib/api-server";
import { formaterFcfa } from "@/lib/format";
import { Reveal } from "@/components/motion/reveal";
import type { Formation } from "@/lib/types";

export const metadata: Metadata = {
  title: "Formations",
  description: "Catalogue des formations à la sécurité des patients proposées par DSP, en réservation individuelle ou en groupe.",
};

async function obtenirFormations(): Promise<Formation[]> {
  try {
    return await apiFetchJson<Formation[]>("/formations");
  } catch {
    return [];
  }
}

export default async function FormationsPage() {
  const formations = await obtenirFormations();

  return (
    <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
      <Reveal className="max-w-xl">
        <span className="text-xs font-medium uppercase tracking-wide text-text-faint">Catalogue</span>
        <h1 className="mt-3 font-display text-3xl font-bold text-text sm:text-4xl">Formations</h1>
        <p className="mt-4 text-base leading-7 text-text-muted">
          Des formations continues pour ancrer les bonnes pratiques de sécurité des patients dans vos équipes,
          en individuel ou en groupe.
        </p>
      </Reveal>

      {formations.length === 0 ? (
        <Reveal className="mt-12">
          <p className="rounded-[var(--radius-lg)] border border-dashed border-border bg-bg-subtle px-6 py-10 text-center text-sm text-text-muted">
            Aucune formation disponible pour le moment. Revenez bientôt.
          </p>
        </Reveal>
      ) : (
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {formations.map((formation, i) => (
            <Reveal key={formation.id} delay={i * 0.06}>
              <Link
                href={`/formations/${formation.id}`}
                className="flex h-full flex-col rounded-[var(--radius-lg)] border border-border bg-surface p-6 transition-colors hover:border-primary/30"
              >
                <h2 className="font-display text-lg font-semibold text-text">{formation.titre}</h2>
                {formation.dureeHeures && (
                  <span className="mt-1 text-xs font-medium text-text-faint">{formation.dureeHeures} heures</span>
                )}
                <p className="mt-3 flex-1 text-sm leading-6 text-text-muted">{formation.description}</p>
                <div className="mt-5 border-t border-border pt-4">
                  <span className="text-xs font-medium uppercase tracking-wide text-text-faint">À partir de</span>
                  <p className="mt-1 font-display text-xl font-bold text-primary">
                    {formaterFcfa(formation.prixIndividuel)}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
