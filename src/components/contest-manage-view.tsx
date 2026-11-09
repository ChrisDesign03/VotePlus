import Link from "next/link";
import {
  deleteCandidateAction,
  deleteContestAction,
  deletePackAction,
  setCandidateActiveAction,
  setPackActiveAction,
  updateContestAction,
} from "@/app/actions/contests";
import { CandidateForm } from "./candidate-form";
import { ContestForm } from "./contest-form";
import { CheckIcon } from "./icons";
import { LocalDate } from "./local-date";
import { PackForm } from "./pack-form";
import { ContestStatsView } from "./contest-stats";
import { RowAction } from "./row-action";
import { StatusPanel } from "./status-panel";
import { StatusBadge } from "./ui";
import { MAX_CANDIDATES, MAX_PACKS, MIN_CANDIDATES, formatMoney, type Readiness } from "@/lib/contest-rules";
import { describeAudit, type AuditRow } from "@/lib/audit";
import type { ContestStats } from "@/lib/stats";
import type { Candidate, Contest, VotePack } from "@/lib/types";

function Section({
  id,
  title,
  intro,
  children,
}: {
  id: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-titre`} className="scroll-mt-6 border-t border-trait pt-10">
      <h2 id={`${id}-titre`} className="font-display text-2xl font-semibold text-nuit sm:text-3xl">
        {title}
      </h2>
      {intro ? <p className="mt-2 max-w-2xl text-encre-2">{intro}</p> : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Check({ done, children }: { done: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span
        aria-hidden="true"
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
          done ? "bg-succes text-white" : "border-2 border-trait bg-white"
        }`}
      >
        {done ? <CheckIcon className="h-4 w-4" /> : null}
      </span>
      <span className={done ? "text-encre-2" : "font-medium text-nuit"}>
        <span className="sr-only">{done ? "Fait : " : "À faire : "}</span>
        {children}
      </span>
    </li>
  );
}

