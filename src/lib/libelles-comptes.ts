import type { Civilite, RoleEtablissement, TypeStructure } from "./types";

// §4.1 — type d'établissement (distinct de la catégorie ARS EH/ESPC).
export const LIBELLES_TYPE_STRUCTURE: Record<TypeStructure, string> = {
  HOPITAL: "Hôpital",
  CLINIQUE: "Clinique",
  LABORATOIRE: "Laboratoire",
  PHARMACIE: "Pharmacie",
  CABINET_MEDICAL: "Cabinet médical",
  AUTRE: "Autre",
};

export const LIBELLES_CIVILITE: Record<Civilite, string> = {
  M: "M.",
  MME: "Mme",
};

// §4.2 — rôles attribuables par l'établissement et périmètre d'accès de chacun.
export const LIBELLES_ROLE_ETABLISSEMENT: Record<RoleEtablissement, { label: string; acces: string }> = {
  RESPONSABLE_COMPTE: { label: "Responsable du compte", acces: "Accès complet" },
  RESP_QUALITE: {
    label: "Responsable qualité / sécurité des patients",
    acces: "Auto-évaluation et événements indésirables",
  },
  PERSONNEL_SOIGNANT: { label: "Personnel soignant", acces: "Score NEWS" },
  GESTIONNAIRE_FORMATION: { label: "Gestionnaire formation", acces: "Module Formation" },
};
