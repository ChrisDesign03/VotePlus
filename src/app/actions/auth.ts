"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TERMS_VERSION } from "@/lib/legal";
import { getClientIp } from "@/lib/client-ip";
import { verifyTurnstile } from "@/lib/turnstile";

export type FormState = {
  error?: string;
  message?: string;
  values?: { fullName?: string; email?: string };
} | null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function getOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

function translateError(error: { code?: string; message: string }): string {
  switch (error.code) {
    case "invalid_credentials":
      return "E-mail ou mot de passe incorrect.";
    case "email_not_confirmed":
      return "Adresse e-mail non confirmée. Ouvrez le message que nous vous avons envoyé et cliquez sur le lien.";
    case "user_already_exists":
    case "email_exists":
      return "Cette adresse e-mail est déjà utilisée. Connectez-vous plutôt.";
    case "weak_password":
      return "Mot de passe trop faible. Utilisez au moins 8 caractères, avec des lettres et des chiffres.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Trop de tentatives. Patientez quelques minutes avant de réessayer.";
    case "signup_disabled":
      return "Les inscriptions sont momentanément fermées.";
    default:
      return "Une erreur est survenue. Vérifiez votre connexion internet et réessayez.";
  }
}

export async function signUpAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const values = { fullName, email };

  if (fullName.length < 2) return { error: "Indiquez votre nom complet.", values };
  if (!EMAIL_RE.test(email)) return { error: "Adresse e-mail invalide.", values };
  if (password.length < 8)
    return { error: "Le mot de passe doit contenir au moins 8 caractères.", values };
  if (String(formData.get("accept_terms") ?? "") !== "yes")
    return { error: "Cochez la case pour accepter les conditions et le contrat organisateur.", values };
  if (!(await verifyTurnstile(String(formData.get("cf-turnstile-response") ?? ""), await getClientIp())))
    return { error: "Vérification anti-robots échouée. Réessayez.", values };

  const supabase = await createClient();
  const origin = await getOrigin();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, account_type: "organizer", terms_version: TERMS_VERSION },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) return { error: translateError(error), values };

  // Supabase renvoie un utilisateur sans identité quand l'e-mail existe déjà
  if (data.user && data.user.identities?.length === 0) {
    return { error: "Cette adresse e-mail est déjà utilisée. Connectez-vous plutôt.", values };
  }

  // Si la confirmation par e-mail est désactivée, la personne est déjà connectée
  if (data.session) redirect("/tableau-de-bord");

  return {
    message:
      "Compte créé ! Un e-mail de confirmation vient de vous être envoyé. Cliquez sur le lien qu'il contient, puis connectez-vous.",
    values: { email },
  };
}

export async function signInAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const values = { email };

  if (!EMAIL_RE.test(email)) return { error: "Adresse e-mail invalide.", values };
  if (!password) return { error: "Saisissez votre mot de passe.", values };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: translateError(error), values };

  redirect("/tableau-de-bord");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/connexion");
}

// Mot de passe oublié : envoie un lien qui ramène vers la page de nouveau mot de passe
export async function forgotPasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { error: "Adresse e-mail invalide.", values: { email } };
  if (!(await verifyTurnstile(String(formData.get("cf-turnstile-response") ?? ""), await getClientIp())))
    return { error: "Vérification anti-robots échouée. Réessayez.", values: { email } };

  const supabase = await createClient();
  const origin = await getOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/nouveau-mot-de-passe")}`,
  });
  if (error && (error.code === "over_request_rate_limit" || error.code === "over_email_send_rate_limit")) {
    return { error: "Trop de demandes. Patientez quelques minutes avant de réessayer.", values: { email } };
  }
  // Même message que l'adresse existe ou non : on ne révèle pas qui a un compte
  return { message: "Si un compte existe avec cette adresse, un lien vient de lui être envoyé. Pensez à regarder vos courriers indésirables.", values: { email } };
}

export async function resetPasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { error: "Le mot de passe doit contenir au moins 8 caractères." };
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { error: "Ce lien a expiré. Demandez-en un nouveau." };
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: translateError(error) };
  redirect("/tableau-de-bord");
}
