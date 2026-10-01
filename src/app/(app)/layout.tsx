import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { OrgShell } from "@/components/app-shell/org-shell";
import { apiFetchJson, silencieux } from "@/lib/api-server";
import { aRole, obtenirSession } from "@/lib/session";
import type { Alerte, EvenementIndesirable, NotificationInterne, Organisation, UtilisateurProfil } from "@/lib/types";
import type { AlerteResume } from "@/components/app-shell/alerts-bell";
import { libellePatient } from "@/lib/patient-libelle";

function versAlertesNews(alertes: Alerte[]): AlerteResume[] {
  return alertes.map((a) => ({
    id: `news-${a.id}`,
    titre: `Alerte NEWS de niveau ${a.niveauRisque}`,
    sousTitre: libellePatient(a.patient),
    lienUrl: `/news/alertes/${a.id}`,
    createdAt: a.createdAt,
  }));
}

function versAlertesEi(evenements: EvenementIndesirable[]): AlerteResume[] {
  // critique=true ne filtre pas par statut côté API (ListEiQueryDto n'a pas
  // de "not equal") — on exclut les EI déjà clôturés côté serveur ici.
  return evenements
    .filter((e) => e.statut !== "CLOTURE")
    .map((e) => ({
      id: `ei-${e.id}`,
      titre: `Événement indésirable : ${e.niveauGravite?.libelle ?? "gravité élevée"}`,
      sousTitre: e.typeEi?.libelle ?? "Type non précisé",
      lienUrl: `/evenements-indesirables/${e.id}`,
      createdAt: e.dateDeclaration,
    }));
}

export default async function AppLayout({ children }: { children: ReactNode }) {
  const estAdmin = await aRole("ADMIN_PLATEFORME");
  if (estAdmin) redirect("/admin");

  const [organisation, profil, session, notifications, nonLues] = await Promise.all([
    silencieux(apiFetchJson<Organisation>("/organisations/me"), null),
    apiFetchJson<UtilisateurProfil>("/auth/me/profil"),
    obtenirSession(),
    silencieux(apiFetchJson<NotificationInterne[]>("/notifications-internes"), []),
    silencieux(apiFetchJson<{ nombre: number }>("/notifications-internes/non-lues/nombre"), { nombre: 0 }),
  ]);
  const estIndividuel = organisation === null;

  const [alertesNews, evenementsEi] = estIndividuel
    ? [[], []]
    : await Promise.all([
        silencieux(apiFetchJson<Alerte[]>("/alertes?statut=OUVERTE"), []),
        silencieux(apiFetchJson<EvenementIndesirable[]>("/evenements-indesirables?critique=true"), []),
      ]);

  const alertes = [...versAlertesNews(alertesNews), ...versAlertesEi(evenementsEi)].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <OrgShell
      profil={profil}
      organisationNom={organisation?.nom}
      estIndividuel={estIndividuel}
      roles={session?.roles ?? []}
      alertes={alertes}
      notificationsInitiales={notifications}
      nombreNonLuesInitial={nonLues.nombre}
    >
      {children}
    </OrgShell>
  );
}
