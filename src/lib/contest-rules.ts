import type { Currency, FreePeriod, VoteMode } from "./types";

// Règles métier partagées entre les actions serveur et l'affichage.
export const MIN_CANDIDATES = 2;
export const MAX_CANDIDATES = 200;
export const MAX_PACKS = 8;

export type Readiness = {
  candidates: boolean;
  packs: boolean;
  dates: boolean;
  ready: boolean;
};

// Un concours peut être publié quand il a assez de candidates, au moins un pack
// de votes, et une date de fin qui n'est pas déjà passée.
export function getReadiness(
  candidateCount: number,
  activePackCount: number,
  endsAt: string | null,
  voteMode: VoteMode = "paid",
): Readiness {
  const candidates = candidateCount >= MIN_CANDIDATES;
  // Un concours 100 % gratuit n'a pas besoin de packs
  const packs = voteMode === "free" || activePackCount >= 1;
  const dates = !endsAt || new Date(endsAt).getTime() > Date.now();
  return { candidates, packs, dates, ready: candidates && packs && dates };
}

export const usesPaid = (m: VoteMode) => m === "paid" || m === "both";
export const usesFree = (m: VoteMode) => m === "free" || m === "both";
export const isVoteMode = (v: string): v is VoteMode => v === "paid" || v === "free" || v === "both";
export const isFreePeriod = (v: string): v is FreePeriod => v === "once" || v === "daily";

export function voteModeLabel(m: VoteMode, p: FreePeriod) {
  const free = p === "daily" ? "1 vote gratuit par jour" : "1 vote gratuit par personne";
  if (m === "free") return free;
  if (m === "both") return `${free} + votes payants`;
  return "Votes payants";
}

export function formatMoney(amount: number | string, currency: Currency) {
  const n = Number(amount);
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: currency === "CDF" ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function slugify(input: string) {
  return (
    input
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "concours"
  );
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
