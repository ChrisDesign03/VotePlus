import Link from "next/link";
import { nf } from "@/lib/voting";
import type { PublicCandidate } from "@/lib/public-data";

// Carte d'une candidate : toute la carte est un lien vers sa fiche.
export function CandidateCard({
  slug,
  candidate,
  canVote,
  showVotes,
}: {
  slug: string;
  candidate: PublicCandidate;
  canVote: boolean;
  showVotes: boolean;
}) {
  const c = candidate;
  return (
    <li>
      <Link
        href={`/concours/${slug}/${c.number}`}
        className="group block overflow-hidden rounded-xl border border-trait bg-white transition-colors hover:border-prune"
      >
        <div className="relative aspect-[3/4] bg-prune-50">
          {c.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={c.photo_url}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <span aria-hidden="true" className="flex h-full w-full items-center justify-center font-display text-7xl font-semibold text-prune/30">
              {c.name.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="absolute left-2.5 top-2.5 flex h-10 min-w-10 items-center justify-center rounded-full bg-or px-2 font-display text-xl font-semibold tabular-nums text-nuit shadow-md">
            <span className="sr-only">Numéro </span>
            {c.number}
          </span>
        </div>
        <div className="p-3.5 sm:p-4">
          <p className="truncate font-semibold text-nuit">{c.name}</p>
          <p className="mt-0.5 h-5 text-sm tabular-nums text-encre-2">
            {showVotes && c.votes !== null ? `${nf.format(c.votes)} vote${c.votes > 1 ? "s" : ""}` : " "}
          </p>
          <span className="mt-3 flex min-h-11 items-center justify-center rounded-lg bg-prune px-3 text-sm font-semibold text-white transition-colors group-hover:bg-prune-fonce">
            {canVote ? "Voter" : "Voir la fiche"}
          </span>
        </div>
      </Link>
    </li>
  );
}
