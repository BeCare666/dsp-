import "server-only";
import { cookies } from "next/headers";

// URL serveur-à-serveur vers l'API NestJS (jamais exposée au navigateur).
export const API_URL = process.env.API_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(`Erreur API (${status})`);
  }
}

// Helper pour Server Components / Server Actions : transmet le cookie
// access_token de la requête entrante à l'API. Ne gère jamais les cookies de
// réponse (login/register/refresh/logout font ça eux-mêmes, voir auth-actions.ts).
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const store = await cookies();
  const forwarded = ["access_token", "refresh_token"]
    .map((name) => {
      const value = store.get(name)?.value;
      return value ? `${name}=${value}` : null;
    })
    .filter(Boolean)
    .join("; ");

  const headers = new Headers(init.headers);
  if (forwarded) headers.set("Cookie", forwarded);
  // FormData (upload multipart) doit garder son propre Content-Type avec la
  // boundary générée par fetch — ne jamais le forcer en JSON dans ce cas.
  if (init.body && !headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${API_URL}${path}`, { ...init, headers, cache: "no-store" });
}

// Variante qui parse le JSON et jette une ApiError sur un statut non-2xx —
// pratique pour la majorité des lectures dans les Server Components.
export async function apiFetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiFetch(path, init);
  const contentType = res.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    throw new ApiError(res.status, body);
  }
  return body as T;
}

// Lecture tolérante pour les Server Components : une erreur API (403 module
// non souscrit, 404, 5xx de l'API…) renvoie la valeur de repli au lieu de
// faire échouer toute la page ; toute autre erreur (réseau, bug) remonte.
// Remplace les copies locales identiques qui existaient dans chaque page.
export async function silencieux<T>(promesse: Promise<T>, repli: T): Promise<T> {
  try {
    return await promesse;
  } catch (erreur) {
    if (erreur instanceof ApiError) return repli;
    throw erreur;
  }
}
