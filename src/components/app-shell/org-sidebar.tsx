import {
  IconHome,
  IconChecklist,
  IconVitals,
  IconShieldAlert,
  IconGraduationCap,
  IconCalendar,
  IconOrganisation,
  IconUser,
  IconSettings,
  IconUsers,
  IconHospital,
  IconFileText,
  IconKey,
} from "@/components/icons";
import type { GroupeNav, LienNav } from "@/components/shell/sidebar-nav";
import type { RoleUtilisateur } from "@dps/shared";

// Sidebar côté organisation. « Paramètres » pointe vers la page de sécurité du
// compte (/mes-sessions, sessions actives) : c'est aujourd'hui le seul réglage
// propre à un compte utilisateur.
const GROUPE_TABLEAU_DE_BORD: GroupeNav = {
  liens: [{ href: "/tableau-de-bord", label: "Tableau de bord", icon: IconHome, exact: true }],
};

const GROUPE_FORMATIONS: GroupeNav = {
  titre: "Formations",
  liens: [
    { href: "/formations", label: "Catalogue", icon: IconGraduationCap },
    { href: "/mes-reservations", label: "Mes réservations", icon: IconCalendar },
    { href: "/factures", label: "Factures", icon: IconFileText },
  ],
};

const GROUPE_COMPTE: GroupeNav = {
  titre: "Compte",
  liens: [
    { href: "/profil", label: "Profil", icon: IconUser },
    { href: "/mes-sessions", label: "Paramètres", icon: IconSettings },
  ],
  avecDeconnexion: true,
};

// §4.2 — la navigation ne montre que les modules ouverts aux rôles de
// l'utilisateur (confort d'affichage : l'API revérifie toujours les rôles).
// - Auto-évaluation : responsable du compte, responsable qualité ;
// - NEWS : personnel soignant, responsable qualité, responsable du compte ;
// - Événements indésirables : tout membre (déclaration ouverte à toute
//   personne habilitée, §8.1) ;
// - Mes réservations : responsable du compte, gestionnaire formation ;
// - Établissement (coordonnées, services, équipe) : responsable du compte.
export function groupesOrganisation(roles: readonly RoleUtilisateur[]): GroupeNav[] {
  const a = (...r: RoleUtilisateur[]) => r.some((role) => roles.includes(role));

  const liensQualite: LienNav[] = [];
  if (a("RESPONSABLE_COMPTE", "RESP_QUALITE")) {
    liensQualite.push({ href: "/auto-evaluation", label: "Auto-évaluation", icon: IconChecklist });
  }
  if (a("RESPONSABLE_COMPTE", "RESP_QUALITE", "PERSONNEL_SOIGNANT")) {
    liensQualite.push({ href: "/news", label: "NEWS", icon: IconVitals });
  }
  liensQualite.push({ href: "/evenements-indesirables", label: "Événements indésirables", icon: IconShieldAlert });
  const qualiteSoins: GroupeNav = { titre: "Qualité & soins", liens: liensQualite };

  // Module Formation d'un établissement : responsable du compte et gestionnaire
  // formation (§4.2) ; le catalogue public reste visible par tous.
  const formations: GroupeNav = a("RESPONSABLE_COMPTE", "GESTIONNAIRE_FORMATION")
    ? GROUPE_FORMATIONS
    : { titre: "Formations", liens: [GROUPE_FORMATIONS.liens[0]] };

  const groupes: GroupeNav[] = [GROUPE_TABLEAU_DE_BORD, qualiteSoins, formations];
  if (a("RESPONSABLE_COMPTE")) {
    groupes.push({
      titre: "Établissement",
      liens: [
        { href: "/organisation", label: "Mon établissement", icon: IconOrganisation, exact: true },
        { href: "/organisation/equipe", label: "Équipe", icon: IconUsers },
        { href: "/organisation/services", label: "Services", icon: IconHospital },
        { href: "/abonnements", label: "Abonnements", icon: IconKey },
      ],
    });
  }
  groupes.push(GROUPE_COMPTE);
  return groupes;
}

// Compte individuel : aucun module métier organisation (RM7, scopé
// organisation_id) — seuls formations/réservations s'appliquent.
export const GROUPES_INDIVIDUEL: GroupeNav[] = [GROUPE_FORMATIONS, GROUPE_COMPTE];
