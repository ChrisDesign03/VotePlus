import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { safeNext } from "@/lib/safe-next";
import { TERMS_VERSION } from "@/lib/legal";

// Page appelée quand la personne clique sur le lien de confirmation reçu par e-mail.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const nextRaw = searchParams.get("next");
      const next = nextRaw ? safeNext(nextRaw) : null;
      // Connexion Google : on garde la preuve de l'acceptation des conditions (case cochée avant)
      if (searchParams.get("terms") === TERMS_VERSION) {
        try {
          const { data: who } = await supabase.auth.getUser();
          if (who.user) {
            await createAdminClient()
              .from("profiles")
              .update({ terms_version: TERMS_VERSION, terms_accepted_at: new Date().toISOString() })
              .eq("id", who.user.id)
              .is("terms_version", null);
          }
        } catch (e) {
          console.error("[VotePlus] consentement :", e);
        }
      }
      if (next) return NextResponse.redirect(`${origin}${next}`);
      // Sans page de retour : organisateur -> tableau de bord, votant -> accueil
      const { data: u } = await supabase.auth.getUser();
      const { data: p } = u.user ? await supabase.from("profiles").select("role").eq("id", u.user.id).maybeSingle() : { data: null };
      return NextResponse.redirect(`${origin}${p?.role === "voter" ? "/" : "/tableau-de-bord"}`);
    }
  }

  return NextResponse.redirect(`${origin}/connexion?erreur=lien`);
}
