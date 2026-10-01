import type { RoleUtilisateur } from "@dps/shared";

// État partagé des Server Actions qui font une simple mutation (succès/erreur),
// par opposition à EtatFormulaire (lib/auth-actions.ts, flux d'auth qui
// redirigent plutôt que de renvoyer un succès affichable) — Phase 2, élimine
// la duplication littérale qui existait entre admin-actions.ts et auth-actions.ts.
export interface EtatAction {
  erreur?: string;
  succes?: boolean;
}

export interface Formation {
  id: string;
  titre: string;
  description: string;
  // §9 — objectifs de la formation.
  objectifs?: string | null;
  dureeHeures: number | null;
  prixIndividuel: number;
  prixGroupe5: number;
  prixGroupe10: number;
  actif: boolean;
}

export type TypeEtablissement = "EH" | "ESPC";
export type StatutGrille = "BROUILLON" | "PUBLIEE" | "ARCHIVEE";
export type StatutSessionEvaluation = "EN_COURS" | "SOUMISE";
export type TypeReponse = "OUI_NON" | "TEXTE" | "CHOIX";
export type StatutAbonnement = "ESSAI" | "ACTIF" | "EXPIRE" | "SUSPENDU";
export type ModuleMetier = "NEWS" | "EI";

export type Civilite = "M" | "MME";
export type TypeStructure = "HOPITAL" | "CLINIQUE" | "LABORATOIRE" | "PHARMACIE" | "CABINET_MEDICAL" | "AUTRE";

export interface Organisation {
  id: string;
  nom: string;
  raisonSociale: string | null;
  typeStructure: TypeStructure | null;
  ifu: string;
  // Catégorie ARS.
  type: TypeEtablissement;
  // Inclus par la liste admin (§12.1).
  abonnementsModule?: AbonnementModule[];
  adresse: string | null;
  ville: string | null;
  pays: string | null;
  telephone: string | null;
  email: string | null;
  actif: boolean;
  createdAt: string;
}

// §6.2 / §6.6 — nature d'un élément mesurable.
export type TypeElementMesurable = "DOCUMENT_A_EXAMINER" | "ENTRETIEN" | "OBSERVATION";

export interface ElementMesurable {
  id: string;
  libelle: string;
  typeReponse: TypeReponse;
  optionsChoix: string[] | null;
  typeElement?: TypeElementMesurable;
  entreDansScore?: boolean;
  ordre: number;
}

export interface Critere {
  id: string;
  code: string;
  libelle: string;
  categorie?: string | null;
  recommandation?: string | null;
  ordre: number;
  elementsMesurables: ElementMesurable[];
}

export interface Norme {
  id: string;
  code: string;
  libelle: string;
  ordre: number;
  criteres: Critere[];
}

export interface Domaine {
  id: string;
  nom: string;
  ordre: number;
  normes: Norme[];
}

export interface Grille {
  id: string;
  nom: string;
  type: TypeEtablissement;
  version: number;
  statut: StatutGrille;
  domaines?: Domaine[];
}

export interface Reponse {
  id: string;
  sessionId: string;
  elementMesurableId: string;
  valeur: unknown;
  commentaire: string | null;
}

export interface SessionEvaluation {
  id: string;
  organisationId: string;
  grilleId: string;
  statut: StatutSessionEvaluation;
  scoreGlobal: number | null;
  dateDebut: string;
  dateSoumission: string | null;
  grille: Grille;
  reponses: Reponse[];
}

export interface SessionEvaluationResume {
  id: string;
  statut: StatutSessionEvaluation;
  scoreGlobal: number | null;
  dateDebut: string;
  dateSoumission: string | null;
  grille: { id: string; nom: string; type: TypeEtablissement; version: number };
}

export interface ScoreParDomaine {
  domaineId: string;
  nom: string;
  criteresValides: number;
  criteresTotal: number;
  scorePct: number;
}

export interface DocumentNonValide {
  elementMesurableId: string;
  libelle: string;
  reponse: "NON" | "SANS_REPONSE";
}

export interface CritereNonValide {
  critereId: string;
  code: string;
  libelle: string;
  domaineNom: string;
  // §6.4 — documents à examiner manquants et recommandation synthétique.
  documentsNonValides: DocumentNonValide[];
  recommandation: string | null;
}

// §8.4 — EI de l'établissement rattachés à un critère en écart.
export interface EiLieCritere {
  id: string;
  critereId: string;
  description: string;
  dateSurvenue: string;
  statut: string;
  niveauGravite: { libelle: string; critique: boolean } | null;
}

export type StatutRapportPdf = "EN_COURS" | "DISPONIBLE" | "ECHEC";

