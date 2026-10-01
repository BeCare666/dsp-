import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { apiFetchJson, ApiError } from "@/lib/api-server";
import { formaterFcfa } from "@/lib/format";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import type { Formation } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const formation = await apiFetchJson<Formation>(`/formations/${id}`);
    return { title: formation.titre, description: formation.description };
  } catch {
    return { title: "Formation" };
  }
}

export default async function FormationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let formation: Formation;
  try {
    formation = await apiFetchJson<Formation>(`/formations/${id}`);
  } catch (erreur) {
    if (erreur instanceof ApiError && erreur.status === 404) notFound();
    throw erreur;
  }

  const tarifs = [
    { label: "Individuel", prix: formation.prixIndividuel },
    { label: "Groupe de 5", prix: formation.prixGroupe5 },
    { label: "Groupe de 10", prix: formation.prixGroupe10 },
  ];

  return (
    <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
      <Reveal>
        <Link href="/formations" className="text-sm font-medium text-text-muted hover:text-text">
          ← Toutes les formations
        </Link>
        <h1 className="mt-3 font-display text-3xl font-bold text-text sm:text-4xl">{formation.titre}</h1>
        {formation.dureeHeures && (
          <span className="mt-2 inline-block text-sm font-medium text-text-faint">
            {formation.dureeHeures} heures
          </span>
        )}
        <p className="mt-4 max-w-xl text-base leading-7 text-text-muted">{formation.description}</p>
        {formation.objectifs && (
          <div className="mt-6 max-w-xl">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-text-faint">Objectifs</h2>
            <p className="mt-2 whitespace-pre-line text-base leading-7 text-text">{formation.objectifs}</p>
          </div>
        )}
        <p className="mt-4 text-sm text-text-faint">Formation dispensée en présentiel.</p>
      </Reveal>

      <Reveal delay={0.05} className="mt-10 rounded-[var(--radius-lg)] border border-border bg-surface p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-faint">Tarifs</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {tarifs.map((t) => (
            <div key={t.label} className="rounded-[var(--radius-md)] border border-border p-4 text-center">
              <p className="text-xs font-medium text-text-faint">{t.label}</p>
              <p className="mt-1 font-display text-lg font-bold text-primary">{formaterFcfa(t.prix)}</p>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Button href={`/reserver/${formation.id}`}>Réserver cette formation</Button>
        </div>
      </Reveal>
    </div>
  );
}
