import Link from "next/link";
import { ListeReseauxSociaux } from "@/components/marketing/social-icons";
import { Logo } from "@/components/shell/logo";
import { MENUS_VITRINE } from "@/lib/navigation-vitrine";
import { SITE } from "@/lib/site-config";

export function SiteFooter() {
  const annee = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-navy text-white">
      {/* Halo discret en haut du footer, pour détacher la surface sombre du contenu. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[48rem] -translate-x-1/2 rounded-full bg-primary/25 blur-3xl"
      />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      <div className="relative mx-auto max-w-6xl px-5 pb-10 pt-16 sm:px-8 md:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <Logo variante="sombre" />
            <p className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-white/50">{SITE.nomComplet}</p>
            <p className="mt-5 max-w-sm text-sm leading-6 text-white/65">
              La plateforme qui accompagne les établissements de santé du Bénin dans l&apos;évaluation,
              la surveillance et l&apos;amélioration continue de la sécurité des soins.
            </p>

            <a
              href={`mailto:${SITE.emailContact}`}
              className="mt-6 inline-flex items-center gap-2.5 text-sm text-white/80 transition-colors hover:text-white"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3.5 6.5 8.5 6 8.5-6" />
                </svg>
              </span>
              {SITE.emailContact}
            </a>

            <ListeReseauxSociaux className="mt-8" />
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {MENUS_VITRINE.map((colonne) => (
              <nav key={colonne.titre} aria-label={colonne.titre}>
                <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">{colonne.titre}</h2>
                <ul className="mt-5 flex flex-col gap-3">
                  {colonne.liens.map((lien) => (
                    <li key={lien.label}>
                      <Link
                        href={lien.href}
                        className="group inline-flex text-sm leading-5 text-white/70 transition-colors hover:text-white"
                      >
                        <span className="bg-gradient-to-r from-white to-white bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-500 group-hover:bg-[length:100%_1px]">
                          {lien.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs text-white/45 md:flex-row md:items-center md:justify-between">
          <p>
            © {annee} {SITE.nom}. {SITE.nomComplet}. Tous droits réservés.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/conditions-utilisation" className="transition-colors hover:text-white">
              Conditions d&apos;utilisation
            </Link>
            <Link href="/politique-confidentialite" className="transition-colors hover:text-white">
              Confidentialité
            </Link>
            <span className="inline-flex items-center gap-2">
              <span aria-hidden="true" className="flex h-3 w-[18px] overflow-hidden rounded-[2px]">
                {/* Drapeau du Bénin : bande verte verticale, jaune et rouge horizontales. */}
                <span className="h-full w-[40%] bg-[#008751]" />
                <span className="flex h-full flex-1 flex-col">
                  <span className="flex-1 bg-[#fcd116]" />
                  <span className="flex-1 bg-[#e8112d]" />
                </span>
              </span>
              Conçu pour les établissements de santé du Bénin
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
