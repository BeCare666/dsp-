import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import {
  AppelAction,
  EnTetePage,
  GrilleFonctionnalites,
  Parcours,
  TitreSection,
} from "@/components/marketing/page-vitrine";
import { IconArrowRight, IconGraduationCap } from "@/components/icons";
import { MODULES_PLATEFORME } from "@/lib/contenu-plateforme";

export function generateStaticParams() {
  return MODULES_PLATEFORME.map((m) => ({ module: m.slug }));
}

export const dynamicParams = false;

function trouverModule(slug: string) {
  return MODULES_PLATEFORME.find((m) => m.slug === slug);
}

export async function generateMetadata({ params }: PageProps<"/plateforme/[module]">): Promise<Metadata> {
  const { module: slug } = await params;
  const contenu = trouverModule(slug);
  if (!contenu) return {};
  return { title: contenu.titre, description: contenu.accroche };
}

export default async function PageModulePlateforme({ params }: PageProps<"/plateforme/[module]">) {
  const { module: slug } = await params;
  const contenu = trouverModule(slug);
  if (!contenu) notFound();

  // Les autres pages de la rubrique Plateforme, dont Formations (catalogue).
  const autres = [
    ...MODULES_PLATEFORME.filter((m) => m.slug !== contenu.slug).map((m) => ({
      href: `/plateforme/${m.slug}`,
      titre: m.titre,
      icon: m.icon,
      badge: m.badge,
    })),
    { href: "/formations", titre: "Formations", icon: IconGraduationCap, badge: "À l'unité" },
  ];

  return (
    <>
      <EnTetePage
        fil={[
          { href: "/", label: "Accueil" },
          { href: "/a-propos", label: "À propos" },
        ]}
        surTitre="Plateforme"
        titre={contenu.titre}
        description={contenu.accroche}
        badge={contenu.badge}
        photo={contenu.photo}
        position={contenu.position}
      >
        <div className="mt-9 flex flex-wrap gap-3">
          <Button href="/inscription" variant="primary" className="px-6 py-3">
            Inscrire mon établissement
            <IconArrowRight width={16} height={16} />
          </Button>
          <Button href="/login" variant="secondary" className="px-6 py-3">
            Se connecter
          </Button>
        </div>
        <p className="mt-6 text-sm text-text-faint">{contenu.acces}</p>
      </EnTetePage>

      {/* Fonctionnalités */}
      <section className="border-t border-border bg-bg-subtle">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 md:py-28">
          <TitreSection surTitre="Fonctionnalités" titre="Ce que permet le module." />
          <div className="mt-14">
            <GrilleFonctionnalites elements={contenu.fonctionnalites} />
          </div>
        </div>
      </section>

      {/* Parcours */}
      <section>
        <div className="mx-auto grid max-w-6xl gap-14 px-5 py-24 sm:px-8 md:py-32 lg:grid-cols-[0.9fr_1.4fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <TitreSection
              surTitre="Au quotidien"
              titre="Comment ça se passe."
              description="Les étapes suivies dans la plateforme, dans l'ordre où votre établissement les vit."
            />
          </div>
          <Parcours etapes={contenu.parcours} />
        </div>
      </section>

      {/* Utilisateurs */}
      <section className="border-y border-border bg-bg-subtle">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 md:py-28">
          <TitreSection surTitre="Qui l'utilise" titre="Chacun agit selon son rôle." />
          <div className={`mt-14 grid gap-5 sm:grid-cols-2 ${contenu.utilisateurs.length > 2 ? "lg:grid-cols-3" : ""}`}>
            {contenu.utilisateurs.map((profil, i) => (
              <Reveal key={profil.titre} delay={i * 0.08} effet="zoom">
                <article className="group relative h-full overflow-hidden rounded-[1.25rem] border border-border bg-surface p-7 transition-all duration-500 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_30px_60px_-35px_rgba(22,87,204,0.45)]">
                  <div
                    aria-hidden="true"
                    className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary-soft opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                  />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary transition-colors duration-500 group-hover:bg-primary group-hover:text-white">
                    <profil.icon width={22} height={22} />
                  </div>
                  <h3 className="relative mt-6 font-display text-lg font-semibold text-text">{profil.titre}</h3>
                  <p className="relative mt-3 text-sm leading-6 text-text-muted">{profil.texte}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Autres modules */}
      <section>
        <div className="mx-auto max-w-6xl px-5 pt-24 sm:px-8 md:pt-28">
          <TitreSection surTitre="Plateforme" titre="Les autres modules." />
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {autres.map((autre, i) => (
              <Reveal key={autre.href} delay={i * 0.08} effet="zoom">
                <Link
                  href={autre.href}
                  className="group flex h-full items-center gap-4 rounded-[1.25rem] border border-border bg-surface p-6 transition-all duration-500 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_30px_60px_-35px_rgba(22,87,204,0.45)]"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary transition-colors duration-500 group-hover:bg-primary group-hover:text-white">
                    <autre.icon width={22} height={22} />
                  </span>
                  <span className="flex-1">
                    <span className="block font-display font-semibold text-text">{autre.titre}</span>
                    <span className="mt-1 block text-xs font-medium text-accent">{autre.badge}</span>
                  </span>
                  <IconArrowRight
                    width={18}
                    height={18}
                    className="text-text-faint transition-all duration-500 group-hover:translate-x-1 group-hover:text-primary"
                  />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <AppelAction
        titre="Engagez votre établissement dans la sécurité des soins."
        texte="L'auto-évaluation est gratuite et disponible dès l'inscription de votre établissement."
      />
    </>
  );
}
