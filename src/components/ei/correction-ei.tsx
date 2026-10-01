"use client";

import { useActionState, useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, SelectField } from "@/components/ui/field";
import { SubmitButton } from "@/components/auth/submit-button";
import { corrigerEiAction, type EtatAction } from "@/lib/ei-actions";
import { formaterDateHeure } from "@/lib/format";
import type { EvenementIndesirable, ServiceEtablissement } from "@/lib/types";

const ETAT_INITIAL: EtatAction = {};

const styleZone =
  "rounded-[var(--radius-md)] border border-border bg-surface px-3.5 py-2.5 text-sm text-text transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-soft";

const LIBELLES_CHAMPS: Record<string, string> = {
  description: "Description",
  personnesImpliquees: "Personnes impliquées ou témoins",
  dateSurvenue: "Date de survenue",
  lieu: "Lieu",
  serviceId: "Service",
};

function versDateHeureLocale(iso: string): string {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function CorrectionForm({
  evenement,
  services,
  onSuccess,
}: {
  evenement: EvenementIndesirable;
  services: ServiceEtablissement[];
  onSuccess: () => void;
}) {
  const [etat, action] = useActionState(corrigerEiAction.bind(null, evenement.id), ETAT_INITIAL);

  useEffect(() => {
    if (etat.succes) onSuccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etat.succes]);

  return (
    <form action={action} className="flex flex-col gap-4">
      <Field
        label="Date et heure de survenue"
        name="dateSurvenue"
        type="datetime-local"
        required
        defaultValue={versDateHeureLocale(evenement.dateSurvenue)}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Service" name="serviceId" defaultValue={evenement.serviceId ?? ""}>
          <option value="">Non précisé</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nom}
            </option>
          ))}
        </SelectField>
        <Field label="Lieu" name="lieu" defaultValue={evenement.lieu ?? ""} maxLength={191} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="corr-description" className="text-sm font-medium text-text">
          Description
        </label>
        <textarea id="corr-description" name="description" required minLength={5} rows={4} defaultValue={evenement.description} className={styleZone} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="corr-personnes" className="text-sm font-medium text-text">
          Personnes impliquées ou témoins
        </label>
        <textarea
          id="corr-personnes"
          name="personnesImpliquees"
          required
          minLength={2}
          rows={2}
          defaultValue={evenement.personnesImpliquees}
          className={styleZone}
        />
      </div>
      <Field label="Motif de la correction" name="motif" required minLength={5} maxLength={1000} />
      <p className="text-xs text-text-muted">
        La fiche n&apos;est jamais supprimée : la correction est horodatée, enregistrée avec son auteur et son motif, et
        les valeurs d&apos;origine restent consultables.
      </p>
      {etat.erreur && <p className="text-sm text-danger">{etat.erreur}</p>}
      <div>
        <SubmitButton>Enregistrer la correction</SubmitButton>
      </div>
    </form>
  );
}

// §13.4 — bouton de correction tracée + historique des corrections.
export function CorrectionEi({
  evenement,
  services,
  peutCorriger,
}: {
  evenement: EvenementIndesirable;
  services: ServiceEtablissement[];
  peutCorriger: boolean;
}) {
  const [ouvert, setOuvert] = useState(false);
  const corrections = evenement.corrections ?? [];

  return (
    <div className="flex flex-col gap-3">
      {corrections.length === 0 ? (
        <p className="text-sm text-text-faint">Aucune correction.</p>
      ) : (
        <ol className="flex flex-col gap-3">
          {corrections.map((c) => (
            <li key={c.id} className="rounded-[var(--radius-md)] border border-border p-3 text-sm">
              <p className="text-xs text-text-muted">
                {formaterDateHeure(c.createdAt)}
                {c.auteur ? ` · ${c.auteur.prenom} ${c.auteur.nom}` : ""}
              </p>
              <p className="mt-1 text-text">
                <span className="font-medium">Motif :</span> {c.motif}
              </p>
              <ul className="mt-1 text-xs text-text-muted">
                {Object.keys(c.valeursApres).map((cle) => (
                  <li key={cle}>
                    {LIBELLES_CHAMPS[cle] ?? cle} : « {String(c.valeursAvant[cle] ?? "—")} » → « {String(c.valeursApres[cle] ?? "—")} »
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}
      {peutCorriger && (
        <div>
          <Button variant="secondary" onClick={() => setOuvert(true)}>
            Corriger la fiche
          </Button>
        </div>
      )}
      <Modal open={ouvert} onClose={() => setOuvert(false)} title="Corriger la fiche de l'événement">
        {ouvert && <CorrectionForm evenement={evenement} services={services} onSuccess={() => setOuvert(false)} />}
      </Modal>
    </div>
  );
}
