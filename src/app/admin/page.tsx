import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { LocalDate } from "@/components/local-date";
import { PayoutForm } from "@/components/payout-form";
import { StatusBadge } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";
import { formatMoney } from "@/lib/contest-rules";
import { formatPhone, payoutMethodLabel } from "@/lib/payments";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Currency } from "@/lib/types";
import { nf } from "@/lib/voting";

export const metadata: Metadata = { title: "Administration", robots: { index: false, follow: false } };

type Row = {
  contest_id: string; title: string; slug: string; status: string; currency: Currency; fee_pct: number;
  organizer_name: string | null; organizer_phone: string | null; payout_method: string | null; payout_account: string | null;
  votes: number; payments: number; gross: number; fee: number; net: number; paid_out: number; to_pay: number;
};
type Payout = { id: string; contest_id: string; amount: number; currency: Currency; method: string; reference: string | null; created_at: string };

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="p-8 text-encre-2">Chargement…</div>}>
      <Admin />
    </Suspense>
  );
}

async function Admin() {
  const { name, isAdmin } = await getSessionUser();
  if (!isAdmin) notFound(); // les non-administrateurs ne savent même pas que la page existe

  const sb = createAdminClient();
  const [{ data: totals, error }, { data: payouts }] = await Promise.all([
    sb.rpc("admin_contest_totals"),
    sb.from("payouts").select("id, contest_id, amount, currency, method, reference, created_at").order("created_at", { ascending: false }).limit(20),
  ]);
  if (error) console.error("[VotePlus] admin :", error.code, error.message);

  const rows = ((totals ?? []) as Row[]).map((r) => ({ ...r, gross: +r.gross, fee: +r.fee, net: +r.net, paid_out: +r.paid_out, to_pay: +r.to_pay, votes: +r.votes, payments: +r.payments }));
  const titleOf = new Map(rows.map((r) => [r.contest_id, r.title]));

  const sum = (cur: Currency, k: "gross" | "fee" | "to_pay" | "paid_out") => rows.filter((r) => r.currency === cur).reduce((a, r) => a + r[k], 0);
  const currencies = (["USD", "CDF"] as Currency[]).filter((c) => rows.some((r) => r.currency === c));

  return (
    <AppShell name={name} isAdmin back={{ href: "/tableau-de-bord", label: "Mes concours" }}>
      <h1 className="text-balance font-display text-3xl font-semibold tracking-tight text-nuit sm:text-5xl">Administration</h1>
      <p className="mt-2 max-w-2xl text-lg text-encre-2">Toutes les recettes, vos commissions et ce qu&apos;il reste à reverser aux organisateurs.</p>
      {error ? <p role="alert" className="mt-6 rounded-lg border-l-4 border-erreur bg-erreur-50 px-4 py-3 text-sm font-medium text-erreur">Les chiffres n&apos;ont pas pu être chargés. Avez-vous exécuté schema-6-finances.sql et ajouté la clé secrète ?</p> : null}

      {currencies.map((cur) => (
        <dl key={cur} className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { l: `Recettes brutes (${cur})`, v: sum(cur, "gross") },
            { l: "Vos commissions", v: sum(cur, "fee"), strong: true },
            { l: "Dû aux organisateurs", v: sum(cur, "to_pay") },
            { l: "Déjà reversé", v: sum(cur, "paid_out") },
          ].map((f) => (
            <div key={f.l} className={`rounded-xl border p-4 sm:p-5 ${f.strong ? "border-prune bg-prune-50" : "border-trait bg-white"}`}>
              <dt className="text-sm text-encre-2">{f.l}</dt>
              <dd className="mt-1 font-display text-2xl font-semibold tabular-nums text-nuit sm:text-3xl">{formatMoney(f.v, cur)}</dd>
            </div>
          ))}
        </dl>
      ))}

      <h2 className="mt-12 font-display text-2xl font-semibold text-nuit sm:text-3xl">Concours</h2>
      {rows.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-trait bg-white px-5 py-8 text-center text-encre-2">Aucun concours publié pour l&apos;instant.</p>
      ) : (
        <ul className="mt-5 space-y-5">
          {rows.map((r) => {
            const money = (v: number) => formatMoney(v, r.currency);
            return (
              <li key={r.contest_id} className="rounded-xl border border-trait bg-white p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-display text-xl font-semibold text-nuit">{r.title}</h3>
                    <p className="text-sm text-encre-2">
                      {r.organizer_name ?? "Organisateur"}
                      {r.organizer_phone ? ` · ${formatPhone(r.organizer_phone)}` : ""}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-5">
                  {[
                    ["Votes", nf.format(r.votes)],
                    ["Recettes", money(r.gross)],
                    [`Commission (${nf.format(r.fee_pct)} %)`, money(r.fee)],
                    ["Net organisateur", money(r.net)],
                    ["Reste à reverser", money(r.to_pay)],
                  ].map(([l, v]) => (
                    <div key={l}>
                      <dt className="text-encre-2">{l}</dt>
                      <dd className="font-semibold tabular-nums text-nuit">{v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 rounded-lg bg-papier px-4 py-3 text-sm">
                  <span className="text-encre-2">Reverser sur : </span>
                  <span className="font-semibold text-nuit">
                    {r.payout_method ? `${payoutMethodLabel(r.payout_method)} · ${r.payout_method === "bank" ? r.payout_account : formatPhone(r.payout_account)}` : "non renseigné par l'organisateur"}
                  </span>
                </p>
                {r.to_pay > 0 ? (
                  <details className="mt-4">
                    <summary className="inline-flex min-h-11 cursor-pointer list-none items-center text-sm font-semibold text-prune hover:underline">Enregistrer un reversement</summary>
                    <div className="mt-3 max-w-3xl">
                      <PayoutForm contestId={r.contest_id} due={r.to_pay} method={r.payout_method} />
                    </div>
                  </details>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <h2 className="mt-12 font-display text-2xl font-semibold text-nuit sm:text-3xl">Derniers reversements</h2>
      {(payouts ?? []).length === 0 ? (
        <p className="mt-4 text-encre-2">Aucun reversement enregistré.</p>
      ) : (
        <ol className="mt-5 divide-y divide-trait overflow-hidden rounded-xl border border-trait bg-white">
          {((payouts ?? []) as Payout[]).map((p) => (
            <li key={p.id} className="flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:items-baseline sm:gap-5">
              <span className="shrink-0 text-sm tabular-nums text-encre-2 sm:w-52"><LocalDate iso={p.created_at} /></span>
              <span className="text-nuit">
                <span className="font-semibold tabular-nums">{formatMoney(+p.amount, p.currency)}</span> · {payoutMethodLabel(p.method)} · {titleOf.get(p.contest_id) ?? "Concours"}
                {p.reference ? <span className="text-encre-2"> · réf. {p.reference}</span> : null}
              </span>
            </li>
          ))}
        </ol>
      )}
    </AppShell>
  );
}
