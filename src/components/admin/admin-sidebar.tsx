import {
  IconHome,
  IconCalendar,
  IconGraduationCap,
  IconShieldAlert,
  IconOrganisation,
  IconUsers,
  IconKey,
  IconHistory,
  IconPlug,
  IconAlertTriangle,
  IconBarChart,
  IconLock,
  IconChecklist,
  IconSettings,
  IconUser,
  IconDevices,
} from "@/components/icons";
import type { GroupeNav } from "@/components/shell/sidebar-nav";

// Phase 5 — regroupement en sections repliables (14 liens à plat en Phase
// 0-4, jugé trop dense pour une sidebar premium, voir FRONTEND_AUDIT.md §1).
export const GROUPES_ADMIN: GroupeNav[] = [
  { liens: [{ href: "/admin", label: "Tableau de bord", icon: IconHome, exact: true }] },
  {
    titre: "Alertes & analyse",
    liens: [
      { href: "/admin/alertes", label: "Alertes", icon: IconAlertTriangle },
      { href: "/admin/analytics", label: "Analytics", icon: IconBarChart },
      { href: "/admin/conformite", label: "Conformité", icon: IconChecklist },
      { href: "/admin/audit", label: "Audit", icon: IconHistory },
    ],
  },
  {
    titre: "Gestion",
    liens: [
      { href: "/admin/etablissements", label: "Établissements", icon: IconOrganisation },
      { href: "/admin/utilisateurs", label: "Utilisateurs", icon: IconUsers },
      { href: "/admin/roles", label: "Rôles & permissions", icon: IconKey },
    ],
  },
  {
    titre: "Opérations",
    liens: [
      { href: "/admin/reservations", label: "Réservations", icon: IconCalendar },
      { href: "/admin/formations", label: "Formations", icon: IconGraduationCap },
      { href: "/admin/types-ei", label: "Types d'EI", icon: IconShieldAlert },
      { href: "/admin/grilles", label: "Grilles d'auto-évaluation", icon: IconChecklist },
    ],
  },
  {
    titre: "Système",
    liens: [
      { href: "/admin/integrations", label: "Intégrations", icon: IconPlug },
      { href: "/admin/parametres", label: "Paramètres", icon: IconSettings },
      { href: "/admin/securite", label: "Sécurité", icon: IconLock },
    ],
  },
  {
    titre: "Compte",
    liens: [
      { href: "/admin/profil", label: "Profil", icon: IconUser },
      { href: "/admin/mes-sessions", label: "Mes sessions", icon: IconDevices },
    ],
    avecDeconnexion: true,
  },
];
