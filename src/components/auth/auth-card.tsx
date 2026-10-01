import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";

interface AuthCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <Reveal>
      <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-7 shadow-[var(--shadow-soft)] sm:p-9">
        <h1 className="font-display text-2xl font-bold text-text">{title}</h1>
        {description && <p className="mt-2 text-sm text-text-muted">{description}</p>}
        <div className="mt-6">{children}</div>
      </div>
      {footer && <div className="mt-6 text-center text-sm text-text-muted">{footer}</div>}
    </Reveal>
  );
}
