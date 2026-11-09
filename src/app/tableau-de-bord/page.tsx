import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardView } from "@/components/dashboard-view";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Tableau de bord" };

export default function TableauDeBordPage() {
  // La lecture de la session se fait derrière un Suspense (règle de Next.js 16)
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-encre-2">Chargement de votre espace…</p>
        </div>
      }
    >
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  const { supabase, user, name, isAdmin } = await getSessionUser();

  const [{ data: contests, error }, { data: summary }] = await Promise.all([
    supabase
      .from("contests")
      .select("id, title, status, created_at")
      .eq("organizer_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.rpc("my_contests_summary"),
  ]);

  const totals = new Map<string, { votes: number; net: number; currency: "USD" | "CDF" }>(
    ((summary ?? []) as { contest_id: string; votes: number; net: number; currency: "USD" | "CDF" }[]).map((s) => [
      s.contest_id,
      { votes: Number(s.votes), net: Number(s.net), currency: s.currency },
    ]),
  );
  const rows = (contests ?? []).map((c) => ({ ...c, ...(totals.get(c.id) ?? {}) }));

  return <DashboardView name={name} isAdmin={isAdmin} contests={rows} loadError={Boolean(error)} />;
}
