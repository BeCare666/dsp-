import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Connexion",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string; reset?: string; active?: string; next?: string }>;
}) {
  const { verified, reset, active, next } = await searchParams;

  return (
    <AuthCard
      title="Bon retour"
      description="Connectez-vous à votre espace DSP."
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="font-medium text-primary hover:underline">
            Créer un compte
          </Link>
        </>
      }
    >
      {verified === "true" && (
        <p className="mb-4 rounded-[var(--radius-md)] bg-success-soft px-3.5 py-2.5 text-sm text-success">
          Adresse email confirmée. Vous pouvez maintenant vous connecter.
        </p>
      )}
      {verified === "false" && (
        <p className="mb-4 rounded-[var(--radius-md)] bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
          Ce lien de vérification est invalide ou a expiré.
        </p>
      )}
      {reset === "true" && (
        <p className="mb-4 rounded-[var(--radius-md)] bg-success-soft px-3.5 py-2.5 text-sm text-success">
          Mot de passe réinitialisé. Vous pouvez maintenant vous connecter.
        </p>
      )}
      {active === "true" && (
        <p className="mb-4 rounded-[var(--radius-md)] bg-success-soft px-3.5 py-2.5 text-sm text-success">
          Compte activé. Vous pouvez maintenant vous connecter avec votre mot de passe.
        </p>
      )}
      <LoginForm next={next} />
    </AuthCard>
  );
}
