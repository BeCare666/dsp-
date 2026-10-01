"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  // "haut" : glisse depuis le bas (défaut). "zoom" : légère mise à l'échelle,
  // réservée aux blocs visuels (cartes image, chiffres clés).
  effet?: "haut" | "zoom";
}

// Révélation douce au scroll : anime une seule fois, respecte les utilisateurs
// qui préfèrent moins de mouvement (motion applique reduced-motion automatiquement
// pour les transforms via son support natif de prefers-reduced-motion).
export function Reveal({ children, delay = 0, className, effet = "haut" }: RevealProps) {
  const initial = effet === "zoom" ? { opacity: 0, scale: 0.94 } : { opacity: 0, y: 24 };
  const visible = effet === "zoom" ? { opacity: 1, scale: 1 } : { opacity: 1, y: 0 };

  return (
    <motion.div
      initial={initial}
      whileInView={visible}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