export interface ResultatScore {
  scoreGlobal: number;
  parDomaine: ScoreParDomaine[];
  criteresNonValides: CritereNonValide[];
  eiLies?: EiLieCritere[];
  rapport?: { statut: StatutRapportPdf; genereLe: string | null } | null;
}

// §6.5 — vue admin comparative.
export interface ConformiteEtablissement {
  organisationId: string;
  organisationNom: string;
  categorie: TypeEtablissement;
  grille: string;
  nombreEvaluations: number;
  dernierScore: number | null;
  scorePrecedent: number | null;
  derniereSoumission: string | null;
}

export interface PointEvolution {
  id: string;
  dateSoumission: string;
  scoreGlobal: number;
  grille: { nom: string; version: number };
}

export interface AbonnementModule {
  id?: string;
  module?: "NEWS" | "EI";
  statut: StatutAbonnement;
  essaiDebut?: string;
  essaiFin: string;
  activeLe: string | null;
  // §7.5 — échéance de l'abonnement payant.
  expireLe?: string | null;
}

// §10.5 — offre en vigueur ; prix ou durée à 0 = non encore paramétré.
export interface OffreAbonnement {
  devise: string;
  dureeJours: number;
  comportementFinEssai: "LECTURE_SEULE" | "BLOCAGE";
  modules: Record<"NEWS" | "EI", { prix: number; disponible: boolean }>;
}

export interface FactureResume {
  id: string;
  numero: string;
  montant: number;
  devise: string;
  emiseLe: string;
}

export interface PaiementAbonnement {
  id: string;
  module: "NEWS" | "EI";
  montant: number;
  dureeJours: number;
  devise: string;
  statut: "EN_ATTENTE" | "PAYE";
  kkiapayTransactionId: string | null;
  payeLe: string | null;
  createdAt: string;
  facture: FactureResume | null;
}

// §11.1 — facture (réservation de formation ou abonnement).
export interface Facture extends FactureResume {
  reservation: { id: string; formule: string; formation: { titre: string } } | null;
  paiementAbonnement: { id: string; module: "NEWS" | "EI"; dureeJours: number } | null;
}

// --- Module NEWS ---

export type StatutPatient = "HOSPITALISE" | "SORTI";
export type NiveauConscience = "ALERTE" | "CONFUSION" | "VOIX" | "DOULEUR" | "INCONSCIENT";
export type NiveauRisqueNews = "BAS" | "MOYEN" | "ELEVE";
export type StatutAlerte = "OUVERTE" | "EN_COURS" | "CLOTUREE";

export interface Service {
  id: string;
  nom: string;
  description: string | null;
}

// §7.1 — fiche patient minimale : aucune donnée d'identité (la plateforme
// n'est pas un dossier patient informatisé, §3.3).
export interface Patient {
  id: string;
  organisationId: string;
  serviceId: string | null;
  service?: { id: string; nom: string } | null;
  identifiantInterne: string;
  numeroLit: string | null;
  statut: StatutPatient;
  dateAdmission: string;
  dateSortie: string | null;
}

export interface MesureNews {
  id: string;
  patientId: string;
  frequenceRespiratoire: number;
  saturationOxygene: number;
  oxygenoSupplementation: boolean;
  temperature: number;
  pressionArterielleSystolique: number;
  frequenceCardiaque: number;
  niveauConscience: NiveauConscience;
  scoreTotal: number;
  niveauRisque: NiveauRisqueNews;
  // §7.3 — fréquence de surveillance suggérée au moment de la mesure.
  frequenceSurveillance?: string | null;
  dateMesure: string;
  saisiePar?: PersonneResume;
  corrections?: CorrectionMesureNews[];
}

export interface PersonneResume {
  id: string;
  nom: string;
  prenom: string;
}

// §13.4 — correction tracée d'une mesure NEWS.
export interface CorrectionMesureNews {
  id: string;
  mesureId: string;
  auteurId: string;
  motif: string;
  valeursAvant: Record<string, unknown>;
  valeursApres: Record<string, unknown>;
  createdAt: string;
  auteur?: PersonneResume;
}

export interface ParametrageNews {
  seuils: { moyen: number; eleve: number };
  frequences: Record<NiveauRisqueNews, string>;
}

export interface Intervention {
  id: string;
  alerteId: string;
  utilisateurId: string;
  note: string;
  createdAt: string;
  utilisateur?: PersonneResume;
}

// §7.4 — fiche de surveillance complète (export / impression).
export interface FicheSurveillance extends Patient {
  mesures: MesureNews[];
  alertes: Alerte[];
}

export interface Alerte {
  id: string;
  organisationId: string;
  patientId: string;
  mesureId: string;
  niveauRisque: NiveauRisqueNews;
  statut: StatutAlerte;
  createdAt: string;
  patient?: Patient;
  mesure?: MesureNews;
  interventions?: Intervention[];
}

