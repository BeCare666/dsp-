"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXE, COULEURS, STYLE_INFOBULLE } from "@/lib/chart-theme";

export interface PointEvolution {
  date: string; // libellé déjà formaté (jj/mm/aaaa)
  score: number;
  grille: string;
}

// Évolution des scores d'auto-évaluation soumis (GET /sessions-evaluation/evolution,
// ordonné par date de soumission côté API). Échelle fixe 0–100 %.
export function EvolutionChart({ points }: { points: PointEvolution[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={points} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="degrade-score" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COULEURS.primary} stopOpacity={0.22} />
            <stop offset="100%" stopColor={COULEURS.primary} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={COULEURS.bordure} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tick={AXE.tick} axisLine={AXE.ligne} tickLine={false} minTickGap={24} />
        <YAxis
          domain={[0, 100]}
          ticks={[0, 25, 50, 75, 100]}
          tickFormatter={(v: number) => `${v}%`}
          tick={AXE.tick}
          axisLine={false}
          tickLine={false}
          width={44}
        />
        <Tooltip
          contentStyle={STYLE_INFOBULLE}
          formatter={(valeur) => [`${valeur}%`, "Score"]}
          labelFormatter={(label, charge) => {
            const grille = charge?.[0]?.payload?.grille;
            return grille ? `${label} · ${grille}` : String(label);
          }}
        />
        <Area
          type="monotone"
          dataKey="score"
          stroke={COULEURS.primary}
          strokeWidth={2.5}
          fill="url(#degrade-score)"
          dot={{ r: 3.5, fill: COULEURS.primary, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
