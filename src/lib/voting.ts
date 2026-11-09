import type { ContestStatus } from "./types";

export type VotingState = "upcoming" | "open" | "ended";

// Le vote est ouvert si le concours est publié, a commencé, et n'est pas terminé.
export function getVotingState(c: {
  status: ContestStatus;
  starts_at: string | null;
  ends_at: string | null;
}): VotingState {
  if (c.status === "closed") return "ended";
  const now = Date.now();
  if (c.ends_at && new Date(c.ends_at).getTime() <= now) return "ended";
  if (c.starts_at && new Date(c.starts_at).getTime() > now) return "upcoming";
  return "open";
}

// Rang « à la compétition » : deux candidates à égalité ont le même rang (1, 2, 2, 4…).
export function rankByVotes<T extends { votes: number | null }>(items: T[]): (T & { rank: number })[] {
  const sorted = [...items].sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0));
  return sorted.map((item) => {
    const firstSame = sorted.findIndex((x) => x.votes === item.votes);
    return { ...item, rank: firstSame + 1 };
  });
}

export const nf = new Intl.NumberFormat("fr-FR");
