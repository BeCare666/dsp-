import type { Metadata } from "next";
import { Reveal } from "@/components/motion/reveal";
import { ResendVerificationForm } from "@/components/auth/resend-verification-form";

export const metadata: Metadata = {
  title: "Vérifiez votre email",
};

export default async function VerificationEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email = "" } = await searchParams;

  return (
    <Reveal className="w-full text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 7l9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h1 className="mt-5 font-display text-2xl font-bold text-text">Vérifiez votre boîte email</h1>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-text-muted">
        Un email de confirmation a été envoyé
        {email && (
          <>
            {" "}
            à <span className="font-medium text-text">{email}</span>
          </>
        )}
        . Cliquez sur le lien qu&apos;il contient pour activer votre compte. Il expire dans 48 heures.
      </p>

      {email && (
        <div className="mt-6">
          <ResendVerificationForm email={email} />
        </div>
      )}
    </Reveal>
  );
}
