import type { StatutRapportPdf } from "@/lib/types";

// §6.4 — rapport de synthèse PDF, généré automatiquement en tâche asynchrone
// après la soumission (quelques dizaines de secondes).
export function RapportPdf({
  sessionId,
  rapport,
}: {
  sessionId: string;
  rapport: { statut: StatutRapportPdf; genereLe: string | null } | null;
}) {
  if (rapport?.statut === "DISPONIBLE") {
    return (
      <a
        href={`/api/sessions-evaluation/${sessionId}/rapport`}
        className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
      >
        Télécharger le rapport PDF
      </a>
    );
  }
  if (rapport?.statut === "ECHEC") {
    return <span className="text-sm text-danger">La génération du rapport a échoué. Contactez le support DSP.</span>;
  }
  return (
    <span className="text-sm text-text-muted">
      Rapport PDF en cours de génération : rechargez la page dans quelques instants (une notification vous préviendra).
    </span>
  );
}
