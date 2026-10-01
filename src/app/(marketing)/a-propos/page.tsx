import type { Metadata } from "next";
import { PHOTOS, SITE } from "@/lib/site-config";
import { Reveal } from "@/components/motion/reveal";
import { ScrollZoomImage } from "@/components/motion/scroll-zoom-image";
import { PhotoCredit } from "@/components/marketing/photo-credit";
import { LogoSymbole } from "@/components/shell/logo";
import { HeroAPropos } from "@/components/marketing/a-propos-animations";
import { AppelAction } from "@/components/marketing/page-vitrine";
import {
  IconArchive,
  IconArrowRight,
  IconBell,
  IconHistory,
  IconLock,
  IconServer,
  IconShieldAlert,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "DSP, le Dispositif de Sécurité des Patients : qui nous sommes, nos engagements et notre ancrage auprès des établissements de santé du Bénin.",
};

// Règles de fonctionnement effectivement appliquées par la plateforme.
const ENGAGEMENTS = [
  {
    icon: IconLock,
    titre: "Des données cloisonnées",
    texte: "Chaque établissement n'accède qu'à ses propres données, sans exception, à chaque niveau de la plateforme.",
  },
  {
    icon: IconServer,
    titre: "Des scores calculés, jamais saisis",
    texte: "Les scores d'auto-évaluation et NEWS sont calculés par la plateforme elle-même, à partir des réponses et des constantes.",
  },
  {
    icon: IconArchive,
    titre: "Des évaluations figées",
    texte: "Une auto-évaluation soumise reste liée à la version de la grille utilisée : elle ne peut plus être modifiée.",
  },
  {
    icon: IconHistory,
    titre: "Un historique intègre",
    texte: "Une mesure NEWS ou un événement indésirable enregistré ne peut pas être supprimé.",
  },
  {
    icon: IconShieldAlert,
    titre: "Une traçabilité complète",
    texte: "Chaque changement de statut d'un événement indésirable est historisé : qui a agi, et à quel moment.",
  },
  {
    icon: IconBell,
    titre: "Des alertes automatiques",
    texte: "Un risque NEWS moyen ou élevé, ou un événement indésirable grave, déclenche une notification sans attendre.",
  },
];

