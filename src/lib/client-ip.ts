import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";

// Adresse de connexion de la personne (telle que transmise par l'hébergeur).
export async function getClientIp(): Promise<string | undefined> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return fwd || h.get("x-real-ip") || undefined;
}

// On ne stocke JAMAIS l'adresse elle-même : seulement une empreinte salée, illisible.
export function hashIp(ip: string | undefined): string | null {
  if (!ip) return null;
  const salt = process.env.VOTE_HASH_SALT || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "voteplus";
  return createHash("sha256").update(`${salt}|${ip}`).digest("hex").slice(0, 32);
}
