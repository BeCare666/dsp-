import "server-only";
import { cookies } from "next/headers";

// Durées alignées sur apps/api/.env (JWT_ACCESS_TTL / JWT_REFRESH_TTL) — pas
// partagées automatiquement entre les deux apps, à garder synchronisées à la main.
const ACCESS_TOKEN_MAX_AGE = 15 * 60;
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60;

function extraireValeurCookie(setCookieHeaders: string[], nom: string): string | undefined {
  const ligne = setCookieHeaders.find((c) => c.startsWith(`${nom}=`));
  if (!ligne) return undefined;
  return ligne.split(";")[0]!.slice(nom.length + 1);
}

// L'API NestJS pose ses propres cookies (sur son origine à elle, localhost:3001
// en dev) — on ne les relaie jamais tels quels au navigateur. On extrait juste
// les valeurs des tokens depuis le Set-Cookie de la réponse serveur-à-serveur,
// puis on les pose nous-mêmes sur l'origine Next.js, seule que le navigateur connaît.
export async function synchroniserCookiesSession(reponseApi: Response): Promise<void> {
  const setCookies = reponseApi.headers.getSetCookie();
  const accessToken = extraireValeurCookie(setCookies, "access_token");
  const refreshToken = extraireValeurCookie(setCookies, "refresh_token");

  const store = await cookies();
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };

  if (accessToken) {
    store.set("access_token", accessToken, { ...options, maxAge: ACCESS_TOKEN_MAX_AGE });
  }
  if (refreshToken) {
    store.set("refresh_token", refreshToken, { ...options, maxAge: REFRESH_TOKEN_MAX_AGE });
  }
}

// Utilisé par `connexionAction` pour lire le rôle avant même que le cookie ne
// soit reposé sur l'origine Next.js (évite un aller-retour cookies() en plus).
export function extraireAccessTokenDepuisReponse(reponseApi: Response): string | undefined {
  return extraireValeurCookie(reponseApi.headers.getSetCookie(), "access_token");
}

export async function effacerCookiesSession(): Promise<void> {
  const store = await cookies();
  store.delete("access_token");
  store.delete("refresh_token");
}
