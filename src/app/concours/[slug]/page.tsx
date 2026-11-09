import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { CandidateCard } from "@/components/candidate-card";
import { Leaderboard } from "@/components/leaderboard";
import { LocalDate } from "@/components/local-date";
import { PublicFooter, PublicHeader } from "@/components/public-header";
import { ShareButtons } from "@/components/share-buttons";
import { Container } from "@/components/ui";
import { getContestBundle } from "@/lib/public-data";
import { voteModeLabel } from "@/lib/contest-rules";
import { getVotingState, rankByVotes } from "@/lib/voting";

export async function generateMetadata({ params }: PageProps<"/concours/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const b = await getContestBundle(slug);
  if (b.kind !== "ok") return { title: "Concours introuvable" };
  return {
    title: b.contest.title,
    description: b.contest.description ?? `Votez pour votre candidate préférée : ${b.contest.title}.`,
    openGraph: { title: b.contest.title, description: b.contest.description ?? undefined, type: "website" },
  };
}

export default function ContestPage({ params }: PageProps<"/concours/[slug]">) {
  return (
    <div className="flex min-h-screen flex-col bg-papier">
      <PublicHeader />
      <main id="contenu" className="flex-1">
        <Suspense fallback={<ContestSkeleton />}>
          <ContestContent params={params} />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  );
}

async function ContestContent({ params }: { params: PageProps<"/concours/[slug]">["params"] }) {
  await connection();
  const { slug } = await params;
  const b = await getContestBundle(slug);
  if (b.kind === "missing") notFound();
  if (b.kind === "error") {
    return (
      <Container className="py-20">
        <p className="rounded-xl border border-trait bg-white p-6 text-encre-2">
          Le concours ne peut pas être affiché pour le moment. Réessayez dans quelques instants.
        </p>
      </Container>
    );
  }

  const { contest, candidates, showVotes } = b;
  const state = getVotingState(contest);
  const canVote = state === "open";
  const ranked = showVotes ? rankByVotes(candidates) : [];

  return (
    <>
      <section className="bg-nuit pb-12 pt-4 text-white sm:pb-16">
        <Container>
          <p
            className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
              state === "open" ? "bg-or text-nuit" : "bg-white/10 text-lavande"
            }`}
          >
            {state === "open" ? "Vote ouvert" : state === "upcoming" ? "Bientôt ouvert" : "Vote terminé"}
          </p>
          <h1 className="mt-4 max-w-3xl text-balance font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {contest.title}
          </h1>
          {contest.description ? <p className="mt-4 max-w-2xl text-lg text-lavande">{contest.description}</p> : null}
          {state !== "ended" ? (
            <p className="mt-4 inline-flex rounded-lg bg-white/10 px-3 py-1.5 text-sm font-semibold text-or-clair">
              {voteModeLabel(contest.vote_mode, contest.free_vote_period)}
            </p>
          ) : null}
          <p className="mt-5 text-lavande">
            {state === "upcoming" && contest.starts_at ? (
              <>
                Ouverture du vote : <LocalDate iso={contest.starts_at} />
              </>
            ) : state === "open" && contest.ends_at ? (
              <>
                Fin du vote : <LocalDate iso={contest.ends_at} />
              </>
            ) : state === "ended" ? (
              "Les votes sont clos. Merci à toutes les personnes qui ont participé."
            ) : null}
          </p>
        </Container>
      </section>

      <Container className="space-y-10 py-10 sm:py-14">
        {ranked.length > 0 ? (
          <Leaderboard slug={slug} ranked={ranked} final={state === "ended"} />
        ) : state !== "ended" ? (
          <p className="rounded-xl border border-trait bg-white p-5 text-encre-2">
            Le classement est masqué jusqu&apos;à la clôture du vote.
          </p>
        ) : null}

        <section aria-labelledby="candidates">
          <h2 id="candidates" className="font-display text-2xl font-semibold text-nuit sm:text-3xl">
            Les candidates
          </h2>
          {candidates.length === 0 ? (
            <p className="mt-4 text-encre-2">Les candidates seront bientôt présentées.</p>
          ) : (
            <ul className="mt-6 grid grid-cols-2 gap-3.5 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {candidates.map((c) => (
                <CandidateCard key={c.id} slug={slug} candidate={c} canVote={canVote} showVotes={showVotes} />
              ))}
            </ul>
          )}
        </section>

        {contest.rules ? (
          <details className="rounded-xl border border-trait bg-white p-5">
            <summary className="cursor-pointer font-semibold text-nuit">Règlement du concours</summary>
            <p className="mt-3 whitespace-pre-line text-encre-2">{contest.rules}</p>
          </details>
        ) : null}

        <section aria-labelledby="partage">
          <h2 id="partage" className="mb-3 font-semibold text-nuit">
            Faites connaître ce concours
          </h2>
          <ShareButtons title={contest.title} text={`Votez sur VotePlus : ${contest.title}`} />
        </section>
      </Container>
    </>
  );
}

function ContestSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="h-56 animate-pulse bg-nuit sm:h-64" />
      <Container className="grid grid-cols-2 gap-4 py-10 md:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-prune-50" />
        ))}
      </Container>
    </div>
  );
}
