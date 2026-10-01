"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

// Étape de confirmation pour les actions sensibles (désactiver un compte,
// révoquer une session, retirer un rôle…) — gap identifié en Phase 0
// (FRONTEND_AUDIT.md §7) : ces actions déclenchaient jusqu'ici directement
// au clic, sans confirmation intermédiaire. Composant créé en Phase 2 ; le
// câblage sur les boutons existants est laissé à une phase ultérieure pour
// ne pas re-tester une dizaine de composants déjà vérifiés dans le même lot.
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  titre,
  description,
  confirmLabel = "Confirmer",
  danger = true,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  titre: string;
  description?: string;
  confirmLabel?: string;
  danger?: boolean;
}) {
  const [pending, setPending] = useState(false);

  async function confirmer() {
    setPending(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setPending(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={titre} description={description}>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onClose} disabled={pending}>
          Annuler
        </Button>
        <Button type="button" variant={danger ? "danger" : "primary"} onClick={confirmer} disabled={pending}>
          {pending ? "…" : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
