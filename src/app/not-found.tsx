import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export default function RootNotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl items-center px-5 sm:px-8">
      <EmptyState
        titre="Page introuvable"
        description="Cette page n'existe pas ou a été déplacée. Vérifiez l'adresse ou revenez à l'accueil."
        action={<Button href="/">Retour à l&apos;accueil</Button>}
      />
    </div>
  );
}
