"use client";

import { motion } from "motion/react";
import { ScrollZoomImage } from "@/components/motion/scroll-zoom-image";
import { PhotoCredit } from "@/components/marketing/photo-credit";
import { PHOTOS } from "@/lib/site-config";

const EASE = [0.22, 1, 0.36, 1] as const;

// Visuel d'ouverture : photographie en cadre haut + deux cartes flottantes qui
// reprennent de vrais éléments d'interface de la plateforme (score NEWS,
// progression d'auto-évaluation).
export function HeroVisuel() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: EASE }}
        className="relative ml-auto aspect-[4/5] w-[86%] overflow-hidden rounded-[1.75rem] shadow-[0_40px_80px_-40px_rgba(10,26,56,0.55)] ring-1 ring-black/5"
      >
        <ScrollZoomImage
          src={PHOTOS.medecin.src}
          alt={PHOTOS.medecin.alt}
          sizes="(min-width: 1024px) 440px, 86vw"
          position="50% 22%"
          preload
          className="h-full w-full"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-navy/45 via-transparent to-transparent" />
        <PhotoCredit photo={PHOTOS.medecin} className="bottom-3 right-3" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -24, y: 12 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.9, delay: 0.45, ease: EASE }}
        className="absolute bottom-10 left-0 w-56 rounded-2xl border border-white/60 bg-white/90 p-4 shadow-[var(--shadow-elevated)] backdrop-blur-md"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-faint">Score NEWS</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-medium text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Risque faible
          </span>
        </div>
        <div className="mt-2 flex items-end gap-1.5">
          <span className="font-display text-4xl font-bold tabular-nums text-text">2</span>
          <span className="mb-1 text-xs text-text-faint">/ 20</span>
        </div>
        <svg viewBox="0 0 96 28" className="mt-2 h-8 w-full text-primary" fill="none" aria-hidden="true">
          <polyline
            points="0,22 12,20 24,21 36,14 48,16 60,9 72,12 84,5 96,8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.7, ease: EASE }}
        className="absolute left-4 top-8 w-52 rounded-2xl border border-white/60 bg-white/90 p-4 shadow-[var(--shadow-elevated)] backdrop-blur-md sm:left-0"
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-faint">Auto-évaluation</span>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-sm font-medium text-text">Critères validés</span>
          <span className="font-display text-lg font-bold tabular-nums text-primary">78 %</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-primary-soft">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "78%" }}
            transition={{ duration: 1.4, delay: 1, ease: EASE }}
            className="h-full rounded-full bg-primary"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 1.1, ease: EASE }}
        className="absolute -right-2 top-1/2 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/95 px-3.5 py-2 text-xs font-semibold text-accent shadow-[var(--shadow-elevated)] sm:-right-4"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
        </span>
        Alerte automatique
      </motion.div>
    </div>
  );
}
