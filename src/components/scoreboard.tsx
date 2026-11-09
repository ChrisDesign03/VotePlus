// Exemple de classement affiché sur l'accueil.
// Les noms sont fictifs : il s'agit d'une démonstration, pas de vrais résultats.
const SAMPLE = [
  { number: 7, name: "Amandine K.", votes: 12480 },
  { number: 12, name: "Grâce M.", votes: 10915 },
  { number: 3, name: "Naomie T.", votes: 9302 },
  { number: 21, name: "Prisca L.", votes: 6870 },
  { number: 15, name: "Dorcas B.", votes: 4216 },
];

const MAX = SAMPLE[0].votes;
const nf = new Intl.NumberFormat("fr-FR");

export function Scoreboard() {
  return (
    <figure className="w-full rounded-2xl border border-white/10 bg-nuit-2 p-5 shadow-2xl shadow-black/30 sm:p-7">
      <figcaption className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
        <div className="min-w-0">
          <p className="font-display text-xl font-semibold text-white">Classement en direct</p>
          <p className="text-sm text-lavande">Miss Étoile (exemple)</p>
        </div>
        <span className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-white/5 px-3 py-1.5 text-xs font-semibold text-or">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-or opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-or" />
          </span>
          En direct
        </span>
      </figcaption>

      <ol className="mt-2 divide-y divide-white/10">
        {SAMPLE.map((c, i) => {
          const pct = Math.round((c.votes / MAX) * 100);
          return (
            <li key={c.number} className="flex items-center gap-4 py-4">
              {/* Le numéro de l'écharpe : signe visuel de la plateforme */}
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-display text-xl font-semibold tabular-nums ${
                  i === 0 ? "bg-or text-nuit" : "bg-white/10 text-white"
                }`}
                aria-label={`Candidate numéro ${c.number}`}
              >
                {c.number}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate font-semibold text-white">{c.name}</span>
                  <span className="shrink-0 text-sm tabular-nums text-lavande">
                    {nf.format(c.votes)} votes
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
                  <div
                    className={`h-full origin-left animate-barre rounded-full ${i === 0 ? "bg-or" : "bg-lavande/70"}`}
                    style={{ width: `${pct}%`, animationDelay: `${300 + i * 140}ms` }}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </figure>
  );
}
