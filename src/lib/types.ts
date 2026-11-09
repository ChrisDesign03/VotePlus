export type ContestStatus = "draft" | "open" | "closed";
export type Currency = "USD" | "CDF";
export type VoteMode = "paid" | "free" | "both";
export type FreePeriod = "once" | "daily";

export type Contest = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  rules: string | null;
  currency: Currency;
  status: ContestStatus;
  starts_at: string | null;
  ends_at: string | null;
  show_live_ranking: boolean;
  vote_mode: VoteMode;
  free_vote_period: FreePeriod;
  created_at: string;
};

export type Candidate = {
  id: string;
  number: number;
  name: string;
  bio: string | null;
  photo_url: string | null;
  is_active?: boolean;
};

export type VotePack = {
  id: string;
  label: string;
  votes: number;
  price: number | string; // Supabase renvoie parfois les nombres décimaux sous forme de texte
  is_active: boolean;
};
