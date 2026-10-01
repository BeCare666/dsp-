import { NextResponse, type NextRequest } from "next/server";

// Vérification optimiste (présence du cookie uniquement, pas de décodage JWT) —
// la maxAge du cookie access_token est alignée sur la durée de vie du token
// (15 min), donc "cookie présent" ⟺ "session probablement valide". Pas de
// rafraîchissement silencieux en V1 : passé ce délai, l'utilisateur est
// redirigé vers /login (voir ROADMAP.md section 10 pour la suite).
const PREFIXES_PROTEGES = [
  "/tableau-de-bord",
  "/auto-evaluation",
  "/news",
  "/evenements-indesirables",
  "/reserver",
  "/mes-reservations",
  "/organisation",
  "/mes-sessions",
  "/profil",
  "/admin",
];
const ROUTES_AUTH = ["/login", "/inscription"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const estConnecte = Boolean(request.cookies.get("access_token")?.value);

  const estProtegee = PREFIXES_PROTEGES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (estProtegee && !estConnecte) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const estRouteAuth = ROUTES_AUTH.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (estRouteAuth && estConnecte) {
    return NextResponse.redirect(new URL("/tableau-de-bord", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico)$).*)"],
};
