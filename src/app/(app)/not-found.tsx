import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      <EmptyState
        titre="Page introuvable"
        description="Cette page n'existe pas ou a été déplacée. Vérifiez l'adresse ou revenez au tableau de bord."
        action={<Button href="/tableau-de-bord">Retour au tableau de bord</Button>}
      />
    </div>
  );
}
