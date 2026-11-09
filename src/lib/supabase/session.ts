import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./env";

// Pages réservées aux organisateurs connectés
const PROTECTED_PREFIXES = ["/tableau-de-bord", "/admin"];
// Pages inutiles quand on est déjà connecté
const GUEST_ONLY = ["/connexion", "/inscription"];

function matches(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

// Rafraîchit la session de l'utilisateur à chaque requête et applique les redirections.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, key } = getSupabaseEnv();

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  let loggedIn = false;
  try {
    const { data } = await supabase.auth.getClaims();
    loggedIn = Boolean(data?.claims);
  } catch {
    // Supabase injoignable (réseau coupé) : on traite la personne comme déconnectée.
    loggedIn = false;
  }

  const { pathname } = request.nextUrl;
  let target: string | null = null;

  if (!loggedIn && matches(pathname, PROTECTED_PREFIXES)) target = "/connexion";
  if (loggedIn && matches(pathname, GUEST_ONLY)) target = "/tableau-de-bord";

  if (target) {
    const redirectResponse = NextResponse.redirect(new URL(target, request.url));
    // On conserve les cookies de session éventuellement renouvelés
    response.cookies.getAll().forEach((c) => redirectResponse.cookies.set(c));
    return redirectResponse;
  }

  return response;
}
