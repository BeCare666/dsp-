import { notFound } from "next/navigation";
import { apiFetchJson, ApiError, silencieux } from "@/lib/api-server";
import { formaterDate } from "@/lib/format";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, StatCard } from "@/components/ui/card";
import { ListeProprietes } from "@/components/ui/fiche";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { ToggleOrganisationButton } from "@/components/admin/toggle-organisation-button";
import { UtilisateursTable } from "@/components/admin/utilisateurs-table";
import { AuditTable } from "@/components/admin/audit-table";
import { AbonnementsEtablissement } from "@/components/admin/abonnements-etablissement";
import { LIBELLES_STATUT_EI } from "@/components/ei/badges";
import { StatutReservationBadge } from "@/components/reservations/badges";
import { IconCalendar, IconShieldAlert, IconUsers, IconVitals } from "@/components/icons";
import type { JournalAuditEntry, OrganisationDetailAdmin, UtilisateurAdmin } from "@/lib/types";

const LIBELLES_TYPE = {
  EH: "Établissement hospitalier (EH)",
  ESPC: "Établissement de soins de premiers contacts (ESPC)",
} as const;

// wa.me attend le numéro au format international, chiffres uniquement.
function lienWhatsApp(telephone: string | null): string | null {
  const chiffres = (telephone ?? "").replace(/\D/g, "");
  return chiffres.length >= 8 ? `https://wa.me/${chiffres}` : null;
}

