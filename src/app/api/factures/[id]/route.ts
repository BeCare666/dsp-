import { NextResponse, type NextRequest } from "next/server";
import { apiFetch } from "@/lib/api-server";

// §11.1 — relais de téléchargement d'une facture PDF ; l'API vérifie que la
// facture appartient bien au compte connecté.
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await apiFetch(`/factures/${id}/pdf`);
  if (!res.ok) {
    return NextResponse.json({ message: "Facture indisponible." }, { status: res.status });
  }
  return new NextResponse(res.body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": res.headers.get("content-disposition") ?? "attachment; filename=facture.pdf",
    },
  });
}
