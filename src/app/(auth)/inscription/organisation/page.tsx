import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { RegisterOrganisationForm } from "@/components/auth/register-organisation-form";

export const metadata: Metadata = {
  title: "Inscription établissement",
};

export default function InscriptionOrganisationPage() {
  return (
    <AuthCard
      title="Inscrire votre établissement"
      description="Renseignez les informations de votre établissement et de son responsable."
      footer={
        <>
          Compte individuel ?{" "}
          <Link href="/inscription/individuel" className="font-medium text-primary hover:underline">
            Inscrivez-vous ici
          </Link>
        </>
      }
    >
      <RegisterOrganisationForm />
    </AuthCard>
  );
}
