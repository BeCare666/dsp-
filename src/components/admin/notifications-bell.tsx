"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { IconBell } from "@/components/icons";
import { formaterDateHeure } from "@/lib/format";
import { marquerNotificationLueAction, marquerToutesNotificationsLuesAction } from "@/lib/notifications-actions";
import type { NotificationInterne } from "@/lib/types";

const INTERVALLE_POLLING_MS = 45_000;

export function NotificationsBell({
  notificationsInitiales,
  nombreNonLuesInitial,
}: {
  notificationsInitiales: NotificationInterne[];
  nombreNonLuesInitial: number;
}) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(notificationsInitiales);
  const [nombreNonLues, setNombreNonLues] = useState(nombreNonLuesInitial);
  const [ouvert, setOuvert] = useState(false);
  const conteneurRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function rafraichir() {
      try {
        const res = await fetch("/api/notifications-internes", { cache: "no-store" });
        if (!res.ok) return;
        const corps = (await res.json()) as { notifications: NotificationInterne[]; nombreNonLues: number };
        setNotifications(corps.notifications);
        setNombreNonLues(corps.nombreNonLues);
      } catch {
        // silencieux : le polling reprendra au prochain intervalle.
      }
    }
    const id = setInterval(rafraichir, INTERVALLE_POLLING_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function onClicExterieur(e: MouseEvent) {
      if (conteneurRef.current && !conteneurRef.current.contains(e.target as Node)) setOuvert(false);
    }
    document.addEventListener("mousedown", onClicExterieur);
    return () => document.removeEventListener("mousedown", onClicExterieur);
  }, []);

  async function ouvrirNotification(notification: NotificationInterne) {
    if (!notification.luLe) {
      setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, luLe: new Date().toISOString() } : n)));
      setNombreNonLues((n) => Math.max(0, n - 1));
      await marquerNotificationLueAction(notification.id);
    }
    setOuvert(false);
    if (notification.lienUrl) router.push(notification.lienUrl);
  }

  async function toutMarquerLu() {
    setNotifications((prev) => prev.map((n) => ({ ...n, luLe: n.luLe ?? new Date().toISOString() })));
    setNombreNonLues(0);
    await marquerToutesNotificationsLuesAction();
  }

  return (
    <div ref={conteneurRef} className="relative">
      <button
        type="button"
        onClick={() => setOuvert((v) => !v)}
        aria-label="Notifications"
        className="relative rounded-full p-2 text-text-muted transition-colors hover:bg-bg-subtle hover:text-text"
      >
        <IconBell width={20} height={20} />
        {nombreNonLues > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">
            {nombreNonLues > 9 ? "9+" : nombreNonLues}
          </span>
        )}
      </button>

      <AnimatePresence>
        {ouvert && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-elevated)]"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-sm font-semibold text-text">Notifications</span>
              {nombreNonLues > 0 && (
                <button type="button" onClick={toutMarquerLu} className="text-xs font-medium text-primary hover:underline">
                  Tout marquer comme lu
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-text-muted">Aucune notification.</p>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => ouvrirNotification(n)}
                    className={`flex w-full flex-col gap-0.5 border-b border-border px-4 py-3 text-left transition-colors last:border-0 hover:bg-bg-subtle ${
                      !n.luLe ? "bg-primary-soft/30" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {!n.luLe && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                      <span className="text-sm font-medium text-text">{n.titre}</span>
                    </div>
                    <span className="text-xs text-text-muted">{n.message}</span>
                    <span className="text-[11px] text-text-faint">{formaterDateHeure(n.createdAt)}</span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
