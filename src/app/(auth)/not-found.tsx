import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="w-full max-w-md px-5">
      <EmptyState
        titre="Page introuvable"
        description="Cette page n'existe pas ou a été déplacée. Vérifiez l'adresse ou revenez à l'accueil."
        action={<Button href="/">Retour à l&apos;accueil</Button>}
      />
    </div>
  );
}
