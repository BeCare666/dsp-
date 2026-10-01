"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

type ToastVariant = "success" | "danger" | "info";

interface ToastMessage {
  id: number;
  titre: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  notifier: (titre: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANTS: Record<ToastVariant, string> = {
  success: "border-success/20 bg-success-soft text-success",
  danger: "border-danger/20 bg-danger-soft text-danger",
  info: "border-info/20 bg-info-soft text-info",
};

// Gap identifié en Phase 0 (FRONTEND_AUDIT.md §6) : aucun accusé visible pour
// une action qui réussit (seul un message d'erreur inline existait). Provider
// câblé une fois dans app/layout.tsx ; useToast() reste à appeler
// explicitement depuis les composants d'action au fil des phases suivantes,
// pas rétrofité automatiquement sur l'existant dans cette passe.
export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const notifier = useCallback((titre: string, variant: ToastVariant = "success") => {
    const id = Date.now();
    setMessages((m) => [...m, { id, titre, variant }]);
    setTimeout(() => setMessages((m) => m.filter((msg) => msg.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ notifier }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4">
        <AnimatePresence>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className={`pointer-events-auto rounded-[var(--radius-md)] border px-4 py-2.5 text-sm font-medium shadow-[var(--shadow-elevated)] ${VARIANTS[m.variant]}`}
            >
              {m.titre}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast doit être utilisé à l'intérieur d'un ToastProvider");
  return ctx;
}