export function ContestManageView({
  contest,
  candidates,
  packs,
  userId,
  readiness,
  hasPayments,
  audit,
  stats,
}: {
  contest: Contest;
  candidates: Candidate[];
  packs: VotePack[];
  userId: string;
  readiness: Readiness;
  hasPayments: boolean;
  audit: AuditRow[];
  stats: ContestStats | null;
}) {
  const isDraft = contest.status === "draft";
  const isClosed = contest.status === "closed";
  const canEdit = !isClosed; // brouillon ou publié
  const nextNumber = Math.min(999, (candidates.reduce((m, c) => Math.max(m, c.number), 0) || 0) + 1);

  return (
    <div className="space-y-12">
      {/* ─── En-tête et publication ───────────────────────────────── */}
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={contest.status} />
          <p className="text-sm text-encre-2">
            Fin : <LocalDate iso={contest.ends_at} fallback="non définie" />
          </p>
        </div>
        <h1 className="mt-3 max-w-3xl text-balance font-display text-3xl font-semibold tracking-tight text-nuit sm:text-5xl">
          {contest.title}
        </h1>
        <p className="mt-3 break-all text-sm text-encre-2">
          Adresse publique : <span className="font-semibold text-nuit">/concours/{contest.slug}</span>
        </p>
        {!isDraft ? (
          <Link
            href={`/concours/${contest.slug}`}
            className="mt-3 inline-flex min-h-11 items-center rounded-lg border border-trait bg-white px-4 text-sm font-semibold text-prune hover:border-prune"
          >
            Voir la page publique
          </Link>
        ) : null}

        <div className="mt-8 grid gap-6 rounded-xl border border-trait bg-white p-5 sm:p-7 lg:grid-cols-[1.2fr_1fr] lg:gap-10">
          <div>
            {isDraft ? (
              <>
                <h2 className="font-display text-xl font-semibold text-nuit">Avant de publier</h2>
                <ul className="mt-4 space-y-3">
                  <Check done={readiness.candidates}>
                    Au moins {MIN_CANDIDATES} candidates ({candidates.length} ajoutée{candidates.length > 1 ? "s" : ""})
                  </Check>
                  {contest.vote_mode !== "free" ? (
                    <Check done={readiness.packs}>Au moins un pack de votes ({packs.length} ajouté{packs.length > 1 ? "s" : ""})</Check>
                  ) : null}
                  <Check done={readiness.dates}>
                    {contest.ends_at && !readiness.dates ? "La date de fin est déjà passée" : "Une date de fin à venir (ou aucune)"}
                  </Check>
                </ul>
              </>
            ) : isClosed ? (
              <>
                <h2 className="font-display text-xl font-semibold text-nuit">Concours clôturé</h2>
                <p className="mt-2 text-encre-2">Les votes sont fermés. Ce concours ne peut plus être modifié.</p>
              </>
            ) : (
              <>
                <h2 className="font-display text-xl font-semibold text-nuit">Concours publié</h2>
                <p className="mt-2 text-encre-2">
                  Vous pouvez ajouter et modifier des candidates et des packs. Pour rester équitable, on ne supprime
                  plus : on retire du vote, et chaque changement est écrit dans le journal en bas de page.
                </p>
              </>
            )}
          </div>
          <div className="lg:self-center">
            <StatusPanel
              contestId={contest.id}
              status={contest.status}
              canPublish={readiness.ready}
              hasPayments={hasPayments}
            />
          </div>
        </div>
      </header>

      {/* ─── Statistiques et recettes ─────────────────────────────── */}
      {!isDraft && stats ? (
        <Section id="stats" title="Statistiques et recettes">
          <ContestStatsView stats={stats} contestId={contest.id} />
        </Section>
      ) : null}

      {/* ─── Candidates ───────────────────────────────────────────── */}
      <Section
        id="candidates"
        title={`Candidates (${candidates.length})`}
        intro={
          isDraft
            ? `Ajoutez de ${MIN_CANDIDATES} à ${MAX_CANDIDATES} candidates. Chacune reçoit un numéro, que le public utilisera pour la retrouver.`
            : canEdit
              ? "Vous pouvez ajouter une candidate, modifier sa fiche ou la retirer du vote. Une candidate retirée disparaît de la page publique mais son historique est conservé."
              : undefined
        }
      >
        {candidates.length === 0 ? (
          <p className="rounded-xl border border-dashed border-trait bg-white px-5 py-8 text-center text-encre-2">
            Aucune candidate pour l&apos;instant.{isDraft ? " Utilisez le formulaire ci-dessous pour ajouter la première." : ""}
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {candidates.map((c) => {
              const inactive = c.is_active === false;
              return (
                <li key={c.id} className={`rounded-xl border border-trait bg-white p-4 ${inactive ? "opacity-70" : ""}`}>
                  <div className="flex gap-4">
                    <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-lg bg-prune-50">
                      {c.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.photo_url} alt={`Photo de ${c.name}`} loading="lazy" width={96} height={112} className="h-full w-full object-cover" />
                      ) : (
                        <span aria-hidden="true" className="flex h-full w-full items-center justify-center font-display text-3xl font-semibold text-prune/40">
                          {c.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <span className="absolute left-1.5 top-1.5 flex h-8 min-w-8 items-center justify-center rounded-full bg-or px-1.5 font-display text-base font-semibold tabular-nums text-nuit shadow">
                        <span className="sr-only">Numéro </span>
                        {c.number}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-nuit">{c.name}</p>
                      {inactive ? (
                        <p className="mt-1 inline-flex rounded-full bg-prune-50 px-2.5 py-0.5 text-xs font-semibold text-encre-2">
                          Retirée du vote
                        </p>
                      ) : null}
                      {c.bio ? <p className="mt-1 line-clamp-3 text-sm text-encre-2">{c.bio}</p> : null}
                    </div>
                  </div>

                  {canEdit ? (
                    <div className="mt-3 flex flex-wrap items-center gap-x-5 border-t border-trait pt-1">
                      <details className="group w-full">
                        <summary className="inline-flex min-h-11 cursor-pointer list-none items-center text-sm font-semibold text-prune hover:underline">
                          Modifier
                        </summary>
                        <div className="mb-3 mt-2">
                          <CandidateForm contestId={contest.id} userId={userId} candidate={c} lockNumber={!isDraft} />
                        </div>
                      </details>
                      {isDraft ? (
                        <form action={deleteCandidateAction}>
                          <input type="hidden" name="contest_id" value={contest.id} />
                          <input type="hidden" name="candidate_id" value={c.id} />
                          <button type="submit" aria-label={`Supprimer ${c.name}`} className="min-h-11 text-sm font-semibold text-erreur hover:underline">
                            Supprimer
                          </button>
                        </form>
                      ) : (
                        <RowAction
                          action={setCandidateActiveAction}
                          fields={{ contest_id: contest.id, candidate_id: c.id, active: inactive ? "true" : "false" }}
                          label={inactive ? "Rétablir" : "Retirer du vote"}
                          ariaLabel={`${inactive ? "Rétablir" : "Retirer du vote"} ${c.name}`}
                          tone={inactive ? "neutral" : "danger"}
                          confirm={inactive ? undefined : `Retirer ${c.name} du vote ? Elle disparaîtra de la page publique. Vous pourrez la rétablir.`}
                        />
                      )}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}

        {canEdit && candidates.length < MAX_CANDIDATES ? (
          <div className="mt-8 max-w-2xl rounded-xl border border-trait bg-white p-5 sm:p-7">
            <h3 className="font-display text-xl font-semibold text-nuit">Ajouter une candidate</h3>
            {!isDraft ? (
              <p className="mt-1 text-sm text-encre-2">Le concours est publié : elle apparaîtra aussitôt sur la page publique.</p>
            ) : null}
            <div className="mt-5">
              <CandidateForm contestId={contest.id} userId={userId} nextNumber={nextNumber} />
            </div>
          </div>
        ) : null}
      </Section>

      {/* ─── Packs de votes (inutiles pour un concours 100 % gratuit) ── */}
      {contest.vote_mode === "free" ? null : (
      <Section
        id="packs"
        title={`Packs de votes (${packs.length})`}
        intro={
          isDraft
            ? "Le public achète un pack pour voter. Proposez plusieurs tailles : un petit pack pour essayer, un grand pour soutenir à fond."
            : canEdit
              ? "Vous pouvez ajouter un pack, modifier son prix ou le retirer de la vente. Un changement de prix compte pour les prochains paiements seulement."
              : undefined
        }
      >
        {packs.length === 0 ? (
          <p className="rounded-xl border border-dashed border-trait bg-white px-5 py-8 text-center text-encre-2">
            Aucun pack pour l&apos;instant.{isDraft ? " Ajoutez-en un ci-dessous." : ""}
          </p>
        ) : (
          <ul className="divide-y divide-trait overflow-hidden rounded-xl border border-trait bg-white">
            {packs.map((p) => {
              const perVote = Number(p.price) / p.votes;
              const inactive = p.is_active === false;
              return (
                <li key={p.id} className={`px-5 py-4 sm:px-6 ${inactive ? "opacity-70" : ""}`}>
                  <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-nuit">
                        {p.label}
                        {inactive ? (
                          <span className="ml-2 inline-flex rounded-full bg-prune-50 px-2.5 py-0.5 text-xs font-semibold text-encre-2">
                            Retiré de la vente
                          </span>
                        ) : null}
                      </p>
                      <p className="text-sm text-encre-2">
                        {new Intl.NumberFormat("fr-FR").format(p.votes)} vote{p.votes > 1 ? "s" : ""} ·{" "}
                        {new Intl.NumberFormat("fr-FR", {
                          minimumFractionDigits: contest.currency === "USD" ? 2 : 0,
                          maximumFractionDigits: contest.currency === "USD" ? 2 : 0,
                        }).format(perVote)}{" "}
                        {contest.currency} le vote
                      </p>
                    </div>
                    <p className="font-display text-2xl font-semibold tabular-nums text-nuit">{formatMoney(p.price, contest.currency)}</p>
                  </div>

                  {canEdit ? (
                    <div className="mt-1 flex flex-wrap items-center gap-x-5">
                      <details className="w-full">
                        <summary className="inline-flex min-h-11 cursor-pointer list-none items-center text-sm font-semibold text-prune hover:underline">
                          Modifier
                        </summary>
                        <div className="mb-3 mt-2 max-w-xl">
                          <PackForm contestId={contest.id} currency={contest.currency} pack={p} />
                        </div>
                      </details>
                      {isDraft ? (
                        <form action={deletePackAction}>
                          <input type="hidden" name="contest_id" value={contest.id} />
                          <input type="hidden" name="pack_id" value={p.id} />
                          <button type="submit" aria-label={`Supprimer le pack ${p.label}`} className="min-h-11 text-sm font-semibold text-erreur hover:underline">
                            Supprimer
                          </button>
                        </form>
                      ) : (
                        <RowAction
                          action={setPackActiveAction}
                          fields={{ contest_id: contest.id, pack_id: p.id, active: inactive ? "true" : "false" }}
                          label={inactive ? "Remettre en vente" : "Retirer de la vente"}
                          ariaLabel={`${inactive ? "Remettre en vente" : "Retirer de la vente"} le pack ${p.label}`}
                          tone={inactive ? "neutral" : "danger"}
                        />
                      )}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}

        {canEdit && packs.length < MAX_PACKS ? (
          <div className="mt-8 max-w-2xl rounded-xl border border-trait bg-white p-5 sm:p-7">
            <h3 className="font-display text-xl font-semibold text-nuit">Ajouter un pack</h3>
            <div className="mt-5">
              <PackForm contestId={contest.id} currency={contest.currency} />
            </div>
          </div>
        ) : null}
      </Section>
      )}

      {/* ─── Informations ─────────────────────────────────────────── */}
      {!isClosed ? (
        <Section id="infos" title="Informations du concours">
          <div className="max-w-2xl rounded-xl border border-trait bg-white p-5 sm:p-7">
            <ContestForm action={updateContestAction} contest={contest} submitLabel="Enregistrer les modifications" />
          </div>
        </Section>
      ) : null}

      {/* ─── Journal ──────────────────────────────────────────────── */}
      {!isDraft ? (
        <Section
          id="journal"
          title="Journal des modifications"
          intro="Chaque changement fait après la publication est enregistré automatiquement. Personne ne peut l'effacer."
        >
          {audit.length === 0 ? (
            <p className="rounded-xl border border-dashed border-trait bg-white px-5 py-6 text-encre-2">Aucune modification pour l&apos;instant.</p>
          ) : (
            <ol className="divide-y divide-trait overflow-hidden rounded-xl border border-trait bg-white">
              {audit.map((r) => (
                <li key={r.id} className="flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:items-baseline sm:gap-5">
                  <span className="shrink-0 text-sm tabular-nums text-encre-2 sm:w-52">
                    <LocalDate iso={r.created_at} />
                  </span>
                  <span className="text-nuit">{describeAudit(r, contest.currency)}</span>
                </li>
              ))}
            </ol>
          )}
        </Section>
      ) : null}

      {/* ─── Suppression ──────────────────────────────────────────── */}
      {isDraft ? (
        <section className="border-t border-trait pt-10">
          <details className="group max-w-2xl">
            <summary className="inline-flex min-h-11 cursor-pointer list-none items-center text-sm font-semibold text-erreur hover:underline">
              Supprimer ce concours
            </summary>
            <div className="mt-3 rounded-xl border border-erreur/30 bg-erreur-50 p-5">
              <p className="text-sm text-nuit">
                Le brouillon, ses candidates et ses packs seront supprimés définitivement. Cette action est irréversible.
              </p>
              <form action={deleteContestAction} className="mt-4">
                <input type="hidden" name="contest_id" value={contest.id} />
                <button
                  type="submit"
                  className="inline-flex min-h-11 items-center rounded-lg bg-erreur px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                >
                  Supprimer définitivement
                </button>
              </form>
            </div>
          </details>
        </section>
      ) : null}
    </div>
  );
}
