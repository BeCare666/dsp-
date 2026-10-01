"use client";

import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/app-shell";
import { GROUPES_ADMIN } from "@/components/admin/admin-sidebar";
import { NotificationsBell } from "@/components/admin/notifications-bell";
import { ProfileMenu } from "@/components/admin/profile-menu";
import type { NotificationInterne, UtilisateurProfil } from "@/lib/types";

interface AdminShellProps {
  profil: UtilisateurProfil;
  notificationsInitiales: NotificationInterne[];
  nombreNonLuesInitial: number;
  children: ReactNode;
}

export function AdminShell({ profil, notificationsInitiales, nombreNonLuesInitial, children }: AdminShellProps) {
  return (
    <AppShell
      logoHref="/admin"
      groupes={GROUPES_ADMIN}
      storagePrefix="dps:admin-sidebar"
      placeholderRecherche="Rechercher une page…"
      actions={
        <>
          <NotificationsBell notificationsInitiales={notificationsInitiales} nombreNonLuesInitial={nombreNonLuesInitial} />
          <ProfileMenu
            profil={profil}
            profilHref="/admin/profil"
            parametresHref="/admin/parametres"
            contexte="Administrateur plateforme"
          />
        </>
      }
    >
      {/* Les pages admin n'ont pas leur propre conteneur (contrairement aux
          pages organisation) : largeur plafonnée et marges posées ici. */}
      <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8">{children}</div>
    </AppShell>
  );
}
