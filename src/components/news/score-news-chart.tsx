"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXE, COULEURS, STYLE_INFOBULLE } from "@/lib/chart-theme";

export interface PointScoreNews {
  date: string; // libellé déjà formaté
  score: number;
}

// Évolution du score NEWS d'un patient, mesure après mesure (ordre
// chronologique renvoyé par GET /patients/:id/mesures).
export function ScoreNewsChart({ points }: { points: PointScoreNews[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={points} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid stroke={COULEURS.bordure} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tick={AXE.tick} axisLine={AXE.ligne} tickLine={false} minTickGap={28} />
        <YAxis allowDecimals={false} domain={[0, "auto"]} tick={AXE.tick} axisLine={false} tickLine={false} width={40} />
        <Tooltip contentStyle={STYLE_INFOBULLE} formatter={(v) => [v, "Score NEWS"]} />
        <Line
          type="monotone"
          dataKey="score"
          stroke={COULEURS.primary}
          strokeWidth={2.5}
          dot={{ r: 3.5, fill: COULEURS.primary, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
