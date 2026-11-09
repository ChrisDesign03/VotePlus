import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { PublicFooter, PublicHeader } from "@/components/public-header";
import { ShareButtons } from "@/components/share-buttons";
import { Container } from "@/components/ui";
import { FreeVotePanel, type FreeVoteInfo } from "@/components/free-vote-panel";
import { VotePanel } from "@/components/vote-panel";
import { usesFree, usesPaid } from "@/lib/contest-rules";
import { getOptionalUser } from "@/lib/voter";
import { getContestBundle } from "@/lib/public-data";
import { getVotingState, nf, rankByVotes } from "@/lib/voting";

type Props = PageProps<"/concours/[slug]/[number]">;

function parseNumber(raw: string) {
  return /^\d{1,3}$/.test(raw) ? Number(raw) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, number } = await params;
  const b = await getContestBundle(slug);
  const n = parseNumber(number);
  const c = b.kind === "ok" && n !== null ? b.candidates.find((x) => x.number === n) : undefined;
  if (b.kind !== "ok" || !c) return { title: "Candidate introuvable" };
  const title = `${c.name} n°${c.number} · ${b.contest.title}`;
  return {
    title,
    description: `Soutenez ${c.name} : votez pour elle sur VotePlus.`,
    openGraph: { title, type: "website", images: c.photo_url ? [{ url: c.photo_url }] : undefined },
  };
}

export default function CandidatePage({ params }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-papier">
      <PublicHeader />
      <main id="contenu" className="flex-1">
        <Suspense fallback={<div className="h-screen animate-pulse bg-prune-50/50" aria-hidden="true" />}>
          <CandidateContent params={params} />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  );
}

async function CandidateContent({ params }: { params: Props["params"] }) {
  await connection();
  const { slug, number } = await params;
  const n = parseNumber(number);
  if (n === null) notFound();
  const b = await getContestBundle(slug);
  if (b.kind === "missing") notFound();
  if (b.kind === "error") {
    return (
      <Container className="py-20">
        <p className="rounded-xl border border-trait bg-white p-6 text-encre-2">
          La fiche ne peut pas être affichée pour le moment. Réessayez dans quelques instants.
        </p>
      </Container>
    );
  }
  const c = b.candidates.find((x) => x.number === n);
  if (!c) notFound();

  const state = getVotingState(b.contest);
  const rank = b.showVotes ? rankByVotes(b.candidates).find((x) => x.id === c.id)?.rank : undefined;

  return (
    <Container className="py-8 sm:py-12">
      <Link href={`/concours/${slug}`} className="inline-flex min-h-11 items-center text-sm font-semibold text-prune hover:underline">
        ← {b.contest.title}
      </Link>

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-12">
        <div className="relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded-2xl bg-prune-50 lg:mx-0">
          {c.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.photo_url} alt={`Photo de ${c.name}`} className="h-full w-full object-cover" />
          ) : (
            <span aria-hidden="true" className="flex h-full items-center justify-center font-display text-9xl font-semibold text-prune/30">
              {c.name.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="absolute left-3 top-3 flex h-12 min-w-12 items-center justify-center rounded-full bg-or px-3 font-display text-2xl font-semibold tabular-nums text-nuit shadow-md">
            <span className="sr-only">Numéro </span>
            {c.number}
          </span>
        </div>

        <div>
          <h1 className="text-balance font-display text-4xl font-semibold tracking-tight text-nuit sm:text-5xl">{c.name}</h1>
          {b.showVotes && c.votes !== null ? (
            <p className="mt-3 text-lg text-encre-2">
              <span className="font-semibold tabular-nums text-nuit">{nf.format(c.votes)}</span> vote{c.votes > 1 ? "s" : ""}
              {rank ? <> · rang n°{rank}</> : null}
            </p>
          ) : null}
          {c.bio ? <p className="mt-5 whitespace-pre-line text-lg leading-relaxed text-encre-2">{c.bio}</p> : null}

          {state === "open" ? (
            <div className="mt-8 space-y-6">
              {usesFree(b.contest.vote_mode) ? (
                <section aria-labelledby="vote-gratuit" className="rounded-2xl border border-trait bg-white p-5 sm:p-6">
                  <h2 id="vote-gratuit" className="mb-4 font-display text-xl font-semibold text-nuit">
                    Vote gratuit
                  </h2>
                  <FreeVotePanel
                    contestId={b.contest.id}
                    candidateId={c.id}
                    candidateName={c.name}
                    slug={slug}
                    periodDaily={b.contest.free_vote_period === "daily"}
                    info={await freeVoteInfo(b.contest, slug, n)}
                  />
                </section>
              ) : null}
              {usesPaid(b.contest.vote_mode) ? (
                <section aria-labelledby="vote-payant" className="rounded-2xl border border-trait bg-white p-5 sm:p-6">
                  {usesFree(b.contest.vote_mode) ? (
                    <h2 id="vote-payant" className="mb-4 font-display text-xl font-semibold text-nuit">
                      Soutenir davantage avec des votes payants
                    </h2>
                  ) : null}
                  <VotePanel contestId={b.contest.id} candidateId={c.id} packs={b.packs} currency={b.contest.currency} candidateName={c.name} />
                </section>
              ) : null}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-trait bg-white p-5 sm:p-6">
              <p className="text-encre-2">
                {state === "upcoming" ? "Le vote n'est pas encore ouvert pour ce concours." : "Le vote est terminé pour ce concours."}
              </p>
            </div>
          )}

          <div className="mt-8">
            <h2 className="mb-3 font-semibold text-nuit">Partager la fiche</h2>
            <ShareButtons title={`${c.name} · ${b.contest.title}`} text={`Votez pour ${c.name} (n°${c.number}) : ${b.contest.title}`} />
          </div>
        </div>
      </div>
    </Container>
  );
}

// État du vote gratuit pour la personne qui regarde (connectée ou non)
async function freeVoteInfo(
  contest: { id: string; free_vote_period: string },
  slug: string,
  number: number,
): Promise<FreeVoteInfo> {
  const user = await getOptionalUser();
  if (!user) return { kind: "anonymous", loginHref: `/connexion-votant?next=${encodeURIComponent(`/concours/${slug}/${number}`)}` };

  const { data: own } = await user.supabase.from("contests").select("id").eq("id", contest.id).eq("organizer_id", user.id).maybeSingle();
  if (own) return { kind: "own_contest" };

  const daily = contest.free_vote_period === "daily";
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Kinshasa" });
  const query = user.supabase
    .from("free_votes")
    .select("candidate_id, period_key")
    .eq("contest_id", contest.id)
    .eq("period_key", daily ? today : "all")
    .limit(1);
  const { data: mine } = await query;
  if (mine && mine.length > 0) {
    const { data: cand } = await user.supabase.from("candidates").select("name").eq("id", mine[0].candidate_id).maybeSingle();
    return { kind: "voted", periodDaily: daily, candidateName: cand?.name ?? null };
  }
  return { kind: "ready", voterName: user.name };
}
