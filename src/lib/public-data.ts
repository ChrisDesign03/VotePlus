import { createClient } from "@supabase/supabase-js";
import { cacheLife, cacheTag } from "next/cache";
import { getSupabaseEnv } from "./supabase/env";
import type { Candidate, Contest, VotePack } from "./types";

// Lecture des données PUBLIQUES (visiteurs non connectés).
// Un client « anonyme » sans cookies est utilisé : ainsi les résultats peuvent être
// mis en cache quelques secondes et partagés entre tous les visiteurs, ce qui protège
// la base de données quand des milliers de personnes ouvrent la page en même temps.
function anonClient() {
  const { url, key } = getSupabaseEnv();
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export type PublicContest = Pick<
  Contest,
  "id" | "slug" | "title" | "description" | "rules" | "currency" | "status" | "starts_at" | "ends_at" | "show_live_ranking" | "vote_mode" | "free_vote_period"
>;
export type PublicCandidate = Candidate & { votes: number | null };
export type PublicPack = Pick<VotePack, "id" | "label" | "votes"> & { price: number };

export type ContestBundle =
  | {
      kind: "ok";
      contest: PublicContest;
      candidates: PublicCandidate[];
      packs: PublicPack[];
      /** vrai si les totaux de votes sont visibles (classement en direct, ou concours clôturé) */
      showVotes: boolean;
    }
  | { kind: "missing" }
  | { kind: "error" };

const SLUG_RE = /^[a-z0-9-]{1,80}$/;

// Un concours publié, avec ses candidates, ses packs et ses votes.
// Mis en cache ~1 seconde : le classement paraît « en direct » sans surcharger la base.
export async function getContestBundle(slug: string): Promise<ContestBundle> {
  "use cache";
  cacheLife("seconds");
  cacheTag(`contest-${slug}`);

  if (!SLUG_RE.test(slug)) return { kind: "missing" };
  const sb = anonClient();

  const { data: contest, error } = await sb
    .from("contests")
    .select("id, slug, title, description, rules, currency, status, starts_at, ends_at, show_live_ranking, vote_mode, free_vote_period")
    .eq("slug", slug)
    .in("status", ["open", "closed"])
    .maybeSingle();
  if (error) {
    console.error("[VotePlus] lecture du concours :", error.code, error.message);
    return { kind: "error" };
  }
  if (!contest) return { kind: "missing" };

  const [cands, packs, results] = await Promise.all([
    sb.from("candidates").select("id, number, name, bio, photo_url").eq("contest_id", contest.id).eq("is_active", true).order("number"),
    sb.from("vote_packs").select("id, label, votes, price").eq("contest_id", contest.id).eq("is_active", true).order("price"),
    sb.from("candidate_results").select("candidate_id, total_votes").eq("contest_id", contest.id),
  ]);
  const failure = cands.error ?? packs.error ?? results.error;
  if (failure) {
    console.error("[VotePlus] lecture des candidates :", failure.code, failure.message);
    return { kind: "error" };
  }

  const totals = new Map<string, number | null>(
    (results.data ?? []).map((r) => [r.candidate_id as string, r.total_votes === null ? null : Number(r.total_votes)]),
  );
  const candidates: PublicCandidate[] = (cands.data ?? []).map((c) => ({
    ...(c as Candidate),
    votes: totals.get(c.id as string) ?? null,
  }));
  const showVotes = candidates.length > 0 && candidates.every((c) => c.votes !== null);

  return {
    kind: "ok",
    contest: contest as PublicContest,
    candidates,
    packs: (packs.data ?? []).map((p) => ({ id: p.id, label: p.label, votes: p.votes, price: Number(p.price) })),
    showVotes,
  };
}

export type OpenContestCard = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  ends_at: string | null;
  candidateCount: number;
};

// Les concours ouverts, pour la page d'accueil (cache d'environ une minute).
export async function getOpenContests(): Promise<OpenContestCard[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("contests");

  const { data, error } = await anonClient()
    .from("contests")
    .select("id, slug, title, description, starts_at, ends_at, candidates(count)")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(12);
  if (error) {
    console.error("[VotePlus] liste des concours :", error.code, error.message);
    return [];
  }

  const now = Date.now();
  return (data ?? [])
    .filter((c) => !c.ends_at || new Date(c.ends_at).getTime() > now)
    .map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      description: c.description,
      ends_at: c.ends_at,
      candidateCount: (c.candidates as unknown as { count: number }[])?.[0]?.count ?? 0,
    }));
}
