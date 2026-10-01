import type { Metadata } from "next";
import { Reveal } from "@/components/motion/reveal";
import { AppelAction, EnTetePage, Parcours, TitreSection } from "@/components/marketing/page-vitrine";
import {
  IconBarChart,
  IconChecklist,
  IconGraduationCap,
  IconShieldAlert,
  IconShieldCheck,
  IconUser,
  IconUserPlus,
  IconUsers,
  IconVitals,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "Comment ça marche",
  description:
    "De l'inscription de votre établissement au pilotage de vos progrès : les étapes, les profils et l'accès aux modules de DSP.",
};

const ETAPES = [
  {
    icon: IconUserPlus,
    titre: "Inscrivez votre établissement",
    texte:
      "Renseignez l'identité de l'établissement, son type (EH ou ESPC) et son IFU, puis confirmez votre adresse email : un compte non confirmé ne peut pas se connecter.",
  },
  {
    icon: IconChecklist,
    titre: "Évaluez et surveillez",
    texte:
      "Lancez votre première auto-évaluation, suivez vos patients au chevet et déclarez les événements indésirables.",
  },
  {
    icon: IconBarChart,
    titre: "Pilotez vos progrès",
    texte: "Suivez vos indicateurs dans le temps, traitez les écarts et formez vos équipes aux bonnes pratiques.",
  },
];

// Profils réellement prévus par la plateforme ; une même personne peut en cumuler plusieurs.
const PROFILS = [
  {
    icon: IconUsers,
    titre: "Responsable du compte",
    texte: "Inscrit l'établissement et en reste le référent. Accède à l'ensemble des modules et reçoit les alertes NEWS.",
  },
  {
    icon: IconShieldCheck,
    titre: "Responsable qualité",
    texte: "Conduit les auto-évaluations, qualifie et traite les événements indésirables, reçoit les alertes NEWS.",
  },
  {
    icon: IconVitals,
    titre: "Personnel soignant",
    texte: "Saisit les constantes au chevet, suit les patients hospitalisés et déclare les événements indésirables.",
  },
  {
    icon: IconUser,
    titre: "Compte individuel",
    texte: "Le professionnel de santé qui souhaite se former à titre personnel réserve ses formations en son nom.",
  },
];

// Conditions d'accès appliquées par la plateforme.
const ACCES = [
  { icon: IconChecklist, module: "Auto-évaluation qualité", condition: "Gratuit", detail: "Disponible dès l'inscription." },
  { icon: IconVitals, module: "Score NEWS", condition: "Essai 3 mois", detail: "90 jours offerts, puis abonnement." },
  {
    icon: IconShieldAlert,
    module: "Événements indésirables",
    condition: "Essai 3 mois",
    detail: "90 jours offerts, puis abonnement.",
  },
  {
    icon: IconGraduationCap,
    module: "Formations",
    condition: "À l'unité",
    detail: "Individuel, groupe de 5 ou de 10. Paiement par KKiaPay, facture émise automatiquement, date communiquée sous 48 heures.",
  },
];

export default function CommentCaMarchePage() {
  return (
    <>
      <EnTetePage
        fil={[
          { href: "/", label: "Accueil" },
          { href: "/a-propos", label: "À propos" },
        ]}
        surTitre="À propos"
        titre="Comment ça marche"
        description="De l'inscription de votre établissement au pilotage de vos progrès, la plateforme vous accompagne à chaque étape."
      />

      {/* Étapes */}
      <section className="border-t border-border bg-bg-subtle">
        <div className="mx-auto grid max-w-6xl gap-14 px-5 py-24 sm:px-8 md:py-32 lg:grid-cols-[0.9fr_1.4fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <TitreSection surTitre="Mise en route" titre="Opérationnel en trois étapes." />
          </div>
          <Parcours etapes={ETAPES} />
        </div>
      </section>

      {/* Profils */}
      <section>
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 md:py-32">
          <TitreSection
            surTitre="Les profils"
            titre="Chaque acteur trouve sa place, avec les droits qui lui reviennent."
            description="Au sein d'un établissement, chaque utilisateur accède uniquement aux fonctions de son rôle ; une même personne peut cumuler plusieurs rôles."
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PROFILS.map((profil, i) => (
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

      {/* Accès aux modules */}
      <section className="border-y border-border bg-bg-subtle">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 md:py-28">
          <TitreSection
            surTitre="Accès"
            titre="Commencez gratuitement, activez selon vos besoins."
            description="L'auto-évaluation est gratuite ; les autres modules s'activent quand votre établissement en a besoin."
          />
          <div className="mt-14 overflow-hidden rounded-[1.25rem] border border-border bg-surface">
            {ACCES.map((ligne, i) => (
              <Reveal key={ligne.module} delay={i * 0.06}>
                <div
                  className={`group flex flex-col gap-3 p-6 transition-colors duration-500 hover:bg-primary-soft/40 sm:flex-row sm:items-center sm:gap-6 sm:px-8 ${
                    i > 0 ? "border-t border-border" : ""
                  }`}
                >
                  <div className="flex flex-1 items-center gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary transition-colors duration-500 group-hover:bg-primary group-hover:text-white">
                      <ligne.icon width={20} height={20} />
                    </span>
                    <span className="font-display text-lg font-semibold text-text">{ligne.module}</span>
                  </div>
                  <span className="w-fit rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                    {ligne.condition}
                  </span>
                  <p className="text-sm leading-6 text-text-muted sm:w-80">{ligne.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <AppelAction
        titre="Prêt à commencer ?"
        texte="L'auto-évaluation est gratuite et disponible dès l'inscription de votre établissement."
      />
    </>
  );
}
