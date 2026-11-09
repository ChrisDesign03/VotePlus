import { formatMoney } from "./contest-rules";
import type { Currency } from "./types";

export type AuditRow = {
  id: number;
  table_name: string;
  action: string;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: string;
};

const CONTEST_FIELDS: Record<string, string> = {
  title: "titre",
  description: "description",
  rules: "règlement",
  starts_at: "date de début",
  ends_at: "date de fin",
  show_live_ranking: "affichage du classement",
};
const STATUS: Record<string, string> = { draft: "brouillon", open: "publié", closed: "clôturé" };

const changed = (a: Record<string, unknown>, b: Record<string, unknown>, keys: string[]) =>
  keys.filter((k) => JSON.stringify(a[k] ?? null) !== JSON.stringify(b[k] ?? null));

// Une phrase lisible pour chaque ligne du journal
export function describeAudit(r: AuditRow, currency: Currency): string {
  const o = r.old_data ?? {};
  const n = r.new_data ?? {};

  if (r.table_name === "contests") {
    if (o.status !== n.status) return `Concours ${STATUS[String(n.status)] ?? n.status} (auparavant ${STATUS[String(o.status)] ?? o.status}).`;
    const f = changed(o, n, Object.keys(CONTEST_FIELDS)).map((k) => CONTEST_FIELDS[k]);
    return f.length ? `Concours modifié : ${f.join(", ")}.` : "Concours modifié.";
  }

  if (r.table_name === "candidates") {
    if (r.action === "INSERT") return `Candidate ajoutée : ${n.name} (n°${n.number}).`;
    if (r.action === "DELETE") return `Candidate supprimée : ${o.name} (n°${o.number}).`;
    if (o.is_active !== n.is_active) return `${n.name} (n°${n.number}) ${n.is_active ? "rétablie dans le vote" : "retirée du vote"}.`;
    const f = changed(o, n, ["name", "bio", "photo_url"]).map((k) => ({ name: "nom", bio: "présentation", photo_url: "photo" })[k]);
    return `${n.name} (n°${n.number}) modifiée${f.length ? ` : ${f.join(", ")}` : ""}.`;
  }

  if (r.table_name === "vote_packs") {
    const money = (v: unknown) => formatMoney(Number(v), currency);
    if (r.action === "INSERT") return `Pack ajouté : « ${n.label} », ${n.votes} votes pour ${money(n.price)}.`;
    if (r.action === "DELETE") return `Pack supprimé : « ${o.label} ».`;
    if (o.is_active !== n.is_active) return `Pack « ${n.label} » ${n.is_active ? "remis en vente" : "retiré de la vente"}.`;
    const parts: string[] = [];
    if (Number(o.price) !== Number(n.price)) parts.push(`prix ${money(o.price)} → ${money(n.price)}`);
    if (o.votes !== n.votes) parts.push(`votes ${o.votes} → ${n.votes}`);
    if (o.label !== n.label) parts.push(`nom « ${o.label} » → « ${n.label} »`);
    return `Pack « ${n.label} » modifié${parts.length ? ` : ${parts.join(", ")}` : ""}.`;
  }
  return "Modification.";
}
