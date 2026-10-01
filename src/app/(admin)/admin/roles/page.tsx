import type { Metadata } from "next";
import { ROLE_PERMISSIONS } from "@dps/shared";
import { Reveal } from "@/components/motion/reveal";
import { PageHeader } from "@/components/ui/page-header";
import { IconCheck } from "@/components/icons";

export const metadata: Metadata = {
  title: "Administration · Rôles & permissions",
  robots: { index: false, follow: false },
};

const LIBELLES_ROLE: Record<string, string> = {
  RESPONSABLE_COMPTE: "Responsable de compte",
  RESP_QUALITE: "Responsable qualité",
  PERSONNEL_SOIGNANT: "Personnel soignant",
  GESTIONNAIRE_FORMATION: "Gestionnaire formation",
  ADMIN_PLATEFORME: "Admin plateforme",
};

// Les codes de permission suivent la forme DOMAINE_ACTION (packages/shared) :
// le libellé est une traduction directe de ces deux parties, le code reste
// affiché à côté.
const DOMAINES: Record<string, string> = {
  ORGANISATIONS: "Établissements",
  USERS: "Utilisateurs",
  NEWS: "Score NEWS",
  EI: "Événements indésirables",
  AUTO_EVALUATION: "Auto-évaluation",
  FORMATIONS: "Formations",
  RESERVATIONS: "Réservations",
  AUDIT: "Journal d'audit",
  INTEGRATIONS: "Intégrations",
  ALERTES: "Alertes",
  ANALYTICS: "Analytics",
  PARAMETRES: "Paramètres",
  SECURITE: "Sécurité",
};

const ACTIONS: Record<string, string> = {
  READ: "Consulter",
  CREATE: "Créer",
  UPDATE: "Modifier",
  MANAGE: "Gérer",
  DISABLE: "Désactiver",
  EXPORT: "Exporter",
};

function decomposer(permission: string): { domaine: string; action: string } {
  const i = permission.lastIndexOf("_");
  return { domaine: permission.slice(0, i), action: permission.slice(i + 1) };
}

export default function AdminRolesPage() {
  const roles = Object.keys(ROLE_PERMISSIONS) as Array<keyof typeof ROLE_PERMISSIONS>;
  // Lignes : toutes les permissions attribuées à au moins un rôle, groupées par domaine.
  const permissions = [...new Set(roles.flatMap((r) => [...ROLE_PERMISSIONS[r]]))] as string[];
  const parDomaine = new Map<string, string[]>();
  for (const p of permissions) {
    const { domaine } = decomposer(p);
    parDomaine.set(domaine, [...(parDomaine.get(domaine) ?? []), p]);
  }
  const ordreDomaines = [...Object.keys(DOMAINES).filter((d) => parDomaine.has(d)), ...[...parDomaine.keys()].filter((d) => !(d in DOMAINES))];

  return (
    <div>
      <Reveal>
        <PageHeader
          surtitre="Gestion"
          titre="Rôles & permissions"
          description="Catalogue des permissions accordées à chaque rôle, en lecture seule. Pour attribuer un rôle à un utilisateur, ouvrez sa fiche dans « Utilisateurs »."
        />
      </Reveal>

      <Reveal delay={0.05} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {roles.map((r) => (
          <div key={r} className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-[var(--shadow-card)]">
            <p className="text-sm font-medium text-text">{LIBELLES_ROLE[r] ?? r}</p>
            <p className="mt-1 text-xs text-text-faint">
              <span className="font-display text-lg font-bold text-text tabular-nums">{ROLE_PERMISSIONS[r].length}</span>{" "}
              permission{ROLE_PERMISSIONS[r].length > 1 ? "s" : ""}
            </p>
          </div>
        ))}
      </Reveal>

      <Reveal delay={0.1} className="mt-6 overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-card)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-subtle/70">
                <th className="px-4 py-3 text-xs font-semibold text-text-muted">Permission</th>
                {roles.map((r) => (
                  <th key={r} className="px-3 py-3 text-center text-xs font-semibold text-text-muted">
                    {LIBELLES_ROLE[r] ?? r}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ordreDomaines.map((domaine) => (
                <DomaineLignes
                  key={domaine}
                  domaine={domaine}
                  permissions={parDomaine.get(domaine)!}
                  roles={roles}
                />
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>
    </div>
  );
}

function DomaineLignes({
  domaine,
  permissions,
  roles,
}: {
  domaine: string;
  permissions: string[];
  roles: Array<keyof typeof ROLE_PERMISSIONS>;
}) {
  return (
    <>
      <tr className="border-b border-border bg-bg-subtle/30">
        <td colSpan={roles.length + 1} className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-text-faint">
          {DOMAINES[domaine] ?? domaine}
        </td>
      </tr>
      {permissions.map((p) => {
        const { action } = decomposer(p);
        return (
          <tr key={p} className="border-b border-border transition-colors last:border-0 hover:bg-bg-subtle/50">
            <td className="px-4 py-2.5">
              <span className="text-text">{ACTIONS[action] ?? action}</span>
              <span className="ml-2 font-mono text-[0.6875rem] text-text-faint">{p}</span>
            </td>
            {roles.map((r) => {
              const accorde = (ROLE_PERMISSIONS[r] as readonly string[]).includes(p);
              return (
                <td key={r} className="px-3 py-2.5 text-center">
                  {accorde ? (
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-success-soft text-success">
                      <IconCheck width={14} height={14} strokeWidth={2.4} />
                      <span className="sr-only">Accordée</span>
                    </span>
                  ) : (
                    <span className="text-text-faint" aria-label="Non accordée">
                      ·
                    </span>
                  )}
                </td>
              );
            })}
          </tr>
        );
      })}
    </>
  );
}
