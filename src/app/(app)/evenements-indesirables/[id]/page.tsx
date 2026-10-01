import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { apiFetchJson, ApiError, silencieux } from "@/lib/api-server";
import { obtenirSession, aRole, ROLES_TRAITEMENT_EI } from "@/lib/session";
import { formaterDate, formaterDateHeure } from "@/lib/format";
import { Reveal } from "@/components/motion/reveal";
import { Card, CardHeader } from "@/components/ui/card";
import { ListeProprietes } from "@/components/ui/fiche";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import {
  GraviteBadge,
  LIBELLES_PRIORITE_EI,
  LIBELLES_STATUT_EI,
  PrioriteBadge,
  StatutActionBadge,
  StatutEiBadge,
} from "@/components/ei/badges";
import { QualifierForm } from "@/components/ei/qualifier-form";
import { CauseForm } from "@/components/ei/cause-form";
import { ActionCorrectiveForm } from "@/components/ei/action-corrective-form";
import { StatutActionButtons } from "@/components/ei/statut-action-buttons";
import { StatutEiButtons } from "@/components/ei/statut-ei-buttons";
import { PieceJointeForm } from "@/components/ei/piece-jointe-form";
import { CorrectionEi } from "@/components/ei/correction-ei";
import type {
  EvenementIndesirable,
  MembreEtablissement,
  NiveauGraviteEi,
  ServiceEtablissement,
  StatutEi,
  TypeEi,
} from "@/lib/types";

const ETAPES: StatutEi[] = ["DECLARE", "QUALIFIE", "EN_ANALYSE", "PLAN_ACTION", "CLOTURE"];

function Compteur({ n }: { n: number }) {
  return <span className="ml-2 rounded-full bg-bg-subtle px-2 py-0.5 text-xs font-medium text-text-muted tabular-nums">{n}</span>;
}

function Vide({ children }: { children: ReactNode }) {
  return <p className="rounded-[var(--radius-md)] border border-dashed border-border px-4 py-5 text-center text-sm text-text-faint">{children}</p>;
}