// --- Module Événements indésirables ---

// §8.2 / §8.5 — circuit de traitement d'un EI.
export type StatutEi = "DECLARE" | "QUALIFIE" | "EN_ANALYSE" | "PLAN_ACTION" | "CLOTURE";
export type PrioriteEi = "BASSE" | "NORMALE" | "HAUTE";
export type TypeCause = "IMMEDIATE" | "PROFONDE";
export type StatutActionCorrective = "A_FAIRE" | "EN_COURS" | "REALISEE";

export interface TypeEi {
  id: string;
  libelle: string;
  actif: boolean;
}

// §8.1 / §12.4 — échelle de gravité paramétrable ; `critique` = gravité élevée.
export interface NiveauGraviteEi {
  id: string;
  libelle: string;
  ordre: number;
  critique: boolean;
  actif: boolean;
  _count?: { evenements: number };
}

export interface Cause {
  id: string;
  evenementId: string;
  type: TypeCause;
  description: string;
  // §8.2 — réponses successives de la méthode des « 5 pourquoi ».
  pourquois: string[] | null;
  createdAt: string;
}

export interface ActionCorrective {
  id: string;
  evenementId: string;
  description: string;
  responsableId: string;
  responsable?: PersonneResume;
  echeance: string;
  statut: StatutActionCorrective;
}

export interface EvenementTransition {
  id: string;
  ancienStatut: StatutEi;
  nouveauStatut: StatutEi;
  utilisateurId: string;
  utilisateur?: PersonneResume;
  createdAt: string;
}

export interface PieceJointe {
  id: string;
  url: string;
  nomFichier: string;
  typeMime: string | null;
  createdAt: string;
}

// §13.4 — correction tracée d'une fiche EI.
export interface CorrectionEi {
  id: string;
  motif: string;
  valeursAvant: Record<string, unknown>;
  valeursApres: Record<string, unknown>;
  createdAt: string;
  auteur?: PersonneResume;
}

export interface EvenementIndesirable {
  id: string;
  organisationId: string;
  typeEiId: string | null;
  serviceId: string | null;
  critereId: string | null;
  declareParId: string;
  dateSurvenue: string;
  lieu: string | null;
  description: string;
  personnesImpliquees: string;
  niveauGraviteId: string | null;
  niveauGravite?: NiveauGraviteEi | null;
  priorite: PrioriteEi | null;
  statut: StatutEi;
  dateDeclaration: string;
  dateCloture: string | null;
  typeEi?: TypeEi | null;
  service?: Service | null;
  // Inclus par GET /evenements-indesirables/:id (RM10 : lien optionnel vers un critère).
  critere?: { id: string; code: string; libelle: string } | null;
  declarePar?: { id: string; nom: string; prenom: string; email: string };
  causes?: Cause[];
  actionsCorrectives?: ActionCorrective[];
  transitions?: EvenementTransition[];
  piecesJointes?: PieceJointe[];
  corrections?: CorrectionEi[];
}

export interface TableauDeBordEi {
  total: number;
  parStatut: Record<string, number>;
  // Clés : identifiants des niveaux de gravité / services / types.
  parGravite: Record<string, number>;
  parService: Record<string, number>;
  parType: Record<string, number>;
  tauxCloture: number;
  delaiMoyenClotureJours: number | null;
}

// --- Module Formations / Réservations ---

export type FormuleFormation = "INDIVIDUEL" | "GROUPE_5" | "GROUPE_10";
export type StatutReservation = "ATTENTE_PAIEMENT" | "PAYEE" | "CONFIRMEE" | "REALISEE" | "ANNULEE";

export interface Reservation {
  id: string;
  formationId: string;
  utilisateurId: string;
  organisationId: string | null;
  formule: FormuleFormation;
  tarifApplique: number;
  statut: StatutReservation;
  kkiapayTransactionId: string | null;
  dateRdv: string | null;
  presenceConfirmee: boolean;
  // §12.5 — nombre de participants présents.
  participantsPresents?: number | null;
  createdAt: string;
  formation?: Formation;
  facture?: FactureResume | null;
  utilisateur?: { id: string; nom: string; prenom: string; email: string };
  organisation?: { id: string; nom: string } | null;
}

// --- Profil / notifications in-app ---

export interface UtilisateurProfil {
  id: string;
  civilite?: Civilite | null;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  typeCompte: "ORGANISATION" | "INDIVIDUEL" | "ADMIN_PLATEFORME";
}