export default async function EtablissementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let organisation: OrganisationDetailAdmin;
  try {
    organisation = await apiFetchJson<OrganisationDetailAdmin>(`/organisations/${id}`);
  } catch (erreur) {
    if (erreur instanceof ApiError && erreur.status === 404) notFound();
    throw erreur;
  }

  // Filtres organisationId déjà gérés par l'API (ListUtilisateursQueryDto, ListAuditQueryDto).
  const [utilisateurs, activite] = await Promise.all([
    silencieux(apiFetchJson<UtilisateurAdmin[]>(`/utilisateurs?organisationId=${encodeURIComponent(id)}`), null),
    silencieux(apiFetchJson<JournalAuditEntry[]>(`/audit?organisationId=${encodeURIComponent(id)}`), null),
  ]);

  const evaluations = organisation.sessionsEvaluation ?? [];
  const onglets = [
    {
      id: "evaluations",
      label: "Évaluations",
      compteur: evaluations.length,
      content:
        evaluations.length === 0 ? (
          <p className="text-sm text-text-muted">Aucune auto-évaluation soumise.</p>
        ) : (
          <ul className="divide-y divide-border rounded-[var(--radius-md)] border border-border">
            {evaluations.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="min-w-0">
                  <span className="block font-medium text-text">
                    {e.grille.nom} · v{e.grille.version}
                  </span>
                  <span className="text-xs text-text-muted">{e.dateSoumission ? formaterDate(e.dateSoumission) : "—"}</span>
                </span>
                <span className="font-display text-base font-bold text-text tabular-nums">{e.scoreGlobal ?? "—"} %</span>
              </li>
            ))}
          </ul>
        ),
    },
    {
      // §12.1 / §12.3 — alertes cliniques et EI agrégés, jamais au niveau patient.
      id: "alertes-ei",
      label: "Alertes & EI",
      compteur:
        (organisation.alertesNews ?? []).reduce((t, a) => t + a.nombre, 0) +
        Object.values(organisation.evenementsParStatut ?? {}).reduce((t, n) => t + n, 0),
      content: (
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium text-text">Alertes NEWS</p>
            {(organisation.alertesNews ?? []).length === 0 ? (
              <p className="text-sm text-text-muted">Aucune alerte.</p>
            ) : (
              <ul className="flex flex-col gap-1 text-sm">
                {(organisation.alertesNews ?? []).map((a) => (
                  <li key={`${a.niveauRisque}-${a.statut}`} className="flex justify-between gap-3">
                    <span className="text-text-muted">
                      Risque {a.niveauRisque === "ELEVE" ? "élevé" : "moyen"} · {a.statut === "OUVERTE" ? "ouvertes" : a.statut === "EN_COURS" ? "en cours" : "clôturées"}
                    </span>
                    <span className="font-medium tabular-nums">{a.nombre}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-text">Événements indésirables par statut</p>
            {Object.keys(organisation.evenementsParStatut ?? {}).length === 0 ? (
              <p className="text-sm text-text-muted">Aucun événement.</p>
            ) : (
              <ul className="flex flex-col gap-1 text-sm">
                {Object.entries(organisation.evenementsParStatut ?? {}).map(([statut, n]) => (
                  <li key={statut} className="flex justify-between gap-3">
                    <span className="text-text-muted">{LIBELLES_STATUT_EI[statut as keyof typeof LIBELLES_STATUT_EI] ?? statut}</span>
                    <span className="font-medium tabular-nums">{n}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ),
    },
    {
      // §12.1 — formations réservées par l'établissement.
      id: "formations",
      label: "Formations",
      compteur: (organisation.reservationsFormations ?? []).length,
      content:
        (organisation.reservationsFormations ?? []).length === 0 ? (
          <p className="text-sm text-text-muted">Aucune formation réservée.</p>
        ) : (
          <ul className="divide-y divide-border rounded-[var(--radius-md)] border border-border text-sm">
            {(organisation.reservationsFormations ?? []).map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <span className="min-w-0">
                  <span className="block font-medium text-text">{r.formation.titre}</span>
                  <span className="text-xs text-text-muted">
                    Réservée le {formaterDate(r.createdAt)}
                    {r.dateRdv ? ` · session le ${formaterDate(r.dateRdv)}` : ""}
                  </span>
                </span>
                <StatutReservationBadge statut={r.statut} />
              </li>
            ))}
          </ul>
        ),
    },
    utilisateurs && {
      id: "utilisateurs",
      label: "Utilisateurs",
      compteur: utilisateurs.length,
      content: (
        <UtilisateursTable utilisateurs={utilisateurs} idTable="admin-etablissement-utilisateurs" synchroniserUrl={false} />
      ),
    },
    activite && {
      id: "activite",
      label: "Activité",
      compteur: activite.length,
      content: <AuditTable entrees={activite} idTable="admin-etablissement-audit" synchroniserUrl={false} />,
    },
  ].filter((o): o is NonNullable<typeof o> => Boolean(o));

  return (
    <div>
      <Reveal>
        <PageHeader
          filAriane={[{ label: "Établissements", href: "/admin/etablissements" }, { label: organisation.nom }]}
          surtitre={LIBELLES_TYPE[organisation.type]}
          titre={
            <span className="inline-flex flex-wrap items-center gap-3">
              {organisation.nom}
              {organisation.actif ? <Badge variant="success">Actif</Badge> : <Badge variant="neutral">Inactif</Badge>}
            </span>
          }
          description={`IFU ${organisation.ifu} · inscrit le ${formaterDate(organisation.createdAt)}`}
          actions={<ToggleOrganisationButton organisationId={organisation.id} actif={organisation.actif} />}
        />
      </Reveal>

      <Reveal delay={0.05} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Utilisateurs" valeur={`${organisation._count.utilisateurs}`} icone={IconUsers} ton="info" />
        <StatCard label="Patients (NEWS)" valeur={`${organisation._count.patients}`} icone={IconVitals} />
        <StatCard
          label="Événements indésirables"
          valeur={`${organisation._count.evenementsIndesirables}`}
          icone={IconShieldAlert}
          ton="warning"
        />
        <StatCard label="Réservations" valeur={`${organisation._count.reservations}`} icone={IconCalendar} ton="accent" />
      </Reveal>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Reveal delay={0.1} className="flex flex-col gap-6 xl:order-2">
          <Card>
            <CardHeader titre="Modules et abonnements" description="Statut par module, actions manuelles (§12.1)" />
            <AbonnementsEtablissement organisationId={organisation.id} abonnements={organisation.abonnementsModule ?? []} />
          </Card>
          <Card>
            <CardHeader titre="Coordonnées" />
            <ListeProprietes
              elements={[
                { label: "Adresse", valeur: organisation.adresse, vide: "Non renseignée" },
                { label: "Téléphone", valeur: organisation.telephone },
                {
                  // §12.1 — contact direct via WhatsApp (numéro au format international).
                  label: "WhatsApp",
                  valeur: lienWhatsApp(organisation.telephone) ? (
                    <a
                      href={lienWhatsApp(organisation.telephone)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Contacter l&apos;établissement
                    </a>
                  ) : null,
                  vide: "Numéro non renseigné",
                },
                {
                  label: "Email",
                  valeur: organisation.email ? (
                    <a href={`mailto:${organisation.email}`} className="text-primary hover:underline">
                      {organisation.email}
                    </a>
                  ) : null,
                },
                { label: "IFU", valeur: <span className="font-mono text-xs">{organisation.ifu}</span> },
                { label: "Inscrit le", valeur: formaterDate(organisation.createdAt) },
              ]}
            />
          </Card>
        </Reveal>

        <Reveal delay={0.15} className="min-w-0 xl:order-1 xl:col-span-2">
          {onglets.length > 0 ? (
            <Tabs items={onglets} />
          ) : (
            <p className="text-sm text-text-muted">Utilisateurs et activité indisponibles pour l&apos;instant.</p>
          )}
        </Reveal>
      </div>
    </div>
  );
}
