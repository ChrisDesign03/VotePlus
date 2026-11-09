"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { UUID_RE } from "@/lib/contest-rules";
import { PAYOUT_METHODS } from "@/lib/payments";
import { createAdminClient } from "@/lib/supabase/admin";

export type PayoutState = { error?: string; message?: string; nonce?: number } | null;

const text = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

// Réservé à l'administrateur : enregistre un reversement fait à un organisateur.
export async function recordPayoutAction(_prev: PayoutState, fd: FormData): Promise<PayoutState> {
  const { isAdmin } = await getSessionUser();
  if (!isAdmin) return { error: "Action réservée à l'administration." };

  const contestId = text(fd, "contest_id");
  const method = text(fd, "method");
  const amount = Number(text(fd, "amount").replace(",", "."));
  if (!UUID_RE.test(contestId)) return { error: "Concours introuvable." };
  if (!PAYOUT_METHODS.some((m) => m.id === method)) return { error: "Choisissez le mode de reversement utilisé." };
  if (!Number.isFinite(amount) || amount <= 0) return { error: "Indiquez un montant supérieur à zéro." };

  const { error } = await createAdminClient().rpc("record_payout", {
    p_contest: contestId,
    p_amount: Math.round(amount * 100) / 100,
    p_method: method,
    p_reference: text(fd, "reference").slice(0, 80),
    p_note: text(fd, "note").slice(0, 300),
  });
  if (error) {
    console.error("[VotePlus] reversement :", error.code, error.message);
    if (error.message?.includes("over_due")) return { error: "Ce montant dépasse ce qui reste dû à l'organisateur." };
    return { error: "Le reversement n'a pas pu être enregistré. Réessayez." };
  }
  revalidatePath("/admin");
  return { message: "Reversement enregistré.", nonce: Date.now() };
}