export interface UtilisateurAdmin {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  typeCompte: "ORGANISATION" | "INDIVIDUEL" | "ADMIN_PLATEFORME";
  organisationId: string | null;
  serviceId: string | null;
  actif: boolean;
  emailVerifieLe: string | null;
  createdAt: string;
  roles: { role: RoleUtilisateur }[];
  organisation: { id: string; nom: string } | null;
}

export interface SessionUtilisateur {
  id: string;
  createdAt: string;
  expiresAt: string;
  revokedAt: string | null;
}

export interface OrganisationDetailAdmin extends Organisation {
  _count: {
    utilisateurs: number;
    patients: number;
    evenementsIndesirables: number;
    reservations: number;
  };
  // §12.1 — statut de chaque module payant.
  abonnementsModule?: AbonnementModule[];
  // §12.1 / §12.3 — alertes cliniques et EI agrégés (aucune donnée patient).
  alertesNews?: { niveauRisque: string; statut: string; nombre: number }[];
  evenementsParStatut?: Record<string, number>;
  // §12.1 — formations réservées par l'établissement.
  reservationsFormations?: {
    id: string;
    formule: FormuleFormation;
    statut: StatutReservation;
    tarifApplique: number;
    dateRdv: string | null;
    createdAt: string;
    formation: { titre: string };
  }[];
  // §6.5 / §12.1 — historique des évaluations soumises (scores uniquement).
  sessionsEvaluation?: {
    id: string;
    scoreGlobal: number | null;
    dateSoumission: string | null;
    grille: { nom: string; version: number };
  }[];
}

export type StatutIntegration = "verifie_ok" | "verifie_erreur" | "configure" | "non_configure";

export interface EtatIntegration {
  nom: string;
  statut: StatutIntegration;
  details: string;
}

export interface LigneAlertePlateforme {
  organisationId: string;
  organisationNom: string;
  source: "NEWS" | "EI";
  niveau: string;
  statut: string;
  nombre: number;
  depuisLe: string;
}

export interface AnalyticsPlateforme {
  etablissements: { total: number; actifs: number; inactifs: number; parType: Record<string, number> };
  utilisateurs: { total: number; actifs: number; inactifs: number; parRole: Record<string, number> };
  reservationsParStatut: Record<string, number>;
  formations: { total: number; actives: number; inactives: number };
  autoEvaluation: { nombreSessionsSoumises: number; scoreMoyenParType: Record<string, number> };
  evenementsIndesirables: {
    total: number;
    parStatut: Record<string, number>;
    parGravite: Record<string, number>;
    tauxClotureePct: number;
    delaiMoyenClotureJours: number | null;
  };
  mesuresNewsParNiveau: Record<string, number>;
}

export interface ParametrePlateforme {
  id: string;
  cle: string;
  valeur: string;
  type: string;
  description: string;
  valeurDefaut: string;
  updatedAt: string;
}

export interface EtatSecurite {
  session: { jwtAccessTtl: string; jwtRefreshTtl: string };
  rateLimiting: Array<{ endpoint: string; limite: string; fenetre: string; justification: string }>;
}

export interface JournalAuditEntry {
  id: string;
  organisationId: string | null;
  utilisateurId: string | null;
  action: string;
  entite: string;
  entiteId: string | null;
  donneesAvant: unknown;
  donneesApres: unknown;
  createdAt: string;
  utilisateur: { id: string; nom: string; prenom: string; email: string } | null;
  organisation: { id: string; nom: string } | null;
}

export interface NotificationInterne {
  id: string;
  type: string;
  titre: string;
  message: string;
  lienUrl: string | null;
  luLe: string | null;
  createdAt: string;
}

// §4.2 — services et utilisateurs internes de l'établissement.
export interface ServiceEtablissement {
  id: string;
  nom: string;
  description: string | null;
  actif: boolean;
  createdAt: string;
}

export type RoleEtablissement = "RESPONSABLE_COMPTE" | "RESP_QUALITE" | "PERSONNEL_SOIGNANT" | "GESTIONNAIRE_FORMATION";

export interface MembreEtablissement {
  id: string;
  civilite: Civilite | null;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  actif: boolean;
  emailVerifieLe: string | null;
  serviceId: string | null;
  createdAt: string;
  service: { id: string; nom: string } | null;
  roles: { role: RoleEtablissement }[];
}

// §12.6 — activité de la plateforme sur une période.
export interface ActivitePlateforme {
  periode: { debut: string; fin: string };
  totaux: {
    etablissementsInscrits: number;
    evaluationsSoumises: number;
    alertesNews: number;
    evenementsIndesirables: number;
    reservations: number;
  };
  mois: string[];
  series: Record<"etablissementsInscrits" | "evaluationsSoumises" | "alertesNews" | "evenementsIndesirables" | "reservations", number[]>;
  modulesParStatut: Record<string, Record<string, number>>;
}
