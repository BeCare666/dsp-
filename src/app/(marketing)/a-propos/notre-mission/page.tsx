import type { Metadata } from "next";
import { PHOTOS, SITE } from "@/lib/site-config";
import { Reveal } from "@/components/motion/reveal";
import { PhotoCredit } from "@/components/marketing/photo-credit";
import { BandeauPhoto, CompteurAnime, TexteRevele } from "@/components/marketing/a-propos-animations";
import { AppelAction, EnTetePage, Parcours, TitreSection } from "@/components/marketing/page-vitrine";
import { IconChecklist, IconGraduationCap, IconShieldAlert, IconVitals } from "@/components/icons";

export const metadata: Metadata = {
  title: "Notre mission",
  description:
    "La mission de DSP : donner à chaque établissement de santé du Bénin les outils pour évaluer, surveiller, apprendre et former.",
};

// Valeurs issues du fonctionnement réel de la plateforme (mêmes chiffres que
// la page d'accueil), aucune statistique d'usage inventée.
const CHIFFRES = [
  { valeur: 4, libelle: "modules réunis sur une seule plateforme" },
  { valeur: 2, libelle: "référentiels d'auto-évaluation, EH et ESPC" },
  { valeur: 7, libelle: "paramètres vitaux pris en compte par le score NEWS2" },
  { valeur: 90, libelle: "jours d'essai offerts sur les modules NEWS et EI" },
];

const DEMARCHE = [
  {
    icon: IconChecklist,
    surTitre: "Évaluer",
    titre: "Mesurer ses pratiques",
    texte:
      "Chaque établissement mesure sa conformité au référentiel qui correspond à son type, identifie ses écarts et suit leur évolution.",
    href: "/plateforme/auto-evaluation",
    lien: "Auto-évaluation qualité",
  },
  {
    icon: IconVitals,
    surTitre: "Surveiller",
    titre: "Repérer tôt la dégradation",
    texte:
      "Au chevet, le score NEWS2 est calculé aussitôt ; un risque moyen ou élevé prévient les responsables sans attendre.",
    href: "/plateforme/score-news",
    lien: "Score NEWS",
  },
  {
    icon: IconShieldAlert,
    surTitre: "Apprendre",
    titre: "Tirer les leçons de chaque incident",
    texte:
      "Chaque événement indésirable est déclaré, analysé et suivi jusqu'à sa clôture, avec ses causes et ses actions correctives.",
    href: "/plateforme/evenements-indesirables",
    lien: "Événements indésirables",
  },
  {
    icon: IconGraduationCap,
    surTitre: "Former",
    titre: "Ancrer les bonnes pratiques",
    texte: "Les équipes se forment à la sécurité des patients, seules ou en groupe de 5 ou 10.",
    href: "/formations",
    lien: "Formations",
  },
];

export default function NotreMissionPage() {
  return (
    <>
      <EnTetePage
        fil={[
          { href: "/", label: "Accueil" },
          { href: "/a-propos", label: "À propos" },
        ]}
        surTitre="À propos"
        titre="Notre mission"
        description={`Le ${SITE.nomComplet} accompagne les établissements de santé du Bénin dans une démarche continue d'amélioration de la qualité et de la sécurité des soins.`}
        photo={PHOTOS.centreSante}
      />

      {/* Énoncé */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 md:py-32">
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Notre raison d&apos;être</span>
          </Reveal>
          <TexteRevele
            className="mt-6 max-w-5xl font-display text-[1.9rem] font-semibold leading-[1.2] tracking-tight text-text sm:text-5xl"
            texte="Donner à chaque établissement de santé du Bénin les outils pour évaluer ses pratiques, surveiller ses patients, apprendre de chaque incident et former ses équipes."
          />
        </div>
      </section>

      {/* Chiffres clés */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-40 top-0 h-80 w-[40rem] rounded-full bg-primary/30 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-6xl grid-cols-2 px-5 sm:px-8 lg:grid-cols-4">
          {CHIFFRES.map((chiffre, i) => (
            <Reveal
              key={chiffre.libelle}
              delay={i * 0.08}
              effet="zoom"
              className={`border-white/10 py-14 pr-4 ${i > 0 ? "lg:border-l lg:pl-8" : ""} ${i % 2 === 1 ? "border-l pl-6" : ""} ${i >= 2 ? "border-t lg:border-t-0" : ""}`}
            >
              <CompteurAnime
                valeur={chiffre.valeur}
                className="block font-display text-5xl font-bold tabular-nums tracking-tight sm:text-6xl"
              />
              <p className="mt-3 max-w-[14rem] text-sm leading-6 text-white/65">{chiffre.libelle}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Démarche */}
      <section className="bg-bg-subtle">
        <div className="mx-auto grid max-w-6xl gap-14 px-5 py-24 sm:px-8 md:py-32 lg:grid-cols-[0.9fr_1.4fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <TitreSection
              surTitre="Notre démarche"
              titre="Une boucle d'amélioration continue."
              description="Évaluer, surveiller, apprendre, former : quatre gestes qui se nourrissent les uns les autres. Un événement indésirable peut même être rattaché au critère d'auto-évaluation qu'il concerne."
            />
          </div>
          <Parcours etapes={DEMARCHE} />
        </div>
      </section>

      {/* Au chevet */}
      <BandeauPhoto
        image={PHOTOS.sageFemme.src}
        alt={PHOTOS.sageFemme.alt}
        position="60% 35%"
        credit={<PhotoCredit photo={PHOTOS.sageFemme} className="bottom-4 right-4" />}
      >
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Au chevet du patient</span>
        </Reveal>
        <TexteRevele
          className="mt-6 font-display text-[1.8rem] font-semibold leading-[1.25] tracking-tight text-white sm:text-5xl"
          texte="La décision reste clinique, mais l'information arrive au bon moment, aux bonnes personnes."
        />
      </BandeauPhoto>

      <AppelAction
        titre="Engagez votre établissement dans la sécurité des soins."
        texte="L'auto-évaluation est gratuite et disponible dès l'inscription de votre établissement."
      />
    </>
  );
}
