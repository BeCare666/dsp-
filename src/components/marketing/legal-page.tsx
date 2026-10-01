import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";
import { SITE } from "@/lib/site-config";

export interface SectionLegale {
  id: string;
  titre: string;
  contenu: ReactNode;
}

// Mise en page commune aux documents légaux : en-tête sobre, sommaire collant
// sur grand écran, sections numérotées et ancrables (liens du footer).
export function LegalPage({
  surtitre,
  titre,
  introduction,
  sections,
}: {
  surtitre: string;
  titre: string;
  introduction: ReactNode;
  sections: SectionLegale[];
}) {
  return (
    <>
      <header className="relative overflow-hidden border-b border-border bg-bg-subtle">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(50rem_22rem_at_90%_-20%,var(--color-primary-soft),transparent_70%)]"
        />
        <Reveal className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-20">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{surtitre}</span>
          <h1 className="mt-4 max-w-3xl font-display text-3xl font-bold leading-tight tracking-tight text-text sm:text-5xl">
            {titre}
          </h1>
          <p className="mt-5 text-sm text-text-muted">Dernière mise à jour : {SITE.majDocumentsLegaux}</p>
        </Reveal>
      </header>

      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 md:py-20 lg:grid-cols-[240px_1fr]">
        <nav aria-label="Sommaire" className="hidden lg:block">
          <div className="sticky top-28">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-faint">Sommaire</p>
            <ol className="mt-4 flex flex-col gap-2.5 border-l border-border">
              {sections.map((section, i) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="-ml-px block border-l border-transparent pl-4 text-sm leading-5 text-text-muted transition-colors hover:border-primary hover:text-text"
                  >
                    {i + 1}. {section.titre}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <article className="max-w-3xl">
          <div className="text-base leading-8 text-text-muted">{introduction}</div>

          {sections.map((section, i) => (
            <section key={section.id} id={section.id} className="scroll-mt-24 border-t border-border pt-10 mt-10">
              <h2 className="flex items-baseline gap-3 font-display text-xl font-semibold text-text sm:text-2xl">
                <span className="font-display text-sm font-bold tabular-nums text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {section.titre}
              </h2>
              <div className="legal-contenu mt-5 text-[15px] leading-7 text-text-muted">{section.contenu}</div>
            </section>
          ))}
        </article>
      </div>
    </>
  );
}
