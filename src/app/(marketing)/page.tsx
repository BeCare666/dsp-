import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { ScrollZoomImage } from "@/components/motion/scroll-zoom-image";
import { HeroVisuel } from "@/components/marketing/hero-visuel";
import { PhotoCredit } from "@/components/marketing/photo-credit";
import {
  IconArrowRight,
  IconCheck,
  IconChecklist,
  IconGraduationCap,
  IconHistory,
  IconLock,
  IconServer,
  IconShieldAlert,
  IconVitals,
} from "@/components/icons";
import { PHOTOS } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Accueil",
  description:
    "DSP outille les établissements de santé du Bénin pour l'auto-évaluation qualité, la surveillance NEWS, la déclaration des événements indésirables et la formation continue.",
};

// Chiffres issus du fonctionnement réel de la plateforme (aucune statistique
// d'usage inventée) : nombre de modules, référentiels, paramètres NEWS2 et
// durée d'essai appliquée par AbonnementsService.
const CHIFFRES = [
  { valeur: "4", libelle: "modules réunis sur une seule plateforme" },
  { valeur: "2", libelle: "référentiels d'auto-évaluation, EH et ESPC" },
  { valeur: "7", libelle: "paramètres vitaux pris en compte par le score NEWS2" },
  { valeur: "90", libelle: "jours d'essai offerts sur les modules NEWS et EI" },
];

const MODULES = [
  {
    numero: "01",
    icon: IconChecklist,
    titre: "Auto-évaluation qualité",
    tag: "Gratuit",
    description:
      "Mesurez la conformité de votre établissement au référentiel qui lui correspond, critère par critère.",
    points: [
      "Grilles EH et ESPC, parcourues question par question",
      "Score global et par domaine calculé par la plateforme",
      "Écarts identifiés et évolution d'une session à l'autre",
    ],
  },
  {
    numero: "02",
    icon: IconVitals,
    titre: "Score NEWS",
    tag: "Essai 3 mois",
    description:
      "Détectez plus tôt la dégradation clinique d'un patient hospitalisé grâce à l'échelle NEWS2.",
    points: [
      "Sept paramètres vitaux saisis au chevet, sur mobile ou tablette",
      "Alerte immédiate dès qu'un risque moyen ou élevé est atteint",
      "Journal d'intervention et historique complet par patient",
    ],
  },
  {
    numero: "03",
    icon: IconShieldAlert,
    titre: "Événements indésirables",
    tag: "Essai 3 mois",
    description:
      "Faites de chaque incident une occasion d'apprendre, de la déclaration jusqu'à la clôture.",
    points: [
      "Déclaration ouverte à tout le personnel de l'établissement",
      "Qualification, analyse des causes et actions correctives",
      "Tableau de bord et export des événements sur une période",
    ],
  },
  {
    numero: "04",
    icon: IconGraduationCap,
    titre: "Formations",
    tag: "À l'unité",
    description:
      "Formez vos équipes à la sécurité des patients, seul ou en groupe, avec un paiement en ligne sécurisé.",
    points: [
      "Formule individuelle, groupe de 5 ou groupe de 10",
      "Paiement sécurisé par KKiaPay, facture émise automatiquement",
      "Date de session communiquée sous 48 heures",
    ],
  },
];

const ETAPES = [
  {
    numero: "01",
    titre: "Inscrivez votre établissement",
    description:
      "Renseignez l'identité de l'établissement, son type (EH ou ESPC) et son IFU, puis confirmez votre adresse email.",
  },
  {
    numero: "02",
    titre: "Évaluez et surveillez",
    description:
      "Lancez votre première auto-évaluation, suivez vos patients au chevet et déclarez les événements indésirables.",
  },
  {
    numero: "03",
    titre: "Pilotez vos progrès",
    description:
      "Suivez vos indicateurs dans le temps, traitez les écarts et formez vos équipes aux bonnes pratiques.",
  },
];

