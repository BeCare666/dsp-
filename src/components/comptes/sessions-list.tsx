"use client";

import { useState } from "react";
import { formaterDateHeure } from "@/lib/format";
import { revoquerSessionAction } from "@/lib/admin-actions";
import { revoquerMaSessionAction } from "@/lib/auth-actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import type { SessionUtilisateur } from "@/lib/types";

function estActive(session: SessionUtilisateur): boolean {
  return !session.revokedAt && new Date(session.expiresAt) > new Date();
}

// Un seul composant pour les deux usages (Phase 2 — élimine la quasi-duplication
// admin/sessions-list.tsx vs comptes/mes-sessions-list.tsx, D8.2) : `utilisateurId`
// présent → admin révoque la session d'un autre utilisateur (D3) ; absent →
// self-service, révoque sa propre session (D8.2, scope = user.sub côté API).
// Le branchement se fait à l'intérieur de ce composant client (pas via une
// fonction passée en prop depuis un Server Component, qui ne se sérialise pas).
// Phase 4 — rétrofit ConfirmDialog + Toast : révocation toujours destructive,
// toujours confirmée.
function BoutonRevoquer({ utilisateurId, sessionId }: { utilisateurId?: string; sessionId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [erreur, setErreur] = useState<string>();
  const { notifier } = useToast();

  async function revoquer() {
    setPending(true);
    setErreur(undefined);
    const etat = utilisateurId
      ? await revoquerSessionAction(utilisateurId, sessionId)
      : await revoquerMaSessionAction(sessionId);
    setPending(false);
    if (etat.erreur) {
      setErreur(etat.erreur);
      throw new Error(etat.erreur);
    }
    notifier("Session révoquée.");
  }

  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() => setOpen(true)}
        className="rounded-[var(--radius-md)] border border-border px-3 py-1.5 text-xs font-medium text-text transition-colors hover:border-danger/40 hover:text-danger disabled:opacity-50"
      >
        {pending ? "…" : "Révoquer"}
      </button>
      {erreur && <p className="mt-1 text-xs text-danger">{erreur}</p>}
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={revoquer}
        titre="Révoquer cette session ?"
        description="L'appareil connecté avec cette session sera immédiatement déconnecté."
        confirmLabel="Révoquer"
      />
    </>
  );
}

export function SessionsList({ utilisateurId, sessions }: { utilisateurId?: string; sessions: SessionUtilisateur[] }) {
  if (sessions.length === 0) {
    return <p className="text-sm text-text-muted">Aucune session enregistrée.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {sessions.map((s) => {
        const active = estActive(s);
        return (
          <div
            key={s.id}
            className="flex items-center justify-between rounded-[var(--radius-md)] border border-border bg-surface px-4 py-3"
          >
            <div>
              <p className="text-sm text-text">
                Connectée le {formaterDateHeure(s.createdAt)}
                {!active && (
                  <span className="ml-2 text-xs text-text-faint">
                    ({s.revokedAt ? "révoquée" : "expirée"})
                  </span>
                )}
              </p>
              <p className="text-xs text-text-faint">Expire le {formaterDateHeure(s.expiresAt)}</p>
            </div>
            {active && <BoutonRevoquer utilisateurId={utilisateurId} sessionId={s.id} />}
          </div>
        );
      })}
    </div>
  );
}
