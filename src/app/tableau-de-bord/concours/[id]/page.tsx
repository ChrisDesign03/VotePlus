import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { ContestManageView } from "@/components/contest-manage-view";
import { getSessionUser } from "@/lib/auth";
import { UUID_RE, getReadiness } from "@/lib/contest-rules";
import type { AuditRow } from "@/lib/audit";
import { parseStats } from "@/lib/stats";
import type { Candidate, Contest, VotePack } from "@/lib/types";

export const metadata: Metadata = { title: "Gérer le concours" };

export default function ConcoursPage({ params }: PageProps<"/tableau-de-bord/concours/[id]">) {
  return (
    <Suspense fallback={<div className="p-8 text-encre-2">Chargement du concours…</div>}>
      <Concours params={params} />
    </Suspense>
  );
}

async function Concours({ params }: { params: PageProps<"/tableau-de-bord/concours/[id]">["params"] }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const { supabase, user, name, isAdmin } = await getSessionUser();

  // On ne charge que si le concours appartient bien à cette personne
  const { data: contest } = await supabase
    .from("contests")
    .select("id, slug, title, description, rules, currency, status, starts_at, ends_at, show_live_ranking, vote_mode, free_vote_period, created_at")
    .eq("id", id)
    .eq("organizer_id", user.id)
    .maybeSingle();
  if (!contest) notFound();

  const [candidatesRes, packsRes, paymentsRes, auditRes, statsRes] = await Promise.all([
    supabase.from("candidates").select("id, number, name, bio, photo_url, is_active").eq("contest_id", id).order("number"),
    supabase.from("vote_packs").select("id, label, votes, price, is_active").eq("contest_id", id).order("price"),
    supabase.from("payments").select("id", { count: "exact", head: true }).eq("contest_id", id),
    supabase
      .from("audit_log")
      .select("id, table_name, action, old_data, new_data, created_at")
      .eq("contest_id", id)
      .order("created_at", { ascending: false })
      .limit(30),
    contest.status === "draft" ? Promise.resolve({ data: null }) : supabase.rpc("contest_stats", { p_contest: id }),
  ]);

  const candidates = (candidatesRes.data ?? []) as Candidate[];
  const packs = (packsRes.data ?? []) as VotePack[];
  const readiness = getReadiness(candidates.filter((c) => c.is_active !== false).length, packs.filter((p) => p.is_active).length, contest.ends_at, contest.vote_mode);

  return (
    <AppShell name={name} isAdmin={isAdmin} back={{ href: "/tableau-de-bord", label: "Mes concours" }}>
      <ContestManageView
        contest={contest as Contest}
        candidates={candidates}
        packs={packs}
        userId={user.id}
        readiness={readiness}
        hasPayments={(paymentsRes.count ?? 0) > 0}
        audit={(auditRes.data ?? []) as AuditRow[]}
        stats={parseStats(statsRes.data)}
      />
    </AppShell>
  );
}