export default function AProposPage() {
  return (
    <>
      {/* Ouverture */}
      <HeroAPropos
        image={PHOTOS.cnhu.src}
        alt={PHOTOS.cnhu.alt}
        credit={<PhotoCredit photo={PHOTOS.cnhu} className="bottom-4 right-4" />}
      >
        <Reveal>
          <span className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 py-1 pl-1 pr-3.5 text-xs font-medium text-white/85 backdrop-blur">
            <LogoSymbole className="h-6 w-6" />
            À propos de {SITE.nom}
          </span>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="mt-7 max-w-4xl font-display text-[2.6rem] font-bold leading-[1.04] tracking-tight text-white sm:text-6xl lg:text-7xl">
            La sécurité des patients, une exigence de chaque instant.
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/75">
            Le {SITE.nomComplet} accompagne les établissements de santé du Bénin dans une démarche continue
            d&apos;amélioration de la qualité et de la sécurité des soins.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <a
            href="#qui-sommes-nous"
            className="group mt-12 inline-flex items-center gap-3 text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 transition-colors group-hover:border-white/60">
              <IconArrowRight width={16} height={16} className="rotate-90 transition-transform duration-500 group-hover:translate-y-0.5" />
            </span>
            Découvrir DSP
          </a>
        </Reveal>
      </HeroAPropos>

      {/* Qui sommes-nous */}
      <section id="qui-sommes-nous" className="scroll-mt-20">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 md:py-32">
          <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.1fr]">
            <Reveal effet="zoom">
              <figure className="relative">
                <ScrollZoomImage
                  src={PHOTOS.medecin.src}
                  alt={PHOTOS.medecin.alt}
                  sizes="(min-width: 1024px) 480px, 100vw"
                  position="center 20%"
                  className="aspect-[4/5] w-full rounded-[1.75rem] shadow-[0_40px_80px_-45px_rgba(10,26,56,0.6)]"
                />
                <PhotoCredit photo={PHOTOS.medecin} className="bottom-3 right-3" />
              </figure>
            </Reveal>

            <div>
              <Reveal>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Qui sommes-nous</span>
                <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-text sm:text-4xl">
                  Un dispositif né des besoins du terrain.
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-6 text-base leading-7 text-text-muted">
                  {SITE.nom} s&apos;adresse aux hôpitaux (EH) comme aux établissements de soins de premiers contacts
                  (ESPC). Chacun évalue ses pratiques avec la grille qui correspond réellement à son type, et avance à son
                  rythme.
                </p>
              </Reveal>
              <Reveal delay={0.15}>
                <p className="mt-4 text-base leading-7 text-text-muted">
                  La plateforme réunit quatre outils complémentaires sur un seul espace : l&apos;auto-évaluation qualité,
                  la surveillance clinique par score NEWS, la gestion des événements indésirables et la formation
                  continue des équipes soignantes.
                </p>
              </Reveal>
              <Reveal delay={0.2}>
                <div className="mt-10 grid grid-cols-2 gap-4">
                  {[
                    { sigle: "EH", libelle: "Établissements hospitaliers" },
                    { sigle: "ESPC", libelle: "Établissements de soins de premiers contacts" },
                  ].map((type) => (
                    <div
                      key={type.sigle}
                      className="rounded-2xl border border-border bg-bg-subtle p-5 transition-colors duration-500 hover:border-primary/30 hover:bg-primary-soft/60"
                    >
                      <span className="font-display text-2xl font-bold text-primary">{type.sigle}</span>
                      <p className="mt-2 text-sm leading-5 text-text-muted">{type.libelle}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Engagements */}
      <section className="border-y border-border bg-bg-subtle">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 md:py-32">
          <div className="grid gap-14 lg:grid-cols-[0.9fr_2fr]">
            <Reveal className="lg:sticky lg:top-28 lg:self-start">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Nos engagements</span>
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-text sm:text-4xl">
                Des règles inscrites au cœur de la plateforme.
              </h2>
              <p className="mt-5 leading-7 text-text-muted">
                Ces principes ne dépendent pas de la bonne volonté de chacun : ils sont appliqués par la plateforme
                elle-même, à chaque action.
              </p>
            </Reveal>

            <div className="grid gap-px overflow-hidden rounded-[1.25rem] border border-border bg-border sm:grid-cols-2">
              {ENGAGEMENTS.map((engagement, i) => (
                <Reveal key={engagement.titre} delay={(i % 2) * 0.1} className="bg-surface">
                  <div className="group h-full p-8 transition-colors duration-500 hover:bg-primary-soft/40">
                    <div className="flex items-center justify-between">
                      <engagement.icon
                        width={24}
                        height={24}
                        className="text-primary transition-transform duration-500 group-hover:scale-110"
                      />
                      <span className="font-display text-sm font-bold tabular-nums text-text-faint">0{i + 1}</span>
                    </div>
                    <h3 className="mt-5 font-display text-lg font-semibold text-text">{engagement.titre}</h3>
                    <p className="mt-2 text-sm leading-6 text-text-muted">{engagement.texte}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ancrage local */}
      <section>
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-24 sm:px-8 md:py-32 lg:grid-cols-2">
          <Reveal delay={0.05} className="lg:order-2">
            <figure className="relative">
              <ScrollZoomImage
                src={PHOTOS.centreSante.src}
                alt={PHOTOS.centreSante.alt}
                sizes="(min-width: 1024px) 560px, 100vw"
                className="aspect-[4/3] w-full rounded-[1.75rem] shadow-[0_40px_80px_-45px_rgba(10,26,56,0.6)]"
              />
              <PhotoCredit photo={PHOTOS.centreSante} className="bottom-3 right-3" />
              <figcaption className="mt-4 text-xs text-text-faint">Centre de santé d&apos;Agamè, Lokossa.</figcaption>
            </figure>
          </Reveal>

          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Ancrage</span>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-text sm:text-4xl">
              Conçu pour les établissements de santé du Bénin.
            </h2>
            <p className="mt-5 leading-7 text-text-muted">
              Des centres hospitaliers universitaires aux centres de santé de commune, {SITE.nom} tient compte de la
              réalité de chaque structure : des référentiels distincts pour les EH et les ESPC, une saisie possible sur
              mobile ou tablette au chevet du patient, un paiement en ligne par KKiaPay.
            </p>
            <ul className="mt-8 flex flex-col gap-3">
              {[
                "Auto-évaluation gratuite, disponible dès l'inscription",
                "Modules NEWS et EI en essai pendant 90 jours",
                "Formations en individuel, en groupe de 5 ou de 10",
              ].map((point) => (
                <li key={point} className="flex items-center gap-3 text-sm text-text">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {point}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <AppelAction
        titre="Engagez votre établissement dans la sécurité des soins."
        texte="Une question sur la plateforme ? Écrivez-nous, ou inscrivez votre établissement dès aujourd'hui."
      />
    </>
  );
}
