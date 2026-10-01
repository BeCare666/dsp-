"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import type { EtatAction } from "@/lib/types";

interface Confirmation {
  titre: string;
  description?: string;
  confirmLabel: string;
  danger?: boolean;
}

interface Demande extends Confirmation {
  executer: () => Promise<void>;
}

// Actions de ligne des tables admin (menu « ⋯ »). Même convention que la
// Phase 4 : action destructive → ConfirmDialog puis toast ; action non
// destructive → exécution directe puis toast. Dans une table, l'erreur est
// notifiée par toast (pas de place pour un message sous la ligne) et, pour
// une action confirmée, la boîte de dialogue reste ouverte.
export function useActionConfirmee() {
  const { notifier } = useToast();
  const [demande, setDemande] = useState<Demande | null>(null);

  async function executer(action: () => Promise<EtatAction>, messageSucces: string) {
    const etat = await action();
    if (etat.erreur) {
      notifier(etat.erreur, "danger");
      throw new Error(etat.erreur);
    }
    notifier(messageSucces);
  }

  function lancer(action: () => Promise<EtatAction>, messageSucces: string, confirmation?: Confirmation) {
    if (confirmation) {
      setDemande({ ...confirmation, executer: () => executer(action, messageSucces) });
    } else {
      executer(action, messageSucces).catch(() => {
        // Erreur déjà notifiée par toast.
      });
    }
  }

  const dialogue = (
    <ConfirmDialog
      open={demande !== null}
      onClose={() => setDemande(null)}
      onConfirm={() => demande?.executer()}
      titre={demande?.titre ?? ""}
      description={demande?.description}
      confirmLabel={demande?.confirmLabel}
      danger={demande?.danger ?? true}
    />
  );

  return { lancer, dialogue };
}
