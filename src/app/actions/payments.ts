"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { UUID_RE } from "@/lib/contest-rules";
import { getPaymentMode, isOperator, normalizePhone } from "@/lib/payments";
import { createAdminClient } from "@/lib/supabase/admin";
import { getClientIp } from "@/lib/client-ip";
import { TERMS_VERSION } from "@/lib/legal";
import { verifyTurnstile } from "@/lib/turnstile";

export type PayState = { error?: string; values?: Record<string, string> } | null;

const text = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

// Traduit les messages de la base (en code court) en phrases claires
const DB_MESSAGES: Record<string, string> = {
  vote_closed: "Le vote n'est pas ouvert pour ce concours en ce moment.",
  candidate_invalid: "Cette candidate n'est plus disponible. Rechargez la page.",
  pack_invalid: "Ce pack n'est plus disponible. Rechargez la page et choisissez-en un autre.",
  bad_phone: "Numéro invalide. Exemple : 081 234 5678.",
  bad_provider: "Choisissez un opérateur Mobile Money.",
  too_many_attempts: "Trop de demandes pour ce numéro. Patientez quelques minutes avant de réessayer.",
};

export async function startPaymentAction(_prev: PayState, fd: FormData): Promise<PayState> {
  const values = { provider: text(fd, "provider"), phone: text(fd, "phone"), pack_id: text(fd, "pack_id") };
  const contestId = text(fd, "contest_id");
  const candidateId = text(fd, "candidate_id");

  if (!UUID_RE.test(contestId) || !UUID_RE.test(candidateId) || !UUID_RE.test(values.pack_id)) {
    return { error: "Choisissez un pack de votes.", values };
  }
  if (!isOperator(values.provider)) return { error: "Choisissez votre opérateur Mobile Money.", values };
  const phone = normalizePhone(values.phone);
  if (!phone) return { error: "Numéro invalide. Exemple : 081 234 5678.", values };

  if (text(fd, "accept_terms") !== "yes") return { error: "Cochez la case pour accepter les conditions.", values };
  if (!(await verifyTurnstile(text(fd, "cf-turnstile-response"), await getClientIp()))) {
    return { error: "Vérification anti-robots échouée. Cochez la case « Je ne suis pas un robot » puis réessayez.", values };
  }

  const mode = getPaymentMode();
  if (mode !== "simulation") {
    return { error: "Les paiements ne sont pas encore ouverts sur cette plateforme.", values };
  }

  let paymentId: string;
  try {
    const sb = createAdminClient();
    const { data, error } = await sb.rpc("create_pending_payment", {
      p_contest: contestId,
      p_candidate: candidateId,
      p_pack: values.pack_id,
      p_provider: values.provider,
      p_phone: phone,
      p_provider_ref: `SIM-${randomUUID()}`,
      p_terms_version: TERMS_VERSION,
    });
    if (error) {
      console.error("[VotePlus] création du paiement :", error.code, error.message);
      const known = Object.keys(DB_MESSAGES).find((k) => error.message?.includes(k));
      if (known) return { error: DB_MESSAGES[known], values };
      const detail = process.env.NODE_ENV !== "production" && error.message ? ` : ${error.message}` : "";
      return { error: `Le paiement n'a pas pu être lancé (code technique ${error.code ?? "?"}${detail}).`, values };
    }
    paymentId = (data as { payment_id: string }).payment_id;
  } catch (e) {
    console.error("[VotePlus] paiement :", e);
    const detail = process.env.NODE_ENV !== "production" && e instanceof Error ? ` ${e.message}` : "";
    return { error: `Le paiement n'a pas pu être lancé. Réessayez dans un instant.${detail}`, values };
  }
  redirect(`/paiement/${paymentId}`);
}

// Bouton de test : joue le rôle de l'opérateur (valide ou refuse). Désactivé hors simulation.
export async function simulatePaymentAction(fd: FormData): Promise<void> {
  const id = text(fd, "payment_id");
  const outcome = text(fd, "outcome");
  if (getPaymentMode() !== "simulation" || !UUID_RE.test(id)) redirect("/");

  const sb = createAdminClient();
  const { data } = await sb.from("payments").select("provider_ref").eq("id", id).maybeSingle();
  if (data?.provider_ref) {
    const { error } =
      outcome === "success"
        ? await sb.rpc("confirm_payment", { p_provider_ref: data.provider_ref })
        : await sb.rpc("fail_payment", { p_provider_ref: data.provider_ref, p_status: "failed" });
    if (error) console.error("[VotePlus] simulation :", error.code, error.message);
  }
  redirect(`/paiement/${id}`);
}
