import type { Metadata } from "next";
import { apiFetchJson, silencieux } from "@/lib/api-server";
import { Reveal } from "@/components/motion/reveal";
import { ParametreForm } from "@/components/admin/parametre-form";
import { PageHeader } from "@/components/ui/page-header";
import { SectionReglage } from "@/components/ui/section-reglage";
import type { ParametrePlateforme } from "@/lib/types";

export const metadata: Metadata = {
  title: "Administration · Paramètres",
  robots: { index: false, follow: false },
};

export default async function AdminParametresPage() {
  const parametres = await silencieux(apiFetchJson<ParametrePlateforme[]>("/parametres"), []);

  return (
    <div className="mx-auto max-w-5xl">
      <Reveal>
        <PageHeader
          surtitre="Système"
          titre="Paramètres"
          description="Paramètres appliqués à l'ensemble de la plateforme. Chaque modification est enregistrée dans le journal d'audit."
        />
      </Reveal>
      <Reveal delay={0.05}>
        <SectionReglage
          titre="Plateforme"
          description="Valeurs communes à tous les établissements."
        >
          {parametres.length === 0 ? (
            <p className="rounded-[var(--radius-lg)] border border-dashed border-border bg-surface px-5 py-8 text-center text-sm text-text-muted">
              Aucun paramètre disponible.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {parametres.map((p) => (
                <ParametreForm key={p.id} parametre={p} />
              ))}
            </div>
          )}
        </SectionReglage>
      </Reveal>
    </div>
  );
}
