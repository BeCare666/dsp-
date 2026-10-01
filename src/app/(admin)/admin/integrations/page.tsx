import type { Metadata } from "next";
import { apiFetchJson, silencieux } from "@/lib/api-server";
import { Reveal } from "@/components/motion/reveal";
import { PageHeader } from "@/components/ui/page-header";
import { IconPlug, IconServer } from "@/components/icons";
import type { EtatIntegration, StatutIntegration } from "@/lib/types";

export const metadata: Metadata = {
  title: "Administration · Intégrations",
  robots: { index: false, follow: false },
};

const STYLES_STATUT: Record<StatutIntegration, { pastille: string; texte: string }> = {
  verifie_ok: { pastille: "bg-success", texte: "text-success" },
  verifie_erreur: { pastille: "bg-danger", texte: "text-danger" },
  configure: { pastille: "bg-primary", texte: "text-primary" },
  non_configure: { pastille: "bg-text-faint", texte: "text-text-faint" },
};

const LIBELLES_STATUT: Record<StatutIntegration, string> = {
  verifie_ok: "Vérifié en direct : opérationnel",
  verifie_erreur: "Vérifié en direct : en erreur",
  configure: "Configuré (non vérifié en direct)",
  non_configure: "Non configuré",
};

export default async function AdminIntegrationsPage() {
  const etats = await silencieux(apiFetchJson<EtatIntegration[]>("/integrations"), []);
  const configures = etats.filter((e) => e.statut !== "non_configure").length;

  return (
    <div>
      <Reveal>
        <PageHeader
          surtitre="Système"
          titre="Intégrations"
          description="État des services externes utilisés par la plateforme. La base de données est vérifiée par une requête réelle ; les autres services sont vérifiés par présence de configuration (pas d'appel réseau déclenché depuis cette page)."
          actions={
            etats.length > 0 ? (
              <span className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-text-muted">
                <span className="font-semibold text-text tabular-nums">{configures}</span> / {etats.length} configurés
              </span>
            ) : undefined
          }
        />
      </Reveal>

      {etats.length === 0 ? (
        <p className="text-sm text-text-muted">État des intégrations indisponible pour l&apos;instant.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {etats.map((e, i) => {
            const style = STYLES_STATUT[e.statut];
            const Icone = /base de donn/i.test(e.nom) ? IconServer : IconPlug;
            return (
              <Reveal
                key={e.nom}
                delay={i * 0.05}
                className="flex flex-col rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-bg-subtle text-text-muted">
                    <Icone width={19} height={19} />
                  </span>
                  <span className="relative mt-1 flex h-2.5 w-2.5">
                    {e.statut === "verifie_ok" && (
                      <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-50 ${style.pastille}`} />
                    )}
                    <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${style.pastille}`} />
                  </span>
                </div>
                <p className="mt-4 font-display text-base font-semibold text-text">{e.nom}</p>
                <p className={`mt-0.5 text-xs font-medium ${style.texte}`}>{LIBELLES_STATUT[e.statut]}</p>
                <p className="mt-3 text-sm leading-6 text-text-muted">{e.details}</p>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
