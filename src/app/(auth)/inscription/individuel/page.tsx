import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { RegisterIndividuelForm } from "@/components/auth/register-individuel-form";

export const metadata: Metadata = {
  title: "Inscription individuelle",
};

export default function InscriptionIndividuelPage() {
  return (
    <AuthCard
      title="Créer un compte individuel"
      description="Pour réserver une formation à titre personnel."
      footer={
        <>
          Vous représentez un établissement ?{" "}
          <Link href="/inscription/organisation" className="font-medium text-primary hover:underline">
            Inscrivez-le ici
          </Link>
        </>
      }
    >
      <RegisterIndividuelForm />
    </AuthCard>
  );
}
