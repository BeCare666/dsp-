import { IconDownload } from "@/components/icons";

const styleChamp =
  "rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-soft";

// §8.3 — historique complet et export des EI sur une période donnée (date de
// survenue). Formulaire GET classique vers la route relais de téléchargement.
export function ExportEiForm() {
  return (
    <form
      action="/api/evenements-indesirables/export-csv"
      method="get"
      className="flex flex-wrap items-end gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-4"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="export-debut" className="text-xs font-medium text-text-muted">
          Survenus à partir du
        </label>
        <input id="export-debut" name="debut" type="date" className={styleChamp} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="export-fin" className="text-xs font-medium text-text-muted">
          Jusqu&apos;au
        </label>
        <input id="export-fin" name="fin" type="date" className={styleChamp} />
      </div>
      <button
        type="submit"
        className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-surface px-4 py-2 text-sm font-medium text-text transition-colors hover:border-primary/40 hover:bg-primary-soft/60"
      >
        <IconDownload width={16} height={16} />
        Exporter en CSV
      </button>
      <p className="w-full text-xs text-text-faint">Laissez les dates vides pour exporter tout l&apos;historique.</p>
    </form>
  );
}
