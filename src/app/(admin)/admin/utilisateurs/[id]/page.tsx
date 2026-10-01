import { notFound } from "next/navigation";
import Link from "next/link";
import { apiFetchJson, ApiError, silencieux } from "@/lib/api-server";
import { formaterDate } from "@/lib/format";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { ListeProprietes } from "@/components/ui/fiche";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { ToggleUtilisateurButton } from "@/components/admin/toggle-utilisateur-button";
import { SessionsList } from "@/components/comptes/sessions-list";
import { RoleForm, RetirerRoleButton } from "@/components/admin/role-form";
import { AuditTable } from "@/components/admin/audit-table";
import type { JournalAuditEntry, SessionUtilisateur, UtilisateurAdmin } from "@/lib/types";

const LIBELLES_ROLE: Record<string, string> = {
  RESPONSABLE_COMPTE: "Responsable de compte",
  RESP_QUALITE: "Responsable qualité",
  PERSONNEL_SOIGNANT: "Personnel soignant",
  GESTIONNAIRE_FORMATION: "Gestionnaire formation",
  ADMIN_PLATEFORME: "Admin plateforme",
};

const LIBELLES_TYPE_COMPTE: Record<UtilisateurAdmin["typeCompte"], string> = {
  ORGANISATION: "Compte établissement",
  INDIVIDUEL: "Compte individuel",
  ADMIN_PLATEFORME: "Administration de la plateforme",
};

export default async function UtilisateurDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let utilisateur: UtilisateurAdmin;
  let sessions: SessionUtilisateur[];
  try {
    [utilisateur, sessions] = await Promise.all([
      apiFetchJson<UtilisateurAdmin>(`/utilisateurs/${id}`),
      apiFetchJson<SessionUtilisateur[]>(`/utilisateurs/${id}/sessions`),
    ]);
  } catch (erreur) {
    if (erreur instanceof ApiError && erreur.status === 404) notFound();
    throw erreur;
  }

  // Actions effectuées par cet utilisateur (filtre utilisateurId existant de l'API).
  const activite = await silencieux(
    apiFetchJson<JournalAuditEntry[]>(`/audit?utilisateurId=${encodeURIComponent(id)}`),
    null,
  );

  const initiales = `${utilisateur.prenom.charAt(0)}${utilisateur.nom.charAt(0)}`.toUpperCase();

  const onglets = [
    {
      id: "sessions",
      label: "Sessions",
      compteur: sessions.length,
      content: <SessionsList utilisateurId={utilisateur.id} sessions={sessions} />,
    },
    ...(activite
      ? [
          {
            id: "activite",
            label: "Activité",
            compteur: activite.length,
            content: <AuditTable entrees={activite} idTable="admin-utilisateur-audit" synchroniserUrl={false} />,
          },
        ]
      : []),
  ];

  return (
    <div>
      <Reveal>
        <PageHeader
          filAriane={[{ label: "Utilisateurs", href: "/admin/utilisateurs" }, { label: `${utilisateur.prenom} ${utilisateur.nom}` }]}
          titre={
            <span className="inline-flex flex-wrap items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-soft to-accent-soft text-base font-semibold text-primary">
                {initiales}
              </span>
              {utilisateur.prenom} {utilisateur.nom}
              {utilisateur.actif ? <Badge variant="success">Actif</Badge> : <Badge variant="neutral">Désactivé</Badge>}
            </span>
          }
          description={utilisateur.email}
          actions={<ToggleUtilisateurButton utilisateurId={utilisateur.id} actif={utilisateur.actif} />}
        />
      </Reveal>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-6 xl:order-2">
          <Reveal delay={0.05}>
            <Card>
              <CardHeader titre="Informations" />
              <ListeProprietes
                elements={[
                  {
                    label: "Établissement",
                    valeur: utilisateur.organisation ? (
                      <Link href={`/admin/etablissements/${utilisateur.organisation.id}`} className="text-primary hover:underline">
                        {utilisateur.organisation.nom}
                      </Link>
                    ) : null,
                    vide: "Aucun établissement",
                  },
                  { label: "Type de compte", valeur: LIBELLES_TYPE_COMPTE[utilisateur.typeCompte] ?? utilisateur.typeCompte },
                  {
                    label: "Email vérifié",
                    valeur: utilisateur.emailVerifieLe ? `Le ${formaterDate(utilisateur.emailVerifieLe)}` : null,
                    vide: "Non vérifié",
                  },
                  { label: "Inscrit le", valeur: formaterDate(utilisateur.createdAt) },
                ]}
              />
            </Card>
          </Reveal>

          <Reveal delay={0.1}>
            <Card>
              <CardHeader titre="Rôles" description="Retirer un rôle demande une confirmation" />
              {utilisateur.roles.length === 0 ? (
                <p className="text-sm text-text-faint">Aucun rôle attribué.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {utilisateur.roles.map((r) => (
                    <span
                      key={r.role}
                      className="flex items-center rounded-full bg-primary-soft py-1 pl-2.5 pr-1 text-xs font-medium text-primary"
                    >
                      {LIBELLES_ROLE[r.role] ?? r.role}
                      <RetirerRoleButton utilisateurId={utilisateur.id} role={r.role} />
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-5 border-t border-border pt-5">
                <RoleForm utilisateurId={utilisateur.id} rolesActuels={utilisateur.roles.map((r) => r.role)} />
              </div>
            </Card>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="min-w-0 xl:order-1 xl:col-span-2">
          <Tabs items={onglets} />
        </Reveal>
      </div>
    </div>
  );
}
