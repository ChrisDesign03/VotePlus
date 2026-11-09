import { NextResponse, type NextRequest } from "next/server";
import { UUID_RE } from "@/lib/contest-rules";
import { createClient } from "@/lib/supabase/server";

// Export CSV réservé au propriétaire du concours. Séparateur « ; » et BOM : s'ouvre directement dans Excel en français.
const PAGE = 1000;
const MAX_ROWS = 50_000;

// Une cellule qui commence par = + - @ serait interprétée comme une formule par Excel : on la neutralise.
function cell(v: unknown): string {
  let s = v === null || v === undefined ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
const line = (cells: unknown[]) => cells.map(cell).join(";");
const dec = (v: unknown) => String(Number(v ?? 0)).replace(".", ",");
const when = (iso: string | null) =>
  iso ? new Intl.DateTimeFormat("sv-SE", { dateStyle: "short", timeStyle: "medium", timeZone: "Africa/Kinshasa" }).format(new Date(iso)) : "";
const mask = (p: string | null) => (p && p.length >= 12 ? `+243 ${p.slice(3, 5)} *** *${p.slice(-3)}` : "");

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const type = request.nextUrl.searchParams.get("type");
  if (!UUID_RE.test(id) || (type !== "payments" && type !== "results")) {
    return new NextResponse("Demande invalide.", { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/connexion", request.url));

  const { data: contest } = await supabase
    .from("contests")
    .select("id, slug, title")
    .eq("id", id)
    .eq("organizer_id", user.id)
    .maybeSingle();
  if (!contest) return new NextResponse("Concours introuvable.", { status: 404 });

  const [{ data: cands }, { data: packs }] = await Promise.all([
    supabase.from("candidates").select("id, number, name, is_active").eq("contest_id", id),
    supabase.from("vote_packs").select("id, label").eq("contest_id", id),
  ]);
  const candById = new Map((cands ?? []).map((c) => [c.id as string, c]));
  const packById = new Map((packs ?? []).map((p) => [p.id as string, p.label as string]));

  const rows: string[] = [];

  if (type === "payments") {
    rows.push(line(["Date (heure de Kinshasa)", "Référence", "Candidate n°", "Candidate", "Pack", "Votes", "Montant", "Devise", "Opérateur", "Téléphone (masqué)"]));
    for (let from = 0; from < MAX_ROWS; from += PAGE) {
      const { data, error } = await supabase
        .from("payments")
        .select("id, confirmed_at, candidate_id, pack_id, votes_count, amount, currency, provider, payer_phone")
        .eq("contest_id", id)
        .eq("status", "succeeded")
        .order("confirmed_at", { ascending: true })
        .range(from, from + PAGE - 1);
      if (error) return new NextResponse("Export impossible pour le moment.", { status: 500 });
      for (const p of data ?? []) {
        const c = candById.get(p.candidate_id as string);
        rows.push(
          line([when(p.confirmed_at), String(p.id).slice(0, 8).toUpperCase(), c?.number, c?.name, packById.get(p.pack_id as string), p.votes_count, dec(p.amount), p.currency, p.provider, mask(p.payer_phone)]),
        );
      }
      if ((data ?? []).length < PAGE) break;
    }
  } else {
    const { data: stats } = await supabase.rpc("contest_stats", { p_contest: id });
    const list = ((stats?.by_candidate ?? []) as { number: number; name: string; votes: number; revenue: number; is_active: boolean }[]);
    rows.push(line(["Rang", "Numéro", "Candidate", "Votes", "Recettes", "Statut"]));
    let rank = 0;
    let prev: number | null = null;
    list.forEach((c, i) => {
      if (c.votes !== prev) rank = i + 1; // égalité = même rang
      prev = c.votes;
      rows.push(line([rank, c.number, c.name, c.votes, dec(c.revenue), c.is_active ? "En lice" : "Retirée"]));
    });
  }

  return new NextResponse("﻿" + rows.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="voteplus-${contest.slug}-${type === "payments" ? "paiements" : "classement"}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
