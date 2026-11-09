"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { normalizePhone } from "@/lib/payments";

export type ProfileState = { error?: string; message?: string; nonce?: number } | null;

const text = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const METHODS = ["mpesa", "airtel", "orange", "bank"];

// Mon profil : identité et compte où recevoir les reversements
export async function updateProfileAction(_prev: ProfileState, fd: FormData): Promise<ProfileState> {
  const { supabase, user } = await getSessionUser();

  const fullName = text(fd, "full_name");
  const phoneRaw = text(fd, "phone");
  const method = text(fd, "payout_method");
  const accountRaw = text(fd, "payout_account");

  if (fullName.length < 2 || fullName.length > 80) return { error: "Indiquez votre nom (2 à 80 caractères)." };

  let phone: string | null = null;
  if (phoneRaw) {
    phone = normalizePhone(phoneRaw);
    if (!phone) return { error: "Numéro de téléphone invalide. Exemple : 081 234 5678." };
  }

  let payoutMethod: string | null = null;
  let payoutAccount: string | null = null;
  if (method) {
    if (!METHODS.includes(method)) return { error: "Choisissez un mode de reversement valide." };
    if (!accountRaw) return { error: "Indiquez le numéro ou le compte où recevoir l'argent." };
    payoutMethod = method;
    if (method === "bank") {
      if (accountRaw.length > 80) return { error: "Les coordonnées bancaires sont trop longues (80 caractères maximum)." };
      payoutAccount = accountRaw;
    } else {
      payoutAccount = normalizePhone(accountRaw);
      if (!payoutAccount) return { error: "Numéro Mobile Money invalide. Exemple : 081 234 5678." };
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone, payout_method: payoutMethod, payout_account: payoutAccount })
    .eq("id", user.id);
  if (error) {
    console.error("[VotePlus] profil :", error.code, error.message);
    return { error: "Le profil n'a pas pu être enregistré. Réessayez dans un instant." };
  }
  revalidatePath("/tableau-de-bord", "layout");
  return { message: "Profil enregistré.", nonce: Date.now() };
}
