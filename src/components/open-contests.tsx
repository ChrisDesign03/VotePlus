import Link from "next/link";
import { getOpenContests } from "@/lib/public-data";
import { LocalDate } from "./local-date";
import { Container } from "./ui";

// Les concours ouverts au vote, sur la page d'accueil. Rien ne s'affiche s'il n'y en a pas.
export async function OpenContests() {
  const contests = await getOpenContests();
  if (contests.length === 0) return null;

  return (
    <section id="concours" className="scroll-mt-6 bg-papier py-16 sm:py-20">
      <Container>
        <h2 className="max-w-2xl text-balance font-display text-3xl font-semibold tracking-tight text-nuit sm:text-4xl">
          Concours ouverts au vote
        </h2>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {contests.map((c) => (
            <li key={c.id}>
              <Link
                href={`/concours/${c.slug}`}
                className="group flex h-full flex-col rounded-xl border border-trait bg-white p-6 transition-colors hover:border-prune"
              >
                <h3 className="line-clamp-2 font-display text-2xl font-semibold leading-snug text-nuit">{c.title}</h3>
                {c.description ? <p className="mt-2 line-clamp-2 text-encre-2">{c.description}</p> : null}
                <dl className="mt-5 space-y-1 text-sm text-encre-2">
                  <div className="flex gap-2">
                    <dt className="sr-only">Candidates</dt>
                    <dd>{c.candidateCount} candidate{c.candidateCount > 1 ? "s" : ""}</dd>
                  </div>
                  {c.ends_at ? (
                    <div className="flex gap-2">
                      <dt>Fin du vote :</dt>
                      <dd>
                        <LocalDate iso={c.ends_at} />
                      </dd>
                    </div>
                  ) : null}
                </dl>
                <span className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-prune px-5 text-sm font-semibold text-white transition-colors group-hover:bg-prune-fonce sm:self-start">
                  Voir et voter
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
