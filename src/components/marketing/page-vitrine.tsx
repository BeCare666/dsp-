import Link from "next/link";
import type { ReactNode, SVGProps, JSX } from "react";
import type { PHOTOS } from "@/lib/site-config";
import { Reveal } from "@/components/motion/reveal";
import { ScrollZoomImage } from "@/components/motion/scroll-zoom-image";
import { PhotoCredit } from "@/components/marketing/photo-credit";
import { FilProgression } from "@/components/marketing/a-propos-animations";
import { LogoSymbole } from "@/components/shell/logo";
import { IconArrowRight, IconChevronRight, IconMail } from "@/components/icons";
import { SITE } from "@/lib/site-config";

type Photo = (typeof PHOTOS)[keyof typeof PHOTOS];
type Icone = (props: SVGProps<SVGSVGElement>) => JSX.Element;

// Briques communes des pages de la vitrine (À propos et Plateforme) : mêmes
// marges, mêmes titres de section, mêmes animations que la page d'accueil.

export function EnTetePage({
  fil,
  surTitre,
  titre,
  description,
  badge,
  photo,
  position,
  children,
}: {
  fil: { href: string; label: string }[];
  surTitre: string;
  titre: string;
  description: string;
  badge?: string;
  photo?: Photo;
  position?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_30rem_at_85%_-10%,var(--color-primary-soft),transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(var(--color-border)_1px,transparent_1px),linear-gradient(90deg,var(--color-border)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_65%)]"
      />

      <div
        className={`relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-10 sm:px-8 md:pt-14 lg:pb-24 ${
          photo ? "lg:grid-cols-[1.05fr_1fr]" : ""
        }`}
      >
        <Reveal>
          <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-1.5 text-xs text-text-faint">
            {fil.map((etape) => (
              <span key={etape.href} className="inline-flex items-center gap-1.5">
                <Link href={etape.href} className="transition-colors hover:text-primary">
                  {etape.label}
                </Link>
                <IconChevronRight width={12} height={12} />
              </span>
            ))}
            <span aria-current="page" className="font-medium text-text-muted">
              {titre}
            </span>
          </nav>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{surTitre}</span>
            {badge && (
              <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-semibold text-accent">{badge}</span>
            )}
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-[2.4rem] font-bold leading-[1.06] tracking-tight text-text sm:text-5xl lg:text-6xl">
            {titre}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-text-muted">{description}</p>
          {children}
        </Reveal>

        {photo && (
          <Reveal effet="zoom" delay={0.1}>
            <figure className="relative">
              <ScrollZoomImage
                src={photo.src}
                alt={photo.alt}
                preload
                sizes="(min-width: 1024px) 540px, 100vw"
                position={position}
                className="aspect-[4/3] w-full rounded-[1.75rem] shadow-[0_40px_80px_-45px_rgba(10,26,56,0.6)]"
              />
              <PhotoCredit photo={photo} className="bottom-3 right-3" />
            </figure>
          </Reveal>
        )}
      </div>
    </section>
  );
}

export function TitreSection({
  surTitre,
  titre,
  description,
  className = "",
}: {
  surTitre: string;
  titre: string;
  description?: string;
  className?: string;
}) {
  return (
    <Reveal className={`max-w-2xl ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{surTitre}</span>
      <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-text sm:text-4xl">{titre}</h2>
      {description && <p className="mt-5 leading-7 text-text-muted">{description}</p>}
    </Reveal>
  );
}

export function GrilleFonctionnalites({ elements }: { elements: { icon: Icone; titre: string; texte: string }[] }) {
  return (
    <div className="grid gap-px overflow-hidden rounded-[1.25rem] border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
      {elements.map((element, i) => (
        <Reveal key={element.titre} delay={(i % 3) * 0.08} className="bg-surface">
          <div className="group h-full p-8 transition-colors duration-500 hover:bg-primary-soft/40">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary transition-colors duration-500 group-hover:bg-primary group-hover:text-white">
              <element.icon width={22} height={22} />
            </div>
            <h3 className="mt-6 font-display text-lg font-semibold text-text">{element.titre}</h3>
            <p className="mt-2 text-sm leading-6 text-text-muted">{element.texte}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

export function Parcours({
  etapes,
}: {
  etapes: { icon: Icone; titre: string; texte: string; surTitre?: string; href?: string; lien?: string }[];
}) {
  return (
    <FilProgression className="flex flex-col gap-6">
      {etapes.map((etape, i) => (
        <Reveal key={etape.titre} delay={0.05}>
          <article className="group relative flex gap-6">
            <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-primary shadow-[var(--shadow-soft)] transition-all duration-500 group-hover:scale-110 group-hover:border-primary group-hover:bg-primary group-hover:text-white">
              <etape.icon width={20} height={20} />
            </span>
            <div className="flex-1 rounded-[1.25rem] border border-border bg-surface p-6 transition-all duration-500 group-hover:-translate-y-1 group-hover:border-primary/25 group-hover:shadow-[0_30px_60px_-35px_rgba(22,87,204,0.45)] sm:p-7">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                  {etape.surTitre ?? `Étape ${i + 1}`}
                </span>
                <span className="font-display text-sm font-bold tabular-nums text-text-faint">0{i + 1}</span>
              </div>
              <h3 className="mt-2 font-display text-xl font-semibold text-text">{etape.titre}</h3>
              <p className="mt-3 text-sm leading-6 text-text-muted">{etape.texte}</p>
              {etape.href && etape.lien && (
                <Link href={etape.href} className="group/lien mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  {etape.lien}
                  <IconArrowRight width={15} height={15} className="transition-transform group-hover/lien:translate-x-1" />
                </Link>
              )}
            </div>
          </article>
        </Reveal>
      ))}
    </FilProgression>
  );
}

export function AppelAction({ titre, texte }: { titre: string; texte: string }) {
  return (
    <section className="px-5 py-24 sm:px-8">
      <Reveal effet="zoom" className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[2rem] bg-navy px-8 py-16 text-center sm:px-16 md:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-primary/40 blur-3xl"
          />
          <div className="relative">
            <LogoSymbole className="mx-auto h-14 w-14" />
            <h2 className="mx-auto mt-8 max-w-2xl font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
              {titre}
            </h2>
            <p className="mx-auto mt-5 max-w-lg leading-7 text-white/70">{texte}</p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link
                href="/inscription"
                className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-white px-6 py-3 text-sm font-semibold text-navy transition-transform hover:-translate-y-0.5"
              >
                Inscrire mon établissement
                <IconArrowRight width={16} height={16} />
              </Link>
              <a
                href={`mailto:${SITE.emailContact}`}
                className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                <IconMail width={16} height={16} />
                Nous contacter
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