const PRINCIPES = [
  {
    icon: IconLock,
    titre: "Données cloisonnées",
    description:
      "Chaque établissement n'accède qu'à ses propres données. Aucune organisation ne peut consulter celles d'une autre.",
  },
  {
    icon: IconServer,
    titre: "Calculs fiables",
    description:
      "Les scores d'auto-évaluation et NEWS sont calculés par la plateforme elle-même, jamais saisis à la main.",
  },
  {
    icon: IconHistory,
    titre: "Historique intègre",
    description:
      "Une mesure NEWS ou un événement indésirable enregistré ne peut pas être supprimé, et une évaluation soumise est figée.",
  },
  {
    icon: IconShieldAlert,
    titre: "Traçabilité complète",
    description:
      "Chaque changement de statut d'un événement indésirable est historisé : qui a agi, et à quel moment.",
  },
];

export default function AccueilPage() {
  return (
    <>
      {/* Ouverture */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_30rem_at_85%_-10%,var(--color-primary-soft),transparent_70%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(var(--color-border)_1px,transparent_1px),linear-gradient(90deg,var(--color-border)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_65%)]"
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-14 sm:px-8 md:pt-20 lg:grid-cols-[1.05fr_1fr] lg:pb-28">
          <Reveal>
            <span className="inline-flex items-center gap-2.5 rounded-full border border-border bg-surface/80 py-1 pl-1.5 pr-3.5 text-xs font-medium text-text-muted shadow-[var(--shadow-soft)] backdrop-blur">
              <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                Bénin
              </span>
              Dispositif de Sécurité des Patients
            </span>

            <h1 className="mt-7 font-display text-[2.6rem] font-bold leading-[1.05] tracking-tight text-text sm:text-6xl">
              La sécurité des patients,{" "}
              <span className="relative text-primary sm:whitespace-nowrap">
                pilotée avec rigueur
                <svg
                  aria-hidden="true"
                  viewBox="0 0 300 12"
                  preserveAspectRatio="none"
                  className="absolute -bottom-2 left-0 hidden h-3 w-full text-accent/70 sm:block"
                >
                  <path d="M2 9c60-6 160-8 296-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
              .
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-text-muted">
              DSP réunit l&apos;auto-évaluation qualité, la surveillance clinique NEWS, la gestion des événements
              indésirables et la formation continue des équipes, pour les hôpitaux et centres de santé du Bénin.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Button href="/inscription" variant="primary" className="px-6 py-3">
                Inscrire mon établissement
                <IconArrowRight width={16} height={16} />
              </Button>
              <Button href="/#modules" variant="secondary" className="px-6 py-3">
                Découvrir les modules
              </Button>
            </div>

            <ul className="mt-10 grid gap-3 text-sm text-text-muted sm:grid-cols-3">
              {["Référentiels EH et ESPC", "Échelle clinique NEWS2", "Données cloisonnées"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
                    <IconCheck width={12} height={12} strokeWidth={2.4} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <HeroVisuel />
        </div>
      </section>

      {/* Chiffres clés */}
      <section className="border-y border-border bg-bg-subtle">
        <div className="mx-auto grid max-w-6xl grid-cols-2 px-5 sm:px-8 lg:grid-cols-4">
          {CHIFFRES.map((chiffre, i) => (
            <Reveal
              key={chiffre.libelle}
              delay={i * 0.08}
              effet="zoom"
              className={`border-border py-10 pr-4 ${i > 0 ? "lg:border-l lg:pl-8" : ""} ${i % 2 === 1 ? "border-l pl-6" : ""} ${i >= 2 ? "border-t lg:border-t-0" : ""}`}
            >
              <div className="font-display text-4xl font-bold tabular-nums tracking-tight text-text sm:text-5xl">
                {chiffre.valeur}
              </div>
              <p className="mt-2 max-w-[14rem] text-sm leading-6 text-text-muted">{chiffre.libelle}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="scroll-mt-20">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 md:py-32">
          <div className="grid gap-14 lg:grid-cols-[0.9fr_2fr]">
            <Reveal className="lg:sticky lg:top-28 lg:self-start">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Les modules</span>
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-text sm:text-4xl">
                Quatre outils pour une seule exigence.
              </h2>
              <p className="mt-5 leading-7 text-text-muted">
                Chaque module répond à un besoin concret de la sécurité des soins. Commencez par
                l&apos;auto-évaluation, gratuite, puis activez les modules dont votre établissement a besoin.
              </p>
              <Link
                href="/inscription"
                className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary"
              >
                Créer un compte établissement
                <IconArrowRight width={16} height={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Reveal>

            <div className="grid gap-5 sm:grid-cols-2">
              {MODULES.map((module, i) => (
                <Reveal key={module.titre} delay={(i % 2) * 0.1} effet="zoom">
                  <article className="group relative h-full overflow-hidden rounded-[1.25rem] border border-border bg-surface p-7 transition-all duration-500 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_30px_60px_-35px_rgba(22,87,204,0.45)]">
                    <div
                      aria-hidden="true"
                      className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary-soft opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                    />
                    <div className="relative flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary transition-colors duration-500 group-hover:bg-primary group-hover:text-white">
                        <module.icon width={22} height={22} />
                      </div>
                      <span className="font-display text-sm font-bold tabular-nums text-text-faint">{module.numero}</span>
                    </div>
                    <div className="relative mt-6 flex flex-wrap items-center gap-2.5">
                      <h3 className="font-display text-xl font-semibold text-text">{module.titre}</h3>
                      <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-semibold text-accent">
                        {module.tag}
                      </span>
                    </div>
                    <p className="relative mt-3 text-sm leading-6 text-text-muted">{module.description}</p>
                    <ul className="relative mt-5 flex flex-col gap-2.5 border-t border-border pt-5">
                      {module.points.map((point) => (
                        <li key={point} className="flex gap-2.5 text-sm leading-5 text-text">
                          <IconCheck width={16} height={16} strokeWidth={2.2} className="mt-0.5 flex-shrink-0 text-primary" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Au chevet du patient */}
      <section className="bg-bg-subtle">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-24 sm:px-8 md:py-32 lg:grid-cols-2">
          <Reveal effet="zoom">
            <figure className="relative">
              <ScrollZoomImage
                src={PHOTOS.sageFemme.src}
                alt={PHOTOS.sageFemme.alt}
                sizes="(min-width: 1024px) 560px, 100vw"
                position="60% 35%"
                className="aspect-[4/3] w-full rounded-[1.75rem] shadow-[0_40px_80px_-45px_rgba(10,26,56,0.6)]"
              />
              <PhotoCredit photo={PHOTOS.sageFemme} className="bottom-3 right-3" />
              <figcaption className="mt-4 text-xs text-text-faint">Maternité de la Lagune, Cotonou.</figcaption>
            </figure>
          </Reveal>

          <Reveal delay={0.1}>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Au chevet du patient</span>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-text sm:text-4xl">
              Chaque signe de dégradation compte. Aucun ne doit passer inaperçu.
            </h2>
            <p className="mt-5 leading-7 text-text-muted">
              Le soignant saisit les constantes du patient ; la plateforme calcule aussitôt le score NEWS2 et le niveau
              de risque associé. La décision reste clinique, mais l&apos;information arrive au bon moment, aux bonnes
              personnes.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { niveau: "Faible", classes: "bg-success-soft text-success", texte: "Surveillance habituelle" },
                { niveau: "Moyen", classes: "bg-warning-soft text-warning", texte: "Alerte transmise" },
                { niveau: "Élevé", classes: "bg-danger-soft text-danger", texte: "Alerte transmise" },
              ].map((item) => (
                <div key={item.niveau} className="rounded-xl border border-border bg-surface p-4">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${item.classes}`}>
                    Risque {item.niveau.toLowerCase()}
                  </span>
                  <p className="mt-3 text-sm text-text-muted">{item.texte}</p>
                </div>
              ))}
            </div>

            <blockquote className="mt-8 border-l-2 border-accent pl-5 text-sm leading-6 text-text">
              Dès qu&apos;un risque moyen ou élevé est détecté, le responsable qualité et le responsable du compte de
              l&apos;établissement sont prévenus automatiquement, et chaque intervention est consignée.
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* Établissements */}
      <section id="etablissements" className="scroll-mt-20">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 md:py-32">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Pour qui</span>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-text sm:text-4xl">
              Des centres hospitaliers universitaires aux centres de santé de commune.
            </h2>
            <p className="mt-5 leading-7 text-text-muted">
              Deux référentiels distincts, EH et ESPC : chaque établissement évalue ses pratiques avec la grille qui
              correspond réellement à son type.
            </p>
          </Reveal>

          <div className="mt-16 grid gap-6 md:grid-cols-2">
            {[
              {
                photo: PHOTOS.cnhu,
                lieu: "CNHU Hubert Koutoukou Maga, Cotonou",
                titre: "Hôpitaux et centres hospitaliers",
                texte: "Plusieurs services, des équipes nombreuses : rôles distincts, suivi des patients par service et tableau de bord consolidé.",
              },
              {
                photo: PHOTOS.centreSante,
                lieu: "Centre de santé d'Agamè, Lokossa",
                titre: "Centres de santé",
                texte: "Des outils simples à prendre en main, utilisables sur mobile, pour installer une culture de sécurité au plus près des populations.",
              },
            ].map((carte, i) => (
              <Reveal key={carte.titre} delay={i * 0.12} effet="zoom">
                <article className="group relative overflow-hidden rounded-[1.75rem] bg-navy">
                  <ScrollZoomImage
                    src={carte.photo.src}
                    alt={carte.photo.alt}
                    sizes="(min-width: 768px) 540px, 100vw"
                    className="aspect-[4/3] w-full transition-opacity duration-700 group-hover:opacity-90"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/40 to-transparent"
                  />
                  <PhotoCredit photo={carte.photo} className="right-4 top-4" />
                  <div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-8">
                    <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/65">{carte.lieu}</span>
                    <h3 className="mt-2 font-display text-2xl font-semibold">{carte.titre}</h3>
                    <p className="mt-3 max-w-md text-sm leading-6 text-white/80">{carte.texte}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Fonctionnement */}
      <section id="fonctionnement" className="scroll-mt-20 border-y border-border bg-bg-subtle">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 md:py-28">
          <Reveal className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Mise en route</span>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-text sm:text-4xl">
              Opérationnel en trois étapes.
            </h2>
          </Reveal>

          <div className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            <div aria-hidden="true" className="absolute left-0 right-0 top-6 hidden h-px bg-border md:block" />
            {ETAPES.map((etape, i) => (
              <Reveal key={etape.numero} delay={i * 0.14}>
                <div className="relative">
                  <span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface font-display text-sm font-bold tabular-nums text-primary shadow-[var(--shadow-soft)]">
                    {etape.numero}
                  </span>
                  <h3 className="mt-6 font-display text-lg font-semibold text-text">{etape.titre}</h3>
                  <p className="mt-2 text-sm leading-6 text-text-muted">{etape.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Sécurité et confiance */}
      <section id="securite" className="scroll-mt-20">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 md:py-32">
          <div className="grid gap-14 lg:grid-cols-[0.9fr_2fr]">
            <Reveal className="lg:sticky lg:top-28 lg:self-start">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Confiance</span>
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-text sm:text-4xl">
                Des données de santé traitées avec la rigueur qu&apos;elles exigent.
              </h2>
              <Link
                href="/politique-confidentialite"
                className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary"
              >
                Lire la politique de confidentialité
                <IconArrowRight width={16} height={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Reveal>

            <div className="grid gap-px overflow-hidden rounded-[1.25rem] border border-border bg-border sm:grid-cols-2">
              {PRINCIPES.map((principe, i) => (
                <Reveal key={principe.titre} delay={(i % 2) * 0.1} className="bg-surface">
                  <div className="h-full p-8">
                    <principe.icon width={24} height={24} className="text-primary" />
                    <h3 className="mt-5 font-display text-lg font-semibold text-text">{principe.titre}</h3>
                    <p className="mt-2 text-sm leading-6 text-text-muted">{principe.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Appel à l'action */}
      <section className="px-5 pb-24 sm:px-8">
        <Reveal effet="zoom" className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-[2rem] bg-navy px-8 py-16 text-center sm:px-16 md:py-20">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-primary/40 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 right-0 h-56 w-72 rounded-full bg-accent/20 blur-3xl"
            />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                Engagez votre établissement dans la sécurité des soins.
              </h2>
              <p className="mx-auto mt-5 max-w-lg leading-7 text-white/70">
                L&apos;auto-évaluation est gratuite et disponible dès l&apos;inscription de votre établissement.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Link
                  href="/inscription"
                  className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-white px-6 py-3 text-sm font-semibold text-navy transition-transform hover:-translate-y-0.5"
                >
                  Inscrire mon établissement
                  <IconArrowRight width={16} height={16} />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center rounded-[var(--radius-md)] border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Se connecter
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
