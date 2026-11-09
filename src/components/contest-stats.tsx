import { voidSuspectVotesAction } from "@/app/actions/free-vote";
import { formatMoney, usesFree, usesPaid } from "@/lib/contest-rules";
import type { ContestStats } from "@/lib/stats";
import { nf } from "@/lib/voting";
import { buttonClass } from "./ui";

const dayFormat = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" });

function Figure({ label, value, hint, strong = false }: { label: string; value: string; hint?: string; strong?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 sm:p-5 ${strong ? "border-prune bg-prune-50" : "border-trait bg-white"}`}>
      <dt className="text-sm text-encre-2">{label}</dt>
      <dd className="mt-1 font-display text-2xl font-semibold tabular-nums text-nuit sm:text-3xl">{value}</dd>
      {hint ? <dd className="mt-0.5 text-xs text-encre-2">{hint}</dd> : null}
    </div>
  );
}

// Chiffres et graphiques d'un concours publié. Rendu côté serveur, sans bibliothèque de graphiques.
export function ContestStatsView({ stats, contestId }: { stats: ContestStats; contestId: string }) {
  const money = (v: number) => formatMoney(v, stats.currency);
  const maxVotes = Math.max(1, ...stats.by_candidate.map((c) => c.votes));
  const days = stats.by_day.slice(-14); // la base renvoie les jours du plus ancien au plus récent : on garde les 14 derniers
  const maxDay = Math.max(1, ...days.map((d) => d.revenue));

  const paid = usesPaid(stats.vote_mode);
  const free = usesFree(stats.vote_mode);

  return (
    <div className="space-y-8">
      {free ? (
        <section aria-labelledby="stats-free" className="rounded-xl border border-trait bg-white p-5 sm:p-6">
          <h3 id="stats-free" className="font-display text-xl font-semibold text-nuit">Votes gratuits</h3>
          <dl className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Figure label="Votes gratuits valides" value={nf.format(stats.free_votes)} />
            <Figure label="Votes suspects" value={nf.format(stats.free_suspect)} hint="Trop de votes depuis une même connexion" />
            <Figure label="Votes annulés" value={nf.format(stats.free_voided)} />
            {paid ? <Figure label="Votes payants" value={nf.format(stats.paid_votes)} /> : null}
          </dl>
          {stats.free_suspect > 0 ? (
            <form action={voidSuspectVotesAction} className="mt-4">
              <input type="hidden" name="contest_id" value={contestId} />
              <input type="hidden" name="void" value="true" />
              <button type="submit" className="min-h-11 rounded-lg border border-erreur px-4 text-sm font-semibold text-erreur hover:bg-erreur/5">
                Annuler les {nf.format(stats.free_suspect)} votes suspects
              </button>
              <p className="mt-2 text-sm text-encre-2">Ils ne sont pas supprimés : l&apos;opération est inscrite au journal et peut être rétablie.</p>
            </form>
          ) : null}
          {stats.free_voided > 0 ? (
            <form action={voidSuspectVotesAction} className="mt-3">
              <input type="hidden" name="contest_id" value={contestId} />
              <input type="hidden" name="void" value="false" />
              <button type="submit" className="min-h-11 text-sm font-semibold text-prune hover:underline">
                Rétablir les {nf.format(stats.free_voided)} votes annulés
              </button>
            </form>
          ) : null}
        </section>
      ) : null}

      {paid ? (
        <>
        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Figure label="Votes comptés" value={nf.format(stats.votes_total)} />
          <Figure label="Recettes brutes" value={money(stats.gross)} hint={`${stats.payments_succeeded} paiement${stats.payments_succeeded > 1 ? "s" : ""} confirmé${stats.payments_succeeded > 1 ? "s" : ""}`} />
          <Figure label={`Commission VotePlus (${nf.format(stats.fee_pct)} %)`} value={money(stats.fee)} />
          <Figure label="Net pour vous" value={money(stats.net)} strong />
        </dl>

        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Figure label="Déjà reversé" value={money(stats.paid_out)} />
          <Figure label="Reste à vous reverser" value={money(Math.max(0, stats.to_pay))} strong={stats.to_pay > 0} />
          <Figure label="Paiements en attente" value={nf.format(stats.payments_pending)} />
          <Figure label="Paiements non aboutis" value={nf.format(stats.payments_failed)} />
        </dl>
        <p className="-mt-3 max-w-3xl text-sm text-encre-2">
          Le net est calculé sur les paiements confirmés. Les reversements sont enregistrés par l&apos;administration de
          VotePlus ; renseignez où les recevoir dans <a className="font-semibold text-prune hover:underline" href="/tableau-de-bord/profil">Mon profil</a>.
        </p>
        </>
      ) : (
        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Figure label="Votes comptés" value={nf.format(stats.votes_total)} />
        </dl>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="stats-candidates" className="rounded-xl border border-trait bg-white p-5 sm:p-6">
          <h3 id="stats-candidates" className="font-display text-xl font-semibold text-nuit">Votes par candidate</h3>
          {stats.by_candidate.length === 0 ? (
            <p className="mt-3 text-encre-2">Aucune candidate.</p>
          ) : (
            <ol className="mt-4 space-y-3">
              {stats.by_candidate.slice(0, 15).map((c) => (
                <li key={c.candidate_id} className={c.is_active ? "" : "opacity-60"}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate font-semibold text-nuit">
                      n°{c.number} {c.name}
                      {c.is_active ? "" : " (retirée)"}
                    </span>
                    <span className="shrink-0 tabular-nums text-encre-2">
                      {nf.format(c.votes)}{paid ? ` · ${money(c.revenue)}` : ""}
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-prune-50" aria-hidden="true">
                    <div className="h-full rounded-full bg-prune" style={{ width: `${Math.round((c.votes / maxVotes) * 100)}%` }} />
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        {paid ? (
        <div className="space-y-6">
          <section aria-labelledby="stats-days" className="rounded-xl border border-trait bg-white p-5 sm:p-6">
            <h3 id="stats-days" className="font-display text-xl font-semibold text-nuit">Recettes par jour</h3>
            {days.length === 0 ? (
              <p className="mt-3 text-encre-2">Pas encore de paiement confirmé.</p>
            ) : (
              <>
                <div className="mt-4 flex h-32 items-end gap-1.5" role="img" aria-label={`Recettes des ${days.length} derniers jours avec activité`}>
                  {days.map((d) => (
                    <div key={d.day} className="flex h-full min-w-0 flex-1 flex-col justify-end" title={`${d.day} : ${money(d.revenue)}`}>
                      <div className="w-full rounded-t bg-or" style={{ height: `${Math.max(4, Math.round((d.revenue / maxDay) * 100))}%` }} />
                    </div>
                  ))}
                </div>
                <div className="mt-1.5 flex justify-between text-xs text-encre-2">
                  <span>{dayFormat.format(new Date(days[0].day))}</span>
                  <span>{dayFormat.format(new Date(days[days.length - 1].day))}</span>
                </div>
              </>
            )}
          </section>

          <section aria-labelledby="stats-packs" className="rounded-xl border border-trait bg-white p-5 sm:p-6">
            <h3 id="stats-packs" className="font-display text-xl font-semibold text-nuit">Packs vendus</h3>
            {stats.by_pack.length === 0 ? (
              <p className="mt-3 text-encre-2">Aucun pack vendu.</p>
            ) : (
              <ul className="mt-3 divide-y divide-trait">
                {stats.by_pack.map((k) => (
                  <li key={k.pack_id} className="flex items-baseline justify-between gap-3 py-2.5 text-sm">
                    <span className="min-w-0 truncate font-semibold text-nuit">{k.label}</span>
                    <span className="shrink-0 tabular-nums text-encre-2">
                      {nf.format(k.sold)} vendu{k.sold > 1 ? "s" : ""} · {money(k.revenue)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        {paid ? (
          <a href={`/tableau-de-bord/concours/${contestId}/export?type=payments`} className={buttonClass({ variant: "outline" })}>
            Exporter les paiements (CSV)
          </a>
        ) : null}
        <a href={`/tableau-de-bord/concours/${contestId}/export?type=results`} className={buttonClass({ variant: "outline" })}>
          Exporter le classement (CSV)
        </a>
      </div>
    </div>
  );
}
