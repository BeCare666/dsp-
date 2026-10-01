import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
      <EmptyState
        titre="Page introuvable"
        description="Cette page n'existe pas ou a été déplacée. Vérifiez l'adresse ou revenez à l'accueil admin."
        action={<Button href="/admin">Retour à l&apos;accueil admin</Button>}
      />
    </div>
  );
}
