import type { Metadata } from "next";
import { apiFetchJson, silencieux } from "@/lib/api-server";
import { Reveal } from "@/components/motion/reveal";
import { DeclarerForm, type CritereProposable } from "@/components/ei/declarer-form";
import type { Grille, NiveauGraviteEi, Organisation, ServiceEtablissement, TypeEi } from "@/lib/types";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Déclarer un événement indésirable",
  robots: { index: false, follow: false },
};

// §8.4 — critères proposables : ceux de la grille publiée la plus récente
// correspondant à la catégorie ARS de l'établissement.
async function chargerCriteres(): Promise<CritereProposable[]> {
  const organisation = await silencieux(apiFetchJson<Organisation>("/organisations/me"), null);
  if (!organisation) return [];
  const grilles = await silencieux(apiFetchJson<Grille[]>(`/grilles?type=${organisation.type}`), []);
  const grille = grilles.sort((a, b) => b.version - a.version).at(0);
  if (!grille) return [];
  const detail = await silencieux(apiFetchJson<Grille>(`/grilles/${grille.id}`), null);
  return (detail?.domaines ?? []).flatMap((d) =>
    d.normes.flatMap((n) => n.criteres.map((c) => ({ id: c.id, libelle: `${n.code} · ${c.code} — ${c.libelle}` }))),
  );
}

export default async function DeclarerEiPage() {
  const [typesEi, niveauxGravite, services, criteres] = await Promise.all([
    silencieux(apiFetchJson<TypeEi[]>("/types-ei"), []),
    silencieux(apiFetchJson<NiveauGraviteEi[]>("/niveaux-gravite-ei"), []),
    silencieux(apiFetchJson<ServiceEtablissement[]>("/organisation/services"), []),
    chargerCriteres(),
  ]);

  return (
    <PageContainer largeur="formulaire">
      <Reveal>
        <PageHeader
          filAriane={[{ label: "Événements indésirables", href: "/evenements-indesirables" }, { label: "Déclarer" }]}
          surtitre="Module EI"
          titre="Déclarer un événement indésirable"
          description="La déclaration est transmise au responsable qualité, qui la qualifie puis en organise l'analyse et le plan d'action."
        />
      </Reveal>
      <Reveal delay={0.05}>
        <Card>
          <DeclarerForm typesEi={typesEi} niveauxGravite={niveauxGravite} services={services} criteres={criteres} />
        </Card>
      </Reveal>
    </PageContainer>
  );
}
