import type { Patient } from "./types";

// §7.1 — un patient n'est jamais désigné par son identité, seulement par son
// identifiant interne à l'établissement (et son lit s'il est renseigné).
export function libellePatient(p: Pick<Patient, "identifiantInterne" | "numeroLit"> | null | undefined): string {
  if (!p) return "Patient";
  return p.numeroLit ? `Patient ${p.identifiantInterne} · lit ${p.numeroLit}` : `Patient ${p.identifiantInterne}`;
}
