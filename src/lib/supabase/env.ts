// Lit les deux clés publiques de Supabase depuis le fichier .env.local
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Clés Supabase introuvables. Vérifiez que le fichier .env.local existe à la racine du projet " +
        "et contient NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, " +
        "puis relancez le site (Ctrl + C, puis npm run dev).",
    );
  }

  return { url, key };
}
