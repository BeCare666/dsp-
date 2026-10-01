"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

interface ScrollZoomImageProps {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  preload?: boolean;
  // Cadrage de l'image dans son conteneur (object-position CSS).
  position?: string;
}

// Photo qui se "dézoome" lentement pendant qu'elle traverse l'écran : effet de
// profondeur discret, lié au scroll (pas à un minuteur). Désactivé pour les
// visiteurs qui demandent moins de mouvement au niveau du système.
export function ScrollZoomImage({ src, alt, sizes, className, preload, position = "center" }: ScrollZoomImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduire = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.18, 1]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className ?? ""}`}>
      <motion.div style={reduire ? undefined : { scale }} className="absolute inset-0 will-change-transform">
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          preload={preload}
          className="object-cover"
          style={{ objectPosition: position }}
        />
      </motion.div>
    </div>
  );
}
