"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXE, COULEURS, STYLE_INFOBULLE } from "@/lib/chart-theme";
import type { ActivitePlateforme } from "@/lib/types";

const SERIES: { cle: keyof ActivitePlateforme["series"]; label: string; couleur: string }[] = [
  { cle: "etablissementsInscrits", label: "Établissements inscrits", couleur: COULEURS.navy },
  { cle: "evaluationsSoumises", label: "Évaluations soumises", couleur: COULEURS.primary },
  { cle: "alertesNews", label: "Alertes NEWS", couleur: COULEURS.danger },
  { cle: "evenementsIndesirables", label: "EI déclarés", couleur: COULEURS.warning },
  { cle: "reservations", label: "Réservations", couleur: COULEURS.success },
];

const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

// §12.6 — évolution globale de l'activité, mois par mois.
export function ActiviteChart({ activite }: { activite: ActivitePlateforme }) {
  const donnees = activite.mois.map((m, i) => {
    const [annee, mois] = m.split("-");
    const point: Record<string, string | number> = { mois: `${MOIS[Number(mois) - 1]} ${annee.slice(2)}` };
    for (const s of SERIES) point[s.cle] = activite.series[s.cle][i];
    return point;
  });
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={donnees} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid stroke={COULEURS.bordure} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="mois" tick={AXE.tick} axisLine={AXE.ligne} tickLine={false} minTickGap={16} />
        <YAxis allowDecimals={false} tick={AXE.tick} axisLine={false} tickLine={false} width={40} />
        <Tooltip contentStyle={STYLE_INFOBULLE} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {SERIES.map((s) => (
          <Line key={s.cle} type="monotone" dataKey={s.cle} name={s.label} stroke={s.couleur} strokeWidth={2} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
