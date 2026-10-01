import type { SVGProps } from "react";
import { RESEAUX_SOCIAUX, SITE, type ReseauSocial } from "@/lib/site-config";

type Props = SVGProps<SVGSVGElement>;

// Pictogrammes des réseaux sociaux, dessinés dans une grille 24×24 en aplat
// (sauf Instagram, en trait, fidèle à son glyphe officiel).
const ICONES: Record<ReseauSocial, (props: Props) => React.JSX.Element> = {
  facebook: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 21.5v-8h2.7l.4-3.2h-3.1V8.3c0-.9.3-1.6 1.6-1.6h1.7V3.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.3H7.3v3.2h2.8v8h3.4Z" />
    </svg>
  ),
  linkedin: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M5.2 3.6a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM3.5 9.2h3.4v11.2H3.5V9.2Zm5.6 0h3.3v1.5h.05c.46-.87 1.58-1.8 3.26-1.8 3.48 0 4.12 2.3 4.12 5.27v6.23h-3.43v-5.52c0-1.32-.02-3.02-1.84-3.02-1.84 0-2.12 1.44-2.12 2.92v5.62H9.1V9.2Z" />
    </svg>
  ),
  x: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M17.2 3.5h2.9l-6.3 7.2 7.4 9.8h-5.8l-4.5-5.9-5.2 5.9H2.8l6.7-7.7L2.4 3.5h5.9l4.1 5.4 4.8-5.4Zm-1 15.3h1.6L7.9 5.1H6.2l10 13.7Z" />
    </svg>
  ),
  instagram: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="3.9" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  ),
  youtube: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 7.6a2.7 2.7 0 0 0-1.9-1.9C18.4 5.2 12 5.2 12 5.2s-6.4 0-8.1.5A2.7 2.7 0 0 0 2 7.6 28 28 0 0 0 1.6 12 28 28 0 0 0 2 16.4a2.7 2.7 0 0 0 1.9 1.9c1.7.5 8.1.5 8.1.5s6.4 0 8.1-.5a2.7 2.7 0 0 0 1.9-1.9c.3-1.5.4-2.9.4-4.4s-.1-2.9-.4-4.4ZM10 14.8V9.2l5.2 2.8L10 14.8Z" />
    </svg>
  ),
};

export function SocialIcon({ reseau, ...props }: Props & { reseau: ReseauSocial }) {
  const Icone = ICONES[reseau];
  return <Icone aria-hidden="true" {...props} />;
}

// Boutons ronds des réseaux sociaux, pour une surface bleu nuit : footer de la
// vitrine et pied du tiroir de navigation mobile (même rendu aux deux endroits).
export function ListeReseauxSociaux({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-3 ${className}`} aria-label="Réseaux sociaux">
      {RESEAUX_SOCIAUX.map(({ reseau, label, href }) => (
        <li key={reseau}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${SITE.nom} sur ${label}`}
            className="group relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/[0.04] text-white/75 transition-all duration-500 hover:-translate-y-0.5 hover:border-white/40 hover:text-navy"
          >
            {/* Remplissage qui monte au survol, avec un fin reflet. */}
            <span
              aria-hidden="true"
              className="absolute inset-0 translate-y-full rounded-full bg-gradient-to-t from-white to-white/90 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/10 [background:radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_60%)]"
            />
            <SocialIcon reseau={reseau} width={18} height={18} className="relative" />
          </a>
        </li>
      ))}
    </ul>
  );
}
