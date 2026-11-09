import Link from "next/link";
import { nf } from "@/lib/voting";
import type { PublicCandidate } from "@/lib/public-data";

type Ranked = PublicCandidate & { rank: number };

// Classement : les 10 premières. Les barres se remplissent une seule fois, à l'ouverture.
export function Leaderboard({
  slug,
  ranked,
  final,
}: {
  slug: string;
  ranked: Ranked[];
  final: boolean;
}) {
  const top = ranked.slice(0, 10);
  const max = Math.max(1, ...top.map((c) => c.votes ?? 0));

  return (
    <section aria-labelledby="classement" className="rounded-xl border border-trait bg-white p-5 sm:p-6">
      <h2 id="classement" className="font-display text-2xl font-semibold text-nuit">
        {final ? "Résultats finaux" : "Classement en direct"}
      </h2>
      <ol className="mt-4 divide-y divide-trait">
        {top.map((c) => {
          const pct = Math.round(((c.votes ?? 0) / max) * 100);
          const first = c.rank === 1;
          return (
            <li key={c.id}>
              <Link href={`/concours/${slug}/${c.number}`} className="flex items-center gap-3 py-3.5 hover:opacity-90">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-lg font-semibold tabular-nums ${
                    first ? "bg-or text-nuit" : "bg-prune-50 text-prune"
                  }`}
                >
                  <span className="sr-only">Rang </span>
                  {c.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate font-semibold text-nuit">
                      {c.name} <span className="font-normal text-encre-2">n°{c.number}</span>
                    </span>
                    <span className="shrink-0 text-sm tabular-nums text-encre-2">{nf.format(c.votes ?? 0)}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-prune-50" aria-hidden="true">
                    <div
                      className={`h-full origin-left animate-barre rounded-full ${first ? "bg-or" : "bg-prune/60"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
      {ranked.length > 10 ? (
        <p className="mt-3 text-sm text-encre-2">Les 10 premières sur {ranked.length} candidates.</p>
      ) : null}
    </section>
  );
}
