import { createBrowserClient } from "@supabase/ssr";

// Client Supabase pour le navigateur (utilisé pour envoyer les photos).
// Les clés publiques sont lues directement : Next.js les intègre au code du navigateur.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
