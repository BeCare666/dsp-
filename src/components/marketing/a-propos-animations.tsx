"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  animate,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

// Ouverture plein écran : la photo se dézoome à l'arrivée puis glisse plus
// lentement que le texte pendant le défilement (profondeur), le texte s'efface.
export function HeroAPropos({
  image,
  alt,
  children,
  credit,
}: {
  image: string;
  alt: string;
  children: ReactNode;
  credit: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduire = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yImage = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const scaleImage = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const yTexte = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opaciteTexte = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section ref={ref} className="relative isolate flex min-h-[88svh] items-end overflow-hidden bg-navy-deep">
      <motion.div
        style={reduire ? undefined : { y: yImage, scale: scaleImage }}
        className="absolute inset-0 -z-10 will-change-transform"
      >
        <motion.div
          initial={reduire ? false : { scale: 1.25, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2.2, ease: EASE }}
          className="absolute inset-0"
        >
          <Image src={image} alt={alt} fill preload sizes="100vw" className="object-cover" style={{ objectPosition: "center 40%" }} />
        </motion.div>
      </motion.div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-deep via-navy-deep/70 to-navy-deep/25" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-deep/80 to-transparent" />

      <motion.div
        style={reduire ? undefined : { y: yTexte, opacity: opaciteTexte }}
        className="relative mx-auto w-full max-w-6xl px-5 pb-20 pt-32 sm:px-8 md:pb-28"
      >
        {children}
      </motion.div>
      {credit}
    </section>
  );
}

// Apparition d'un texte mot après mot, une seule fois, à l'entrée à l'écran.
export function TexteRevele({ texte, className }: { texte: string; className?: string }) {
  const mots = texte.split(" ");
  return (
    <motion.p
      className={className}
      initial="cache"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      transition={{ staggerChildren: 0.035 }}
    >
      {mots.map((mot, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-top">
          <motion.span
            className="inline-block"
            variants={{ cache: { y: "105%", opacity: 0 }, visible: { y: "0%", opacity: 1 } }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            {mot}
            {i < mots.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </motion.p>
  );
}

// Nombre qui défile de 0 à sa valeur réelle quand il entre à l'écran.
export function CompteurAnime({ valeur, className }: { valeur: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref, { once: true, margin: "-60px" });
  const reduire = useReducedMotion();
  const [affiche, setAffiche] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const controle = animate(0, valeur, {
      duration: reduire ? 0 : 1.6,
      ease: EASE,
      onUpdate: (v) => setAffiche(Math.round(v)),
    });
    return () => controle.stop();
  }, [visible, valeur, reduire]);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{valeur}</span>
      <span aria-hidden="true">{affiche}</span>
    </span>
  );
}

// Fil vertical qui se trace au fil du défilement, le long des étapes.
export function FilProgression({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });

  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      <div aria-hidden="true" className="absolute bottom-6 left-6 top-6 w-px bg-border" />
      <motion.div
        aria-hidden="true"
        style={{ scaleY: scrollYProgress }}
        className="absolute bottom-6 left-6 top-6 w-px origin-top bg-gradient-to-b from-primary to-accent"
      />
      {children}
    </div>
  );
}

// Bandeau photo plein cadre : zoom lié au défilement, citation au premier plan.
export function BandeauPhoto({
  image,
  alt,
  position = "center",
  children,
  credit,
}: {
  image: string;
  alt: string;
  position?: string;
  children: ReactNode;
  credit: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduire = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.3, 1]);
  const yTexte = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section ref={ref} className="relative isolate flex min-h-[80svh] items-center overflow-hidden bg-navy-deep">
      <motion.div style={reduire ? undefined : { scale }} className="absolute inset-0 -z-10 will-change-transform">
        <Image src={image} alt={alt} fill sizes="100vw" className="object-cover" style={{ objectPosition: position }} />
      </motion.div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-navy-deep/65" />
      <motion.div style={reduire ? undefined : { y: yTexte }} className="relative mx-auto w-full max-w-4xl px-5 py-24 text-center sm:px-8">
        {children}
      </motion.div>
      {credit}
    </section>
  );
}
