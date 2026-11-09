import type { Metadata } from "next";
import { Suspense } from "react";
import { createContestAction } from "@/app/actions/contests";
import { AppShell } from "@/components/app-shell";
import { ContestForm } from "@/components/contest-form";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Créer un concours" };

export default function NouveauConcoursPage() {
  return (
    <Suspense fallback={<div className="p-8 text-encre-2">Chargement…</div>}>
      <NouveauConcours />
    </Suspense>
  );
}

async function NouveauConcours() {
  const { name, isAdmin } = await getSessionUser();
  return (
    <AppShell name={name} isAdmin={isAdmin} back={{ href: "/tableau-de-bord", label: "Mes concours" }}>
      <h1 className="text-balance font-display text-3xl font-semibold tracking-tight text-nuit sm:text-5xl">
        Créer un concours
      </h1>
      <p className="mt-2 max-w-xl text-lg text-encre-2">
        Commencez par les informations générales. Vous ajouterez les candidates et les packs de votes juste après.
      </p>

      <div className="mt-8 max-w-2xl rounded-xl border border-trait bg-white p-5 sm:p-8">
        <ContestForm action={createContestAction} submitLabel="Créer le concours" />
      </div>
    </AppShell>
  );
}
