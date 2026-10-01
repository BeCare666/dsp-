import { NextResponse, type NextRequest } from "next/server";
import { apiFetch } from "@/lib/api-server";

// D11 — relais serveur-à-serveur (même raison que pour le polling des
// notifications : le cookie de session est scopé à l'origine Next.js, le
// navigateur ne peut pas appeler l'API NestJS directement). Ne fait que
// transmettre debut/fin et relayer le flux CSV tel quel — aucune donnée
// supplémentaire n'est chargée ou transformée ici.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  // Un champ de date laissé vide dans le formulaire n'est pas transmis.
  const filtres = new URLSearchParams();
  for (const cle of ["debut", "fin"]) {
    const v = searchParams.get(cle);
    if (v) filtres.set(cle, v);
  }
  const qs = filtres.toString();
  const res = await apiFetch(`/evenements-indesirables/export.csv${qs ? `?${qs}` : ""}`);

  if (!res.ok) {
    return NextResponse.json({ message: "Export impossible." }, { status: res.status });
  }

  return new NextResponse(res.body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": res.headers.get("content-disposition") ?? "attachment; filename=export.csv",
    },
  });
}
