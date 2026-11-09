"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { UUID_RE } from "@/lib/contest-rules";
import { getClientIp, hashIp } from "@/lib/client-ip";
import { getOptionalUser } from "@/lib/voter";
import { TERMS_VERSION } from "@/lib/legal";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyTurnstile } from "@/lib/turnstile";
import { safeNext } from "@/lib/safe-next";

export type FreeVoteState = { error?: string; done?: boolean } | null;
export type VoterAuthState = { error?: string; message?: string } | null;

const text = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DB_MESSAGES: Record<string, string> = {
  already_voted: "Vous avez déjà voté pour ce concours (ou pour aujourd'hui).",
  vote_closed: "Le vote n'est pas ouvert pour ce concours en ce moment.",
  free_not_allowed: "Ce concours n'a pas de vote gratuit.",
  own_contest: "Vous ne pouvez pas voter dans votre propre concours.",
  candidate_invalid: "Cette candidate n'est plus disponible. Rechargez la page.",
  terms_required: "Vous devez accepter les conditions pour voter.",
};

export async function castFreeVoteAction(_prev: FreeVoteState, fd: FormData): Promise<FreeVoteState> {
  const contestId = text(fd, "contest_id");
  const candidateId = text(fd, "candidate_id");
  const slug = text(fd, "slug");
  if (!UUID_RE.test(contestId) || !UUID_RE.test(candidateId)) return { error: "Requête invalide." };
  if (text(fd, "accept_terms") !== "yes") return { error: "Cochez la case pour accepter les conditions." };

  // L'identité vient de la session vérifiée par le serveur, jamais du formulaire
  const user = await getOptionalUser();
  if (!user) return { error: "Connectez-vous pour voter." };

  const ip = await getClientIp();
  if (!(await verifyTurnstile(text(fd, "cf-turnstile-response"), ip))) {
    return { error: "Vérification anti-robots échouée. Cochez la case « Je ne suis pas un robot » puis réessayez." };
  }

  try {
    const { error } = await createAdminClient().rpc("cast_free_vote", {
      p_contest: contestId,
      p_candidate: candidateId,
      p_voter: user.id,
      p_ip_hash: hashIp(ip),
      p_terms_version: TERMS_VERSION,
    });
    if (error) {
      const known = Object.keys(DB_MESSAGES).find((k) => error.message?.includes(k));
      if (known) return { error: DB_MESSAGES[known] };
      console.error("[VotePlus] vote gratuit :", error.code, error.message);
      return { error: `Le vote n'a pas pu être enregistré (code ${error.code ?? "?"}). Réessayez.` };
    }
  } catch (e) {
    console.error("[VotePlus] vote gratuit :", e);
    return { error: "Le vote n'a pas pu être enregistré. Vérifiez votre connexion et réessayez." };
  }
  if (/^[a-z0-9-]{1,80}$/.test(slug)) revalidatePath(`/concours/${slug}`);
  return { done: true };
}

async function origin() {
  const h = await headers();
  const o = h.get("origin");
  if (o) return o;
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${host.startsWith("localhost") ? "http" : "https"}://${host}`;
}

// Connexion avec Google (gratuit, un seul clic sur Android)
export async function voterGoogleAction(fd: FormData): Promise<void> {
  const next = safeNext(text(fd, "next"));
  if (text(fd, "accept_terms") !== "yes") redirect(`/connexion-votant?next=${encodeURIComponent(next)}&erreur=conditions`);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(next)}&terms=${TERMS_VERSION}` },
  });
  if (error || !data.url) redirect(`/connexion-votant?next=${encodeURIComponent(next)}&erreur=google`);
  redirect(data.url);
}

// Connexion par lien reçu par e-mail (sans mot de passe)
export async function voterMagicLinkAction(_prev: VoterAuthState, fd: FormData): Promise<VoterAuthState> {
  const next = safeNext(text(fd, "next"));
  const email = text(fd, "email").toLowerCase();
  if (!EMAIL_RE.test(email)) return { error: "Adresse e-mail invalide." };
  if (text(fd, "accept_terms") !== "yes") return { error: "Cochez la case pour accepter les conditions." };
  if (!(await verifyTurnstile(text(fd, "cf-turnstile-response"), await getClientIp()))) {
    return { error: "Vérification anti-robots échouée. Réessayez." };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      data: { account_type: "voter", terms_version: TERMS_VERSION },
      emailRedirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) {
    if (error.code === "over_email_send_rate_limit" || error.code === "over_request_rate_limit") {
      return { error: "Trop de demandes. Patientez quelques minutes avant de réessayer." };
    }
    console.error("[VotePlus] lien de connexion :", error.code, error.message);
    return { error: "Le lien n'a pas pu être envoyé. Vérifiez l'adresse et réessayez." };
  }
  return { message: "Lien envoyé ! Ouvrez votre boîte e-mail (regardez aussi les spams) et cliquez sur le lien pour revenir voter." };
}

// L'organisateur annule (ou rétablit) les votes gratuits jugés suspects
export async function voidSuspectVotesAction(fd: FormData): Promise<void> {
  const user = await getOptionalUser();
  const id = text(fd, "contest_id");
  if (!user || !UUID_RE.test(id)) return;
  await user.supabase.rpc("set_suspect_votes_voided", { p_contest: id, p_void: text(fd, "void") === "true" });
  revalidatePath(`/tableau-de-bord/concours/${id}`);
}
