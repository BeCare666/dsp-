import Link from "next/link";
import type { SVGProps } from "react";

// Symbole DSP : un « D » plein (le Dispositif) qui abrite en son cœur un point
// rose (le patient). Aplats aux couleurs de la charte, même dessin que le
// favicon (app/icon.svg). Toute modification doit être reportée aux deux.
export function LogoSymbole(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" {...props}>
      <rect width="40" height="40" rx="9" fill="var(--color-primary)" />
      <path
        fill="#ffffff"
        fillRule="evenodd"
        d="M11 9.5H18.5A10.5 10.5 0 0 1 18.5 30.5H11ZM15.8 14.3H18.5A5.7 5.7 0 0 1 18.5 25.7H15.8Z"
      />
      <circle cx="19.4" cy="20" r="2.6" fill="var(--color-accent)" />
    </svg>
  );
}

interface LogoProps {
  href?: string;
  className?: string;
  // "clair" : sur fond blanc (défaut). "sombre" : sur les surfaces bleu nuit (footer).
  variante?: "clair" | "sombre";
}

// Primitive partagée par les shells (vitrine, établissement, admin) et le
// layout d'authentification.
export function Logo({ href = "/", className = "", variante = "clair" }: LogoProps) {
  const sombre = variante === "sombre";

  return (
    <Link href={href} aria-label="DSP, Dispositif de Sécurité des Patients, accueil" className={`group flex items-center gap-2.5 ${className}`}>
      <LogoSymbole className="h-9 w-9 shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]" />
      <span className="flex flex-col leading-none">
        <span className={`font-display text-[1.2rem] font-extrabold tracking-[0.04em] ${sombre ? "text-white" : "text-navy"}`}>
          DSP
        </span>
        <span
          className={`mt-1 whitespace-nowrap text-[0.56rem] font-semibold uppercase tracking-[0.13em] ${sombre ? "text-white/55" : "text-text-faint"}`}
        >
          Sécurité des patients
        </span>
      </span>
    </Link>
  );
}
