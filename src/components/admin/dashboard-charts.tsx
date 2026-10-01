"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { STYLE_INFOBULLE } from "@/lib/chart-theme";

export interface PointStatutReservation {
  statut: string;
  nombre: number;
  couleur: string;
}

// Anneau des réservations par statut, total au centre, légende à droite
// (sous l'anneau sur petit écran). Couleurs fournies par la page, issues de
// lib/chart-theme.ts.
export function ReservationsParStatutChart({ donnees }: { donnees: PointStatutReservation[] }) {
  const total = donnees.reduce((s, d) => s + d.nombre, 0);
  if (total === 0) {
    return <p className="flex h-56 items-center justify-center text-sm text-text-faint">Aucune réservation pour l&apos;instant.</p>;
  }

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="relative h-52 w-52 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={donnees.filter((d) => d.nombre > 0)}
              dataKey="nombre"
              nameKey="statut"
              innerRadius={66}
              outerRadius={96}
              paddingAngle={2}
              strokeWidth={0}
              cornerRadius={4}
            >
              {donnees
                .filter((d) => d.nombre > 0)
                .map((d) => (
                  <Cell key={d.statut} fill={d.couleur} />
                ))}
            </Pie>
            <Tooltip contentStyle={STYLE_INFOBULLE} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-bold text-text tabular-nums">{total}</span>
          <span className="text-xs text-text-faint">réservation{total > 1 ? "s" : ""}</span>
        </div>
      </div>
      <ul className="flex w-full flex-col gap-2.5">
        {donnees.map((d) => (
          <li key={d.statut} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-text-muted">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.couleur }} />
              {d.statut}
            </span>
            <span className="font-semibold text-text tabular-nums">{d.nombre}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
