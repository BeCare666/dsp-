import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { IconArrowRight } from "@/components/icons";

export const metadata: Metadata = {
  title: "Créer un compte",
};

const OPTIONS = [
  {
    href: "/inscription/organisation",
    titre: "Établissement de santé",
    description: "Établissement hospitalier (EH) ou établissement de soins de premiers contacts (ESPC).",
  },
  {
    href: "/inscription/individuel",
    titre: "Compte individuel",
    description: "Pour réserver une formation à titre personnel.",
  },
];

export default function InscriptionPage() {
  return (
    <Reveal className="w-full">
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-bold text-text">Créer un compte</h1>
        <p className="mt-2 text-sm text-text-muted">Choisissez le type de compte adapté à votre situation.</p>
      </div>

      <div className="flex flex-col gap-3">
        {OPTIONS.map((option) => (
          <Link
            key={option.href}
            href={option.href}
            className="group flex items-center justify-between rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-soft)] transition-colors hover:border-primary/40"
          >
            <div>
              <h2 className="font-display text-base font-semibold text-text">{option.titre}</h2>
              <p className="mt-1 text-sm text-text-muted">{option.description}</p>
            </div>
            <IconArrowRight
              width={18}
              height={18}
              className="flex-shrink-0 text-text-faint transition-transform group-hover:translate-x-1 group-hover:text-primary"
            />
          </Link>
        ))}
      </div>

      <p className="mt-6 text-center text-sm text-text-muted">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Se connecter
        </Link>
      </p>
    </Reveal>
  );
}
