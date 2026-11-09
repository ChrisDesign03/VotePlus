import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { ProfileForm } from "@/components/profile-form";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Mon profil" };

export default function ProfilPage() {
  return (
    <Suspense fallback={<div className="p-8 text-encre-2">Chargement…</div>}>
      <Profil />
    </Suspense>
  );
}

async function Profil() {
  const { supabase, user, name, isAdmin } = await getSessionUser();
  const { data } = await supabase
    .from("profiles")
    .select("full_name, phone, payout_method, payout_account")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <AppShell name={name} isAdmin={isAdmin} back={{ href: "/tableau-de-bord", label: "Mes concours" }}>
      <h1 className="text-balance font-display text-3xl font-semibold tracking-tight text-nuit sm:text-5xl">Mon profil</h1>
      <p className="mt-2 max-w-2xl text-lg text-encre-2">
        Ces informations servent à vous joindre et à vous reverser vos recettes. Elles ne sont jamais visibles du public.
      </p>
      <div className="mt-8 max-w-2xl rounded-xl border border-trait bg-white p-5 sm:p-7">
        <ProfileForm
          profile={{
            full_name: data?.full_name ?? name,
            phone: data?.phone ?? null,
            payout_method: data?.payout_method ?? null,
            payout_account: data?.payout_account ?? null,
          }}
        />
      </div>
    </AppShell>
  );
}
