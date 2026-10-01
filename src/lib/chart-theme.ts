// Couleurs des graphiques (Recharts) alignées sur les tokens de globals.css.
// Recharts écrit ces valeurs dans des attributs SVG : on garde donc des
// valeurs hexadécimales, mais une seule source ici au lieu de codes en dur
// répétés dans chaque composant de graphique.
export const COULEURS = {
  primary: "#1657cc",
  primaryHover: "#12489e",
  primarySoft: "#eaf1fd",
  accent: "#e8677e",
  success: "#1a8f5e",
  warning: "#b5750f",
  danger: "#c23a3a",
  info: "#2f6fb0",
  navy: "#0a1a38",
  neutre: "#93999f",
  bordure: "#e3e8f0",
  texteMuted: "#5b6472",
} as const;

export const AXE = {
  tick: { fontSize: 12, fill: COULEURS.texteMuted },
  ligne: { stroke: COULEURS.bordure },
} as const;

export const STYLE_INFOBULLE = {
  borderRadius: 12,
  border: `1px solid ${COULEURS.bordure}`,
  boxShadow: "0 4px 8px rgba(16, 24, 43, 0.06), 0 16px 40px -12px rgba(16, 24, 43, 0.18)",
  fontSize: 13,
  fontFamily: "var(--font-body)",
  padding: "8px 12px",
} as const;
