import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiFetchJson, ApiError } from "@/lib/api-server";
import { formaterDate, formaterDateHeure } from "@/lib/format";
import { libellePatient } from "@/lib/patient-libelle";
import { BoutonImprimer } from "@/components/impression/bouton-imprimer";
import type { FicheSurveillance, NiveauConscience, NiveauRisqueNews, StatutAlerte } from "@/lib/types";

export const metadata: Metadata = {
  title: "Fiche de surveillance NEWS",
  robots: { index: false, follow: false },
};

const RISQUE: Record<NiveauRisqueNews, string> = { BAS: "Faible", MOYEN: "Moyen", ELEVE: "Élevé" };
const STATUT_ALERTE: Record<StatutAlerte, string> = { OUVERTE: "Ouverte", EN_COURS: "En cours", CLOTUREE: "Clôturée" };
const CONSCIENCE: Record<NiveauConscience, string> = {
  ALERTE: "Alerte",
  VOIX: "Voix",
  DOULEUR: "Douleur",
  CONFUSION: "Confusion",
  INCONSCIENT: "Inconscient",
};

const cellule = "border border-gray-300 px-2 py-1 text-left align-top";

// §7.4 — export / impression de la fiche de surveillance : fiche minimale du
// patient (sans identité, §7.1), mesures avec corrections tracées, alertes et
// journal des interventions. Impression ou PDF via la boîte d'impression du navigateur.
export default async function FicheSurveillancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let fiche: FicheSurveillance;
  try {
    fiche = await apiFetchJson<FicheSurveillance>(`/patients/${id}/export`);
  } catch (erreur) {
    if (erreur instanceof ApiError && erreur.status === 404) notFound();
    throw erreur;
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-8 text-sm print:max-w-none print:px-0 print:py-0">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">DSP · Dispositif de Sécurité des Patients</p>
          <h1 className="mt-1 text-xl font-bold">Fiche de surveillance NEWS · {libellePatient(fiche)}</h1>
          <p className="mt-1 text-gray-600">
            Service : {fiche.service?.nom ?? "non précisé"} · Admission : {formaterDate(fiche.dateAdmission)} ·{" "}
            {fiche.dateSortie ? `Sortie : ${formaterDate(fiche.dateSortie)}` : "Hospitalisation en cours"}
          </p>
          <p className="mt-1 text-xs text-gray-500">Éditée le {formaterDateHeure(new Date().toISOString())}</p>
        </div>
        <BoutonImprimer />
      </div>

      <h2 className="mb-2 mt-6 text-base font-semibold">Mesures ({fiche.mesures.length})</h2>
      {fiche.mesures.length === 0 ? (
        <p className="text-gray-600">Aucune mesure enregistrée.</p>
      ) : (
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-gray-100">
              {["Date", "FR", "SpO2", "O2", "T°", "PA syst.", "FC", "Conscience", "Score", "Risque", "Surveillance", "Saisie par"].map((t) => (
                <th key={t} className={cellule}>
                  {t}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fiche.mesures.map((m) => (
              <tr key={m.id}>
                <td className={cellule}>
                  {formaterDateHeure(m.dateMesure)}
                  {(m.corrections?.length ?? 0) > 0 && <span className="block text-[10px] text-amber-700">corrigée</span>}
                </td>
                <td className={cellule}>{m.frequenceRespiratoire}</td>
                <td className={cellule}>{m.saturationOxygene} %</td>
                <td className={cellule}>{m.oxygenoSupplementation ? "Oui" : "Non"}</td>
                <td className={cellule}>{m.temperature}</td>
                <td className={cellule}>{m.pressionArterielleSystolique}</td>
                <td className={cellule}>{m.frequenceCardiaque}</td>
                <td className={cellule}>{CONSCIENCE[m.niveauConscience]}</td>
                <td className={`${cellule} font-semibold`}>{m.scoreTotal}</td>
                <td className={cellule}>{RISQUE[m.niveauRisque]}</td>
                <td className={cellule}>{m.frequenceSurveillance ?? "—"}</td>
                <td className={cellule}>{m.saisiePar ? `${m.saisiePar.prenom} ${m.saisiePar.nom}` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {fiche.mesures.some((m) => (m.corrections?.length ?? 0) > 0) && (
        <>
          <h2 className="mb-2 mt-6 text-base font-semibold">Corrections tracées</h2>
          <ul className="flex flex-col gap-1 text-xs">
            {fiche.mesures.flatMap((m) =>
              (m.corrections ?? []).map((c) => (
                <li key={c.id}>
                  Mesure du {formaterDateHeure(m.dateMesure)} corrigée le {formaterDateHeure(c.createdAt)}
                  {c.auteur ? ` par ${c.auteur.prenom} ${c.auteur.nom}` : ""} — motif : {c.motif}
                </li>
              )),
            )}
          </ul>
        </>
      )}

      <h2 className="mb-2 mt-6 text-base font-semibold">Alertes et interventions ({fiche.alertes.length})</h2>
      {fiche.alertes.length === 0 ? (
        <p className="text-gray-600">Aucune alerte.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {fiche.alertes.map((a) => (
            <div key={a.id} className="break-inside-avoid border border-gray-300 p-2">
              <p className="font-medium">
                Alerte {RISQUE[a.niveauRisque].toLowerCase()} · {formaterDateHeure(a.createdAt)} · {STATUT_ALERTE[a.statut]}
              </p>
              {(a.interventions ?? []).length === 0 ? (
                <p className="text-xs text-gray-600">Aucune intervention enregistrée.</p>
              ) : (
                <ul className="mt-1 flex flex-col gap-0.5 text-xs">
                  {(a.interventions ?? []).map((i) => (
                    <li key={i.id}>
                      {formaterDateHeure(i.createdAt)}
                      {i.utilisateur ? ` · ${i.utilisateur.prenom} ${i.utilisateur.nom}` : ""} — {i.note}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="mt-8 text-[10px] text-gray-500">
        Les scores et alertes NEWS sont une aide à la priorisation et ne remplacent pas le jugement clinique. DSP n&apos;est
        pas un dossier patient informatisé.
      </p>
    </main>
  );
}
