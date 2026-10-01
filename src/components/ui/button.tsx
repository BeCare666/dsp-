"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { ComponentPropsWithoutRef } from "react";

const VARIANTS = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-[var(--shadow-soft)]",
  secondary: "bg-surface text-text border border-border hover:border-primary/40 hover:bg-primary-soft/60",
  ghost: "bg-transparent text-text-muted hover:text-text hover:bg-bg-subtle",
  // Actions destructrices (ConfirmDialog notamment) — jamais utilisé comme
  // variante "primary" par défaut d'une page.
  danger: "bg-danger text-primary-foreground hover:bg-danger/90 shadow-[var(--shadow-soft)]",
} as const;

type Variant = keyof typeof VARIANTS;

const baseClass =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none";

// motion.button réutilise onDrag/onAnimationStart/etc. pour ses propres gestes,
// avec une signature différente des événements DOM natifs — il faut les exclure
// des props HTML natives pour éviter un conflit de types.
type ButtonHtmlProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration"
>;

interface ButtonProps extends ButtonHtmlProps {
  variant?: Variant;
  href?: string;
}

export function Button({ variant = "primary", href, className = "", children, ...props }: ButtonProps) {
  const classes = `${baseClass} ${VARIANTS[variant]} ${className}`;

  if (href) {
    return (
      <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }} className="inline-block">
        <Link href={href} className={classes}>
          {children}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      className={classes}
      {...props}
    >
      {children}
    </motion.button>
  );
}
