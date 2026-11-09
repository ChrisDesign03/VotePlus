import "server-only";
import { createClient } from "@supabase/supabase-js";

// Client « administrateur » : réservé au SERVEUR (jamais envoyé au navigateur).
// Il sert uniquement à créer et confirmer les paiements.
// La clé secrète se met dans .env.local sous le nom SUPABASE_SECRET_KEY.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Clé secrète Supabase introuvable. Ajoutez SUPABASE_SECRET_KEY dans le fichier .env.local, puis relancez le site.",
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
