import type { SVGProps, JSX } from "react";
import {
  IconCamera,
  IconChecklist,
  IconCookie,
  IconFileText,
  IconGraduationCap,
  IconGrid,
  IconHospital,
  IconInfo,
  IconLock,
  IconLogin,
  IconMail,
  IconRoute,
  IconScale,
  IconShieldAlert,
  IconShieldCheck,
  IconTarget,
  IconUserPlus,
  IconVitals,
  IconOrganisation,
} from "@/components/icons";
import { SITE } from "@/lib/site-config";

type Icone = (props: SVGProps<SVGSVGElement>) => JSX.Element;

export interface LienVitrine {
  href: string;
  label: string;
  icon: Icone;
}

export interface MenuVitrine {
  titre: string;
  icon: Icone;
  liens: LienVitrine[];
}

// Source unique des menus de la vitrine : le footer affiche ces colonnes telles
// quelles ; l'en-tête et le tiroir mobile les réorganisent (MENUS_EN_TETE).
export const MENUS_VITRINE: MenuVitrine[] = [
  {
    titre: "Plateforme",
    icon: IconGrid,
    liens: [
      { href: "/plateforme/auto-evaluation", label: "Auto-évaluation qualité", icon: IconChecklist },
      { href: "/plateforme/score-news", label: "Score NEWS", icon: IconVitals },
      { href: "/plateforme/evenements-indesirables", label: "Événements indésirables", icon: IconShieldAlert },
      { href: "/formations", label: "Formations", icon: IconGraduationCap },
    ],
  },
  {
    titre: "Établissement",
    icon: IconOrganisation,
    liens: [
      { href: "/inscription", label: "Créer un compte", icon: IconUserPlus },
      { href: "/login", label: "Se connecter", icon: IconLogin },
      { href: "/#etablissements", label: "Hôpitaux et centres de santé", icon: IconHospital },
      { href: "/#securite", label: "Sécurité des données", icon: IconLock },
    ],
  },
  {
    titre: "À propos",
    icon: IconInfo,
    liens: [
      { href: "/a-propos/notre-mission", label: "Notre mission", icon: IconTarget },
      { href: "/a-propos/comment-ca-marche", label: "Comment ça marche", icon: IconRoute },
      { href: `mailto:${SITE.emailContact}`, label: "Nous contacter", icon: IconMail },
    ],
  },
  {
    titre: "Informations légales",
    icon: IconScale,
    liens: [
      { href: "/conditions-utilisation", label: "Conditions d'utilisation", icon: IconFileText },
      { href: "/politique-confidentialite", label: "Politique de confidentialité", icon: IconShieldCheck },
      { href: "/politique-confidentialite#cookies", label: "Cookies", icon: IconCookie },
      { href: "/conditions-utilisation#credits", label: "Crédits photographiques", icon: IconCamera },
    ],
  },
];

export interface SectionMenu {
  // Sous-titre affiché au-dessus des liens (absent pour la première section).
  titre?: string;
  liens: LienVitrine[];
}

export interface MenuEnTete {
  titre: string;
  icon: Icone;
  sections: SectionMenu[];
}

// Menus de l'en-tête et du tiroir mobile : mêmes liens que le footer, sauf que
// « Plateforme » n'est plus un menu à part, ses liens sont placés dans « À propos »
// (demande client du 2026-09-30 : trop de menus dans l'en-tête). « Accueil »
// est un lien simple, rendu directement par l'en-tête.
function menu(titre: string): MenuVitrine {
  const trouve = MENUS_VITRINE.find((m) => m.titre === titre);
  if (!trouve) throw new Error(`Menu de vitrine introuvable : ${titre}`);
  return trouve;
}

export const MENUS_EN_TETE: MenuEnTete[] = [
  { titre: "Établissement", icon: menu("Établissement").icon, sections: [{ liens: menu("Établissement").liens }] },
  {
    titre: "À propos",
    icon: menu("À propos").icon,
    // Premier lien : la page À propos elle-même (présentation générale).
    sections: [
      { liens: [{ href: "/a-propos", label: "À propos", icon: IconInfo }, ...menu("À propos").liens] },
      { titre: "Plateforme", liens: menu("Plateforme").liens },
    ],
  },
  {
    titre: "Informations légales",
    icon: menu("Informations légales").icon,
    sections: [{ liens: menu("Informations légales").liens }],
  },
];
