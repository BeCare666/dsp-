"use client";

import { useActionState, useEffect } from "react";
import { Field, SelectField } from "@/components/ui/field";
import { SubmitButton } from "@/components/auth/submit-button";
import { corrigerMesureAction, saisirMesureAction, type EtatAction } from "@/lib/patients-actions";
import type { MesureNews } from "@/lib/types";

const ETAT_INITIAL: EtatAction = {};

const OPTIONS_CONSCIENCE = [
  { value: "ALERTE", label: "Alerte (normal)" },
  { value: "VOIX", label: "Réagit à la voix" },
  { value: "DOULEUR", label: "Réagit à la douleur" },
  { value: "CONFUSION", label: "Confusion" },
  { value: "INCONSCIENT", label: "Inconscient" },
];

// Saisie d'une nouvelle mesure, ou correction tracée d'une mesure existante
// (§13.4 : valeurs préremplies + motif obligatoire, jamais de suppression).
export function MesureForm({
  patientId,
  mesure,
  onSuccess,
}: {
  patientId: string;
  mesure?: MesureNews;
  onSuccess?: () => void;
}) {
  const action = mesure ? corrigerMesureAction.bind(null, patientId, mesure.id) : saisirMesureAction.bind(null, patientId);
  const [etat, formAction] = useActionState(action, ETAT_INITIAL);

  useEffect(() => {
    if (etat.succes) onSuccess?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etat.succes]);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          label="Fréquence respiratoire (/min)"
          name="frequenceRespiratoire"
          type="number"
          required
          min={0}
          max={60}
          defaultValue={mesure?.frequenceRespiratoire}
        />
        <Field
          label="SpO2 (%)"
          name="saturationOxygene"
          type="number"
          required
          min={0}
          max={100}
          defaultValue={mesure?.saturationOxygene}
        />
        <Field
          label="Température (°C)"
          name="temperature"
          type="number"
          step="0.1"
          required
          min={25}
          max={45}
          defaultValue={mesure?.temperature}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          label="PA systolique (mmHg)"
          name="pressionArterielleSystolique"
          type="number"
          required
          min={0}
          max={300}
          defaultValue={mesure?.pressionArterielleSystolique}
        />
        <Field
          label="Fréquence cardiaque (/min)"
          name="frequenceCardiaque"
          type="number"
          required
          min={0}
          max={250}
          defaultValue={mesure?.frequenceCardiaque}
        />
        <SelectField
          label="Niveau de conscience"
          name="niveauConscience"
          defaultValue={mesure?.niveauConscience ?? "ALERTE"}
          required
        >
          {OPTIONS_CONSCIENCE.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </SelectField>
      </div>
      <label className="flex items-center gap-2 text-sm text-text">
        <input
          type="checkbox"
          name="oxygenoSupplementation"
          defaultChecked={mesure?.oxygenoSupplementation ?? false}
          className="h-4 w-4 rounded border-border"
        />
        Sous oxygénothérapie
      </label>

      {mesure && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="motif" className="text-sm font-medium text-text">
            Motif de la correction
          </label>
          <textarea
            id="motif"
            name="motif"
            required
            minLength={5}
            maxLength={1000}
            rows={3}
            placeholder="Ex. erreur de saisie de la température"
            className="rounded-[var(--radius-md)] border border-border bg-surface px-3.5 py-2.5 text-sm text-text transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-soft"
          />
          <p className="text-xs text-text-muted">
            La valeur d&apos;origine reste consultable : la correction est horodatée et enregistrée avec son auteur.
          </p>
        </div>
      )}

      {etat.erreur && <p className="text-sm text-danger">{etat.erreur}</p>}
      <SubmitButton>{mesure ? "Enregistrer la correction" : "Enregistrer la mesure"}</SubmitButton>
    </form>
  );
}
