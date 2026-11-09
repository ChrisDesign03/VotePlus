import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Retourne la personne connectée (ou la renvoie vers /connexion).
// `cache` évite de la redemander plusieurs fois pendant la même page.
export const getSessionUser = cache(async () => {
  // Vérifier une session dépend de chaque requête (et la bibliothèque Supabase lit l'heure) :
  // on le dit à Next.js, qui n'essaie alors pas de préparer cette partie à l'avance.
  // C'est ce qui faisait apparaître des « Issues » en développement.
  await connection();
  const supabase = await createClient();

  // getUser() vérifie la session auprès de Supabase : plus sûr que de simplement lire le cookie
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  // Un votant n'a pas d'espace organisateur
  if (profile?.role === "voter") redirect("/");

  const name =
    profile?.full_name ?? (user.user_metadata?.full_name as string | undefined) ?? "Organisateur";

  return { supabase, user, name, isAdmin: profile?.role === "admin" };
});
