import type { SVGProps, JSX } from "react";
import {
  IconAlertTriangle,
  IconArchive,
  IconBarChart,
  IconBell,
  IconCheckCircle,
  IconChecklist,
  IconDevices,
  IconDownload,
  IconFileText,
  IconHistory,
  IconHospital,
  IconPencil,
  IconSearch,
  IconServer,
  IconShieldAlert,
  IconShieldCheck,
  IconUser,
  IconUsers,
  IconVitals,
} from "@/components/icons";
import { PHOTOS } from "@/lib/site-config";

type Icone = (props: SVGProps<SVGSVGElement>) => JSX.Element;
type Photo = (typeof PHOTOS)[keyof typeof PHOTOS];

export interface ContenuModule {
  slug: string;
  titre: string;
  icon: Icone;
  badge: string;
  accroche: string;
  photo: Photo;
  position?: string;
  fonctionnalites: { icon: Icone; titre: string; texte: string }[];
  parcours: { icon: Icone; titre: string; texte: string }[];
  utilisateurs: { icon: Icone; titre: string; texte: string }[];
  acces: string;
}

// Contenu des pages « Plateforme » : uniquement des fonctionnalités réellement
// livrées (voir ROADMAP.md, sections 6 à 8). Aucun chiffre d'usage inventé.
export const MODULES_PLATEFORME: ContenuModule[] = [
  {
    slug: "auto-evaluation",
    titre: "Auto-évaluation qualité",
    icon: IconChecklist,
    badge: "Gratuit",
    accroche:
      "Mesurez la conformité de votre établissement au référentiel qui lui correspond, critère par critère, et suivez vos progrès d'une session à l'autre.",
    photo: PHOTOS.cnhu,
    fonctionnalites: [
      {
        icon: IconHospital,
        titre: "Grilles EH et ESPC",
        texte: "Seules les grilles publiées qui correspondent au type de votre établissement vous sont proposées.",
      },
      {
        icon: IconPencil,
        titre: "Questionnaire pas à pas",
        texte:
          "Les questions sont regroupées par domaine, avec une barre de progression. Chaque réponse est enregistrée au fil de l'eau et la session peut être reprise.",
      },
      {
        icon: IconServer,
        titre: "Score calculé par la plateforme",
        texte:
          "À la soumission, le score global et le score par domaine sont calculés par la plateforme. Un critère n'est validé que si tous ses éléments sont positifs.",
      },
      {
        icon: IconSearch,
        titre: "Écarts identifiés",
        texte: "Les critères non validés sont listés et regroupés par domaine, pour savoir exactement où agir.",
      },
      {
        icon: IconBarChart,
        titre: "Évolution dans le temps",
        texte: "Un graphique retrace l'évolution de vos scores d'une session d'évaluation à l'autre.",
      },
      {
        icon: IconArchive,
        titre: "Évaluations figées",
        texte: "Une évaluation soumise reste liée à la version de la grille utilisée et ne peut plus être modifiée.",
      },
    ],
    parcours: [
      {
        icon: IconHospital,
        titre: "Choisir la grille",
        texte: "La plateforme propose la grille publiée qui correspond au type de votre établissement, EH ou ESPC.",
      },
      {
        icon: IconPencil,
        titre: "Répondre aux questions",
        texte: "Parcourez les domaines à votre rythme ; vos réponses sont enregistrées au fur et à mesure.",
      },
      {
        icon: IconCheckCircle,
        titre: "Soumettre l'évaluation",
        texte: "La session est verrouillée et le score est calculé par la plateforme.",
      },
      {
        icon: IconBarChart,
        titre: "Analyser les résultats",
        texte: "Score global, score par domaine, écarts à traiter et évolution depuis les sessions précédentes.",
      },
    ],
    utilisateurs: [
      {
        icon: IconUsers,
        titre: "Responsable du compte",
        texte: "Lance les sessions d'évaluation et consulte les résultats de l'établissement.",
      },
      {
        icon: IconShieldCheck,
        titre: "Responsable qualité",
        texte: "Conduit les auto-évaluations et suit les écarts d'une session à l'autre.",
      },
    ],
    acces: "Gratuit et disponible dès l'inscription de votre établissement.",
  },
  {
    slug: "score-news",
    titre: "Score NEWS",
    icon: IconVitals,
    badge: "Essai 3 mois",
    accroche:
      "Détectez plus tôt la dégradation clinique d'un patient hospitalisé grâce à l'échelle NEWS2, calculée au chevet par la plateforme.",
    photo: PHOTOS.sageFemme,
    position: "60% 35%",
    fonctionnalites: [
      {
        icon: IconUser,
        titre: "Fiche patient",
        texte: "Chaque patient hospitalisé a sa fiche, rattachée à un service. À sa sortie, la fiche est clôturée et son historique conservé.",
      },
      {
        icon: IconDevices,
        titre: "Saisie au chevet",
        texte: "Les sept paramètres vitaux se saisissent sur mobile ou tablette, avec un contrôle des valeurs saisies.",
      },
      {
        icon: IconServer,
        titre: "Score NEWS2 calculé",
        texte: "Le score et le niveau de risque sont calculés par la plateforme selon l'échelle NEWS2, jamais saisis à la main.",
      },
      {
        icon: IconBell,
        titre: "Alerte automatique",
        texte: "Dès qu'un risque moyen ou élevé est atteint, une alerte est créée et les responsables de l'établissement sont prévenus.",
      },
      {
        icon: IconFileText,
        titre: "Journal d'intervention",
        texte: "Chaque intervention sur une alerte est consignée ; l'alerte passe alors en cours de traitement.",
      },
      {
        icon: IconHistory,
        titre: "Historique intègre",
        texte: "Toutes les mesures d'un patient restent consultables. Une mesure enregistrée ne peut pas être supprimée.",
      },
    ],
    parcours: [
      {
        icon: IconUser,
        titre: "Créer la fiche patient",
        texte: "Le patient hospitalisé est enregistré et rattaché à son service.",
      },
      {
        icon: IconVitals,
        titre: "Saisir les constantes",
        texte: "Le soignant renseigne les sept paramètres ; le score et le niveau de risque s'affichent aussitôt.",
      },
      {
        icon: IconBell,
        titre: "Être alerté",
        texte: "Un risque moyen ou élevé déclenche une alerte transmise aux responsables.",
      },
      {
        icon: IconFileText,
        titre: "Intervenir et tracer",
        texte: "L'intervention est consignée dans le journal de l'alerte, jusqu'à son traitement.",
      },
    ],
    utilisateurs: [
      {
        icon: IconVitals,
        titre: "Personnel soignant",
        texte: "Saisit les constantes et suit les patients de son service.",
      },
      {
        icon: IconShieldCheck,
        titre: "Responsable qualité",
        texte: "Reçoit les alertes et suit leur traitement pour l'ensemble de l'établissement.",
      },
      {
        icon: IconUsers,
        titre: "Responsable du compte",
        texte: "Reçoit les alertes et dispose de la vue d'ensemble des patients suivis.",
      },
    ],
    acces: "Essai gratuit de 90 jours, puis abonnement.",
  },
  {
    slug: "evenements-indesirables",
    titre: "Événements indésirables",
    icon: IconShieldAlert,
    badge: "Essai 3 mois",
    accroche:
      "Faites de chaque incident une occasion d'apprendre, de la déclaration jusqu'à la clôture, avec une traçabilité complète.",
    photo: PHOTOS.medecin,
    position: "center 20%",
    fonctionnalites: [
      {
        icon: IconPencil,
        titre: "Déclaration ouverte à tous",
        texte: "Tout le personnel de l'établissement peut déclarer un événement indésirable sur une fiche standardisée.",
      },
      {
        icon: IconAlertTriangle,
        titre: "Qualification",
        texte: "Les événements à qualifier sont regroupés ; la gravité est fixée à trois niveaux : faible, modérée ou élevée.",
      },
      {
        icon: IconSearch,
        titre: "Analyse des causes",
        texte: "Les causes immédiates et profondes sont consignées pour chaque événement.",
      },
      {
        icon: IconCheckCircle,
        titre: "Actions correctives",
        texte: "Chaque action a un responsable et une échéance, et son avancement est suivi : à faire, en cours, réalisée.",
      },
      {
        icon: IconHistory,
        titre: "Traçabilité complète",
        texte: "Déclaré, en traitement, clôturé : chaque changement de statut est historisé, avec son auteur et sa date.",
      },
      {
        icon: IconDownload,
        titre: "Tableau de bord et export",
        texte:
          "Répartition par statut, gravité et service, taux et délai moyen de clôture, export des événements sur une période.",
      },
    ],
    parcours: [
      {
        icon: IconPencil,
        titre: "Déclarer",
        texte: "Un membre du personnel décrit l'événement et son type.",
      },
      {
        icon: IconAlertTriangle,
        titre: "Qualifier",
        texte: "Le responsable qualité fixe la gravité ; un événement grave déclenche une notification.",
      },
      {
        icon: IconSearch,
        titre: "Analyser et agir",
        texte: "Les causes sont analysées et des actions correctives sont planifiées puis suivies.",
      },
      {
        icon: IconCheckCircle,
        titre: "Clôturer",
        texte: "L'événement est clôturé ; tout son historique reste consultable.",
      },
    ],
    utilisateurs: [
      {
        icon: IconUsers,
        titre: "Tout le personnel",
        texte: "Déclare les événements indésirables et consulte ceux de l'établissement.",
      },
      {
        icon: IconShieldCheck,
        titre: "Responsable qualité et responsable du compte",
        texte: "Qualifient, analysent, pilotent les actions correctives et clôturent les événements.",
      },
    ],
    acces: "Essai gratuit de 90 jours, puis abonnement.",
  },
];
