// Statistiques d'un concours, telles que renvoyées par la base (fonction contest_stats).
export type ContestStats = {
  currency: "USD" | "CDF";
  fee_pct: number;
  gross: number;
  fee: number;
  net: number;
  paid_out: number;
  to_pay: number;
  payments_succeeded: number;
  payments_pending: number;
  payments_failed: number;
  votes_total: number;
  vote_mode: "paid" | "free" | "both";
  paid_votes: number;
  free_votes: number;
  free_suspect: number;
  free_voided: number;
  by_candidate: { candidate_id: string; number: number; name: string; is_active: boolean; votes: number; free_votes: number; revenue: number }[];
  by_day: { day: string; payments: number; votes: number; revenue: number }[];
  by_pack: { pack_id: string; label: string; sold: number; revenue: number }[];
};

const n = (v: unknown) => Number(v ?? 0) || 0;

export function parseStats(raw: unknown): ContestStats | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  return {
    currency: r.currency === "CDF" ? "CDF" : "USD",
    fee_pct: n(r.fee_pct),
    gross: n(r.gross),
    fee: n(r.fee),
    net: n(r.net),
    paid_out: n(r.paid_out),
    to_pay: n(r.to_pay),
    payments_succeeded: n(r.payments_succeeded),
    payments_pending: n(r.payments_pending),
    payments_failed: n(r.payments_failed),
    votes_total: n(r.votes_total),
    vote_mode: r.vote_mode === "free" || r.vote_mode === "both" ? r.vote_mode : "paid",
    paid_votes: n(r.paid_votes),
    free_votes: n(r.free_votes),
    free_suspect: n(r.free_suspect),
    free_voided: n(r.free_voided),
    by_candidate: (r.by_candidate ?? []).map((c: Record<string, unknown>) => ({
      candidate_id: String(c.candidate_id), number: n(c.number), name: String(c.name), is_active: c.is_active !== false,
      votes: n(c.votes), free_votes: n(c.free_votes), revenue: n(c.revenue),
    })),
    by_day: (r.by_day ?? []).map((d: Record<string, unknown>) => ({ day: String(d.day), payments: n(d.payments), votes: n(d.votes), revenue: n(d.revenue) })),
    by_pack: (r.by_pack ?? []).map((k: Record<string, unknown>) => ({ pack_id: String(k.pack_id), label: String(k.label), sold: n(k.sold), revenue: n(k.revenue) })),
  };
}
