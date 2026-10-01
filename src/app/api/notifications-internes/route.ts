import { NextResponse } from "next/server";
import { apiFetchJson, ApiError } from "@/lib/api-server";
import type { NotificationInterne } from "@/lib/types";

// Route handler same-origine (localhost:3002) : sert de relais pour le
// polling client, qui ne peut pas appeler l'API NestJS directement (le cookie
// access_token est scopé à l'origine Next.js — voir api-server.ts).
export async function GET() {
  try {
    const [notifications, { nombre }] = await Promise.all([
      apiFetchJson<NotificationInterne[]>("/notifications-internes"),
      apiFetchJson<{ nombre: number }>("/notifications-internes/non-lues/nombre"),
    ]);
    return NextResponse.json({ notifications, nombreNonLues: nombre });
  } catch (erreur) {
    if (erreur instanceof ApiError) {
      return NextResponse.json({ notifications: [], nombreNonLues: 0 }, { status: erreur.status });
    }
    throw erreur;
  }
}