// §8.2 — progression dans le circuit de traitement.
function Circuit({ statut }: { statut: StatutEi }) {
  const courant = ETAPES.indexOf(statut);
  return (
    <ol className="flex flex-wrap items-center gap-2 text-xs">
      {ETAPES.map((e, i) => (
        <li key={e} className="flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 font-medium ${
              i < courant ? "bg-success-soft text-success" : i === courant ? "bg-primary text-primary-foreground" : "bg-bg-subtle text-text-faint"
            }`}
          >
            {LIBELLES_STATUT_EI[e]}
          </span>
          {i < ETAPES.length - 1 && <span className="text-text-faint">→</span>}
        </li>
      ))}
    </ol>
  );
}

export default async function EvenementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let evenement: EvenementIndesirable;
  try {
    evenement = await apiFetchJson<EvenementIndesirable>(`/evenements-indesirables/${id}`);
  } catch (erreur) {
    if (erreur instanceof ApiError && erreur.status === 404) notFound();
    throw erreur;
  }

  const [session, peutTraiter] = await Promise.all([obtenirSession(), aRole(...ROLES_TRAITEMENT_EI)]);
  const [niveauxGravite, typesEi, membres, services] = peutTraiter
    ? await Promise.all([
        silencieux(apiFetchJson<NiveauGraviteEi[]>("/niveaux-gravite-ei"), []),
        silencieux(apiFetchJson<TypeEi[]>("/types-ei"), []),
        silencieux(apiFetchJson<MembreEtablissement[]>("/organisation/membres"), []),
        silencieux(apiFetchJson<ServiceEtablissement[]>("/organisation/services"), []),
      ])
    : [[], [], [], []];

  const causes = evenement.causes ?? [];
  const actions = evenement.actionsCorrectives ?? [];
  const pieces = evenement.piecesJointes ?? [];
  const transitions = evenement.transitions ?? [];
  const cloture = evenement.statut === "CLOTURE";
  const peutDocumenterCauses = peutTraiter && (evenement.statut === "EN_ANALYSE" || evenement.statut === "PLAN_ACTION");
  const peutAjouterActions = peutTraiter && evenement.statut === "PLAN_ACTION";

  return (
    <PageContainer>
      <Reveal>
        <PageHeader
          filAriane={[{ label: "Événements indésirables", href: "/evenements-indesirables" }, { label: "Détail" }]}
          surtitre="Événement indésirable"
          titre={<span className="block max-w-3xl">{evenement.description}</span>}
          description={`Survenu le ${formaterDateHeure(evenement.dateSurvenue)} · déclaré le ${formaterDate(evenement.dateDeclaration)}${
            evenement.declarePar ? ` par ${evenement.declarePar.prenom} ${evenement.declarePar.nom}` : ""
          }`}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <GraviteBadge niveau={evenement.niveauGravite} />
              <PrioriteBadge priorite={evenement.priorite} />
              <StatutEiBadge statut={evenement.statut} />
            </div>
          }
        />
      </Reveal>

      <Reveal delay={0.03} className="mb-6">
        <Circuit statut={evenement.statut} />
      </Reveal>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-6 xl:col-span-2">
          {peutTraiter && evenement.statut === "DECLARE" && (
            <Reveal delay={0.05}>
              <Card className="border-warning/30">
                <CardHeader titre="Qualification" description="Confirmer la gravité et la catégorie, fixer la priorité" />
                <QualifierForm evenement={evenement} niveauxGravite={niveauxGravite} typesEi={typesEi} />
              </Card>
            </Reveal>
          )}

          {peutTraiter && evenement.statut !== "DECLARE" && !cloture && (
            <Reveal delay={0.05}>
              <Card>
                <CardHeader titre="Traitement" description="Faire avancer l'événement dans le circuit" />
                <StatutEiButtons eiId={evenement.id} statutActuel={evenement.statut} />
              </Card>
            </Reveal>
          )}

          <Reveal delay={0.1}>
            <Card>
              <CardHeader
                titre={
                  <>
                    Analyse des causes
                    <Compteur n={causes.length} />
                  </>
                }
              />
              {causes.length === 0 ? (
                <Vide>Aucune cause documentée pour l&apos;instant.</Vide>
              ) : (
                <ul className="flex flex-col gap-3">
                  {causes.map((c) => (
                    <li key={c.id} className="rounded-[var(--radius-md)] border border-border bg-bg-subtle/40 p-4">
                      <span
                        className={`text-xs font-semibold uppercase tracking-wide ${
                          c.type === "IMMEDIATE" ? "text-warning" : "text-info"
                        }`}
                      >
                        {c.type === "IMMEDIATE" ? "Cause immédiate" : "Cause profonde"}
                      </span>
                      {(c.pourquois ?? []).length > 0 && (
                        <ol className="mt-2 flex flex-col gap-1 text-sm text-text-muted">
                          {(c.pourquois ?? []).map((p, i) => (
                            <li key={i}>
                              <span className="font-medium text-text">Pourquoi ? ({i + 1})</span> {p}
                            </li>
                          ))}
                        </ol>
                      )}
                      <p className="mt-2 text-sm leading-6 text-text">
                        <span className="font-medium">Cause retenue :</span> {c.description}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              {peutDocumenterCauses && (
                <div className="mt-5 border-t border-border pt-5">
                  <CauseForm eiId={evenement.id} />
                </div>
              )}
            </Card>
          </Reveal>

          <Reveal delay={0.15}>
            <Card>
              <CardHeader
                titre={
                  <>
                    Plan d&apos;action correctif
                    <Compteur n={actions.length} />
                  </>
                }
              />
              {actions.length === 0 ? (
                <Vide>Aucune action corrective pour l&apos;instant.</Vide>
              ) : (
                <ul className="flex flex-col gap-3">
                  {actions.map((a) => (
                    <li key={a.id} className="rounded-[var(--radius-md)] border border-border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm leading-6 text-text">{a.description}</p>
                        <StatutActionBadge statut={a.statut} />
                      </div>
                      <p className="mt-1.5 text-xs text-text-faint">
                        Responsable : {a.responsable ? `${a.responsable.prenom} ${a.responsable.nom}` : "—"} · Échéance :{" "}
                        {formaterDate(a.echeance)}
                      </p>
                      {peutTraiter && !cloture && a.statut !== "REALISEE" && (
                        <div className="mt-3">
                          <StatutActionButtons eiId={evenement.id} actionId={a.id} statutActuel={a.statut} />
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {peutAjouterActions && session && (
                <div className="mt-5 border-t border-border pt-5">
                  <ActionCorrectiveForm eiId={evenement.id} membres={membres} moiId={session.sub} />
                </div>
              )}
            </Card>
          </Reveal>

          <Reveal delay={0.2}>
            <Card>
              <CardHeader
                titre={
                  <>
                    Pièces jointes
                    <Compteur n={pieces.length} />
                  </>
                }
              />
              {pieces.length === 0 ? (
                <Vide>Aucune pièce jointe.</Vide>
              ) : (
                <ul className="flex flex-col gap-2">
                  {pieces.map((p) => (
                    <li key={p.id}>
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-border px-4 py-3 text-sm text-primary transition-colors hover:border-primary/30 hover:bg-primary-soft/40"
                      >
                        <span className="truncate font-medium">{p.nomFichier}</span>
                        <span className="shrink-0 text-xs text-text-faint">{formaterDateHeure(p.createdAt)}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              {peutTraiter && (
                <div className="mt-5 border-t border-border pt-5">
                  <PieceJointeForm eiId={evenement.id} />
                </div>
              )}
            </Card>
          </Reveal>

          <Reveal delay={0.25}>
            <Card>
              <CardHeader titre="Corrections de la fiche" description="Toute modification est tracée (motif, auteur, date)" />
              <CorrectionEi evenement={evenement} services={services} peutCorriger={peutTraiter} />
            </Card>
          </Reveal>
        </div>

        <div className="flex flex-col gap-6">
          <Reveal delay={0.1}>
            <Card>
              <CardHeader titre="Fiche de déclaration" />
              <ListeProprietes
                elements={[
                  { label: "Survenu le", valeur: formaterDateHeure(evenement.dateSurvenue) },
                  { label: "Service", valeur: evenement.service?.nom, vide: "Non précisé" },
                  { label: "Lieu", valeur: evenement.lieu, vide: "Non précisé" },
                  { label: "Type", valeur: evenement.typeEi?.libelle, vide: "Non précisé" },
                  { label: "Gravité", valeur: evenement.niveauGravite?.libelle, vide: "Non renseignée" },
                  {
                    label: "Priorité",
                    valeur: evenement.priorite ? LIBELLES_PRIORITE_EI[evenement.priorite] : null,
                    vide: "Fixée à la qualification",
                  },
                  { label: "Personnes impliquées ou témoins", valeur: evenement.personnesImpliquees },
                  { label: "Déclaré le", valeur: formaterDateHeure(evenement.dateDeclaration) },
                  {
                    label: "Déclarant",
                    valeur: evenement.declarePar ? `${evenement.declarePar.prenom} ${evenement.declarePar.nom}` : null,
                  },
                  {
                    label: "Critère d'auto-évaluation lié",
                    valeur: evenement.critere ? `${evenement.critere.code} · ${evenement.critere.libelle}` : null,
                    vide: "Aucun",
                  },
                  {
                    label: "Clôturé le",
                    valeur: evenement.dateCloture ? formaterDateHeure(evenement.dateCloture) : null,
                    vide: "Non clôturé",
                  },
                ]}
              />
            </Card>
          </Reveal>

          <Reveal delay={0.15}>
            <Card>
              <CardHeader titre="Chronologie" description="Historique des transitions (qui, quand)" />
              <ol className="relative flex flex-col gap-4 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-px before:bg-border">
                <li className="relative pl-6">
                  <span className="absolute left-0 top-1.5 h-[11px] w-[11px] rounded-full border-2 border-surface bg-primary" />
                  <p className="text-sm font-medium text-text">Déclaration</p>
                  <p className="text-xs text-text-faint">{formaterDateHeure(evenement.dateDeclaration)}</p>
                </li>
                {transitions.map((t) => (
                  <li key={t.id} className="relative pl-6">
                    <span
                      className={`absolute left-0 top-1.5 h-[11px] w-[11px] rounded-full border-2 border-surface ${
                        t.nouveauStatut === "CLOTURE" ? "bg-success" : "bg-warning"
                      }`}
                    />
                    <p className="text-sm text-text">
                      {LIBELLES_STATUT_EI[t.ancienStatut]} <span className="text-text-faint">→</span>{" "}
                      <span className="font-medium">{LIBELLES_STATUT_EI[t.nouveauStatut]}</span>
                    </p>
                    <p className="text-xs text-text-faint">
                      {formaterDateHeure(t.createdAt)}
                      {t.utilisateur ? ` · ${t.utilisateur.prenom} ${t.utilisateur.nom}` : ""}
                    </p>
                  </li>
                ))}
              </ol>
            </Card>
          </Reveal>
        </div>
      </div>
    </PageContainer>
  );
}
