"use client";

import Link from "next/link";
import { DataTable, type ColonneTable, type FiltreTable, type VueTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { IconBan, IconCheckCircle, IconEye } from "@/components/icons";
import { formaterDate } from "@/lib/format";
import { basculerUtilisateurAction } from "@/lib/admin-actions";
import { useActionConfirmee } from "./use-action-confirmee";
import type { UtilisateurAdmin } from "@/lib/types";

const LIBELLES_ROLE: Record<string, string> = {
  RESPONSABLE_COMPTE: "Responsable de compte",
  RESP_QUALITE: "Responsable qualité",
  PERSONNEL_SOIGNANT: "Personnel soignant",
  GESTIONNAIRE_FORMATION: "Gestionnaire formation",
  ADMIN_PLATEFORME: "Admin plateforme",
};

const LIBELLES_TYPE_COMPTE: Record<UtilisateurAdmin["typeCompte"], string> = {
  ORGANISATION: "Établissement",
  INDIVIDUEL: "Individuel",
  ADMIN_PLATEFORME: "Administration",
};

export function Initiales({ prenom, nom }: { prenom: string; nom: string }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-soft to-accent-soft text-xs font-semibold text-primary">
      {`${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase()}
    </span>
  );
}

export function UtilisateursTable({
  utilisateurs,
  idTable = "admin-utilisateurs",
  synchroniserUrl = true,
}: {
  utilisateurs: UtilisateurAdmin[];
  // Réutilisation dans une fiche (ex. utilisateurs d'un établissement) :
  // préférences séparées et pas d'état dans l'URL de la fiche.
  idTable?: string;
  synchroniserUrl?: boolean;
}) {
  const { lancer, dialogue } = useActionConfirmee();

  const colonnes: ColonneTable<UtilisateurAdmin>[] = [
    {
      cle: "nom",
      entete: "Utilisateur",
      masquable: false,
      render: (u) => (
        <div className="flex items-center gap-3">
          <Initiales prenom={u.prenom} nom={u.nom} />
          <div className="min-w-0">
            <Link href={`/admin/utilisateurs/${u.id}`} className="block truncate font-medium text-text hover:text-primary">
              {u.prenom} {u.nom}
            </Link>
            <p className="truncate text-xs text-text-faint">{u.email}</p>
          </div>
        </div>
      ),
      valeurTri: (u) => `${u.prenom} ${u.nom}`,
      valeurRecherche: (u) => `${u.prenom} ${u.nom} ${u.email} ${u.organisation?.nom ?? ""}`,
      valeurExport: (u) => `${u.prenom} ${u.nom}`,
    },
    {
      cle: "email",
      entete: "Email",
      masqueeParDefaut: true,
      render: (u) => <span className="text-text-muted">{u.email}</span>,
      valeurTri: (u) => u.email,
    },
    {
      cle: "organisation",
      entete: "Établissement",
      render: (u) =>
        u.organisation ? (
          <Link href={`/admin/etablissements/${u.organisation.id}`} className="text-text hover:text-primary">
            {u.organisation.nom}
          </Link>
        ) : (
          <span className="text-text-faint">{LIBELLES_TYPE_COMPTE[u.typeCompte]}</span>
        ),
      valeurTri: (u) => u.organisation?.nom ?? "",
      valeurExport: (u) => u.organisation?.nom ?? LIBELLES_TYPE_COMPTE[u.typeCompte],
    },
    {
      cle: "roles",
      entete: "Rôle(s)",
      render: (u) =>
        u.roles.length === 0 ? (
          <span className="text-text-faint">Aucun rôle</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {u.roles.map((r) => (
              <Badge key={r.role} variant="primary" className="font-medium">
                {LIBELLES_ROLE[r.role] ?? r.role}
              </Badge>
            ))}
          </div>
        ),
      valeurExport: (u) => u.roles.map((r) => LIBELLES_ROLE[r.role] ?? r.role).join(", "),
    },
    {
      cle: "statut",
      entete: "Statut",
      render: (u) =>
        u.actif ? <Badge variant="success">Actif</Badge> : <Badge variant="neutral">Désactivé</Badge>,
      valeurTri: (u) => (u.actif ? 1 : 0),
      valeurExport: (u) => (u.actif ? "Actif" : "Désactivé"),
    },
    {
      cle: "createdAt",
      entete: "Inscrit le",
      render: (u) => <span className="whitespace-nowrap text-text-muted tabular-nums">{formaterDate(u.createdAt)}</span>,
      valeurTri: (u) => u.createdAt,
      valeurExport: (u) => formaterDate(u.createdAt),
    },
  ];

  const filtres: FiltreTable<UtilisateurAdmin>[] = [
    {
      cle: "role",
      label: "Rôle",
      options: Object.entries(LIBELLES_ROLE).map(([valeur, label]) => ({ valeur, label })),
      valeur: (u) => u.roles.map((r) => r.role),
    },
    {
      cle: "type",
      label: "Type de compte",
      options: Object.entries(LIBELLES_TYPE_COMPTE).map(([valeur, label]) => ({ valeur, label })),
      valeur: (u) => u.typeCompte,
    },
  ];

  const vues: VueTable<UtilisateurAdmin>[] = [
    { cle: "tous", label: "Tous" },
    { cle: "actifs", label: "Actifs", filtre: (u) => u.actif },
    { cle: "desactives", label: "Désactivés", filtre: (u) => !u.actif },
  ];

  return (
    <>
      <DataTable
        id={idTable}
        synchroniserUrl={synchroniserUrl}
        colonnes={colonnes}
        lignes={utilisateurs}
        cleLigne={(u) => u.id}
        rechercheEspaceReserve="Nom, email, établissement…"
        filtres={filtres}
        vues={vues}
        triParDefaut={{ cle: "createdAt", direction: "desc" }}
        lienLigne={(u) => `/admin/utilisateurs/${u.id}`}
        exportCsv={{ nomFichier: "utilisateurs-dps" }}
        vide={{ titre: "Aucun utilisateur", description: "Les comptes apparaîtront ici dès les premières inscriptions." }}
        actionsLigne={(u) => [
          { label: "Voir la fiche", icone: IconEye, href: `/admin/utilisateurs/${u.id}` },
          u.actif
            ? {
                label: "Désactiver",
                icone: IconBan,
                danger: true,
                onSelect: () =>
                  lancer(() => basculerUtilisateurAction(u.id, true), "Utilisateur désactivé.", {
                    titre: "Désactiver cet utilisateur ?",
                    description: "Il ne pourra plus se connecter à la plateforme tant que son compte n'est pas réactivé.",
                    confirmLabel: "Désactiver",
                  }),
              }
            : {
                label: "Réactiver",
                icone: IconCheckCircle,
                onSelect: () => lancer(() => basculerUtilisateurAction(u.id, false), "Utilisateur réactivé."),
              },
        ]}
      />
      {dialogue}
    </>
  );
}
