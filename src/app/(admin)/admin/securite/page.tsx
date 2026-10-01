import type { Metadata } from "next";
import { apiFetchJson, silencieux } from "@/lib/api-server";
import { Reveal } from "@/components/motion/reveal";
import { PageHeader } from "@/components/ui/page-header";
import { SectionReglage } from "@/components/ui/section-reglage";
import { IconKey, IconLock } from "@/components/icons";
import type { EtatSecurite } from "@/lib/types";

export const metadata: Metadata = {
  title: "Administration · Sécurité",
  robots: { index: false, follow: false },
};

function Tuile({ label, valeur, icone: Icone }: { label: string; valeur: string; icone: typeof IconLock }) {
  return (
    <div className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary-soft text-primary">
        <Icone width={19} height={19} />
      </span>
      <div>
        <p className="text-xs font-medium text-text-faint">{label}</p>
        <p className="font-display text-lg font-bold text-text tabular-nums">{valeur}</p>
      </div>
    </div>
  );
}

export default async function AdminSecuritePage() {
  const etat = await silencieux(apiFetchJson<EtatSecurite>("/securite"), null);

  return (
    <div className="mx-auto max-w-5xl">
      <Reveal>
        <PageHeader
          surtitre="Système"
          titre="Sécurité"
          description="Informations de sécurité réellement disponibles, en lecture seule. La durée de session n'est pas modifiable depuis cette interface, car un mauvais réglage affaiblirait la sécurité de toute la plateforme."
        />
      </Reveal>

      {!etat ? (
        <p className="text-sm text-text-muted">Informations de sécurité indisponibles pour l&apos;instant.</p>
      ) : (
        <Reveal delay={0.05}>
          <SectionReglage
            titre="Durée de session"
            description="Durée de validité des jetons d'authentification, définie dans la configuration du serveur."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Tuile label="Token d'accès (JWT)" valeur={etat.session.jwtAccessTtl} icone={IconKey} />
              <Tuile label="Token de rafraîchissement" valeur={etat.session.jwtRefreshTtl} icone={IconLock} />
            </div>
          </SectionReglage>

          <SectionReglage
            titre="Limitation de débit"
            description="Nombre maximal de requêtes autorisées sur les points d'entrée sensibles (rate limiting)."
          >
            <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-card)]">
              <div className="hidden md:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-bg-subtle/70 text-xs font-semibold text-text-muted">
                      <th className="px-4 py-2.5">Endpoint</th>
                      <th className="px-4 py-2.5">Limite</th>
                      <th className="px-4 py-2.5">Fenêtre</th>
                      <th className="px-4 py-2.5">Justification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {etat.rateLimiting.map((r) => (
                      <tr key={r.endpoint} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 font-mono text-xs text-text">{r.endpoint}</td>
                        <td className="px-4 py-3 font-medium text-text tabular-nums">{r.limite}</td>
                        <td className="px-4 py-3 text-text-muted">{r.fenetre}</td>
                        <td className="px-4 py-3 text-text-muted">{r.justification}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ul className="divide-y divide-border md:hidden">
                {etat.rateLimiting.map((r) => (
                  <li key={r.endpoint} className="p-4">
                    <p className="font-mono text-xs text-text">{r.endpoint}</p>
                    <p className="mt-1 text-sm text-text">
                      <span className="font-medium tabular-nums">{r.limite}</span>
                      <span className="text-text-muted"> · {r.fenetre}</span>
                    </p>
                    <p className="mt-1 text-xs text-text-muted">{r.justification}</p>
                  </li>
                ))}
              </ul>
            </div>
          </SectionReglage>
        </Reveal>
      )}
    </div>
  );
}
