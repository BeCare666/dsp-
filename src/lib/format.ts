const formateurFcfa = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

export function formaterFcfa(montant: number): string {
  return `${formateurFcfa.format(montant)} FCFA`;
}

const formateurDate = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });

export function formaterDate(iso: string): string {
  return formateurDate.format(new Date(iso));
}

const formateurDateHeure = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formaterDateHeure(iso: string): string {
  return formateurDateHeure.format(new Date(iso));
}

const formateurDateCourte = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });

export function formaterDateCourte(iso: string): string {
  return formateurDateCourte.format(new Date(iso));
}

const formateurRelatif = new Intl.RelativeTimeFormat("fr-FR", { numeric: "auto" });

// « il y a 5 min », « hier »… À n'utiliser que dans des composants serveur
// (le résultat dépend de l'heure de rendu).
export function formaterIlYa(iso: string, maintenant: Date = new Date()): string {
  const secondes = Math.round((new Date(iso).getTime() - maintenant.getTime()) / 1000);
  const abs = Math.abs(secondes);
  if (abs < 60) return formateurRelatif.format(secondes, "second");
  if (abs < 3600) return formateurRelatif.format(Math.round(secondes / 60), "minute");
  if (abs < 86400) return formateurRelatif.format(Math.round(secondes / 3600), "hour");
  if (abs < 86400 * 30) return formateurRelatif.format(Math.round(secondes / 86400), "day");
  return formaterDate(iso);
}
