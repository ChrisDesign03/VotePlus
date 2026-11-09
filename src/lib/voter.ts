import { cache } from "react";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Personne éventuellement connectée (organisateur ou votant). Ne redirige jamais.
export const getOptionalUser = cache(async () => {
  await connection();
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;
    const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", data.user.id).maybeSingle();
    return {
      supabase,
      id: data.user.id,
      email: data.user.email ?? null,
      name: profile?.full_name ?? "Votant",
      role: (profile?.role as string | undefined) ?? "voter",
    };
  } catch {
    return null;
  }
});
