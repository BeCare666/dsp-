import { NextResponse, type NextRequest } from "next/server";
import { apiFetch } from "@/lib/api-server";

// §6.4 — relais de téléchargement du rapport PDF (même raison que l'export
// CSV des EI : le cookie de session est scopé à l'origine Next.js). L'API
// vérifie l'appartenance de la session à l'établissement.
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await apiFetch(`/sessions-evaluation/${id}/rapport.pdf`);
  if (!res.ok) {
    return NextResponse.json({ message: "Rapport indisponible." }, { status: res.status });
  }
  return new NextResponse(res.body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": res.headers.get("content-disposition") ?? "attachment; filename=rapport.pdf",
    },
  });
}
