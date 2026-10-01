import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Activer mon compte",
  robots: { index: false, follow: false },
};

// §4.2 — un utilisateur interne créé par son établissement choisit ici son
// mot de passe personnel à partir du lien reçu par email.
export default async function ActiverComptePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;

  return (
    <AuthCard
      title="Activer mon compte"
      description="Choisissez votre mot de passe personnel (8 caractères minimum). Le lien reçu par email expire après 72 heures."
    >
      <ResetPasswordForm token={token} activation />
    </AuthCard>
  );
}
