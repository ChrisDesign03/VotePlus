"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import {
  MAX_CANDIDATES,
  MAX_PACKS,
  MIN_CANDIDATES,
  UUID_RE,
  getReadiness,
  isFreePeriod,
  isVoteMode,
  slugify,
} from "@/lib/contest-rules";
import type { Currency, FreePeriod, VoteMode } from "@/lib/types";

export type ActionState = {
  error?: string;
  message?: string;
  nonce?: number; // change à chaque réussite : sert à vider le formulaire
  values?: Record<string, string>;
} | null;

const text = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const isUuid = (v: string) => UUID_RE.test(v);

const dashboardPath = "/tableau-de-bord";
const contestPath = (id: string) => `/tableau-de-bord/concours/${id}`;

function values(fd: FormData, keys: string[]) {
  return Object.fromEntries(keys.map((k) => [k, text(fd, k)]));
}

// Message d'échec qui dit la vraie cause au lieu de la cacher.
// - Le détail complet est toujours écrit dans la fenêtre noire (terminal).
// - À l'écran : le code technique ; en développement (npm run dev), aussi la raison.
type DbError = { code?: string; message?: string } | null;
function failMessage(what: string, context: string, error: DbError) {
  console.error(`[VotePlus] ${context} :`, error?.code, error?.message);
  if (!error?.code) return `${what}. Vérifiez votre connexion internet et réessayez.`;
  const detail = process.env.NODE_ENV !== "production" && error.message ? ` : ${error.message}` : "";
  return `${what} (code technique ${error.code}${detail}).`;
}

// ─────────────────────────────────────────────────────────────────────
// Lecture et validation des champs d'un concours (création et modification)
// ─────────────────────────────────────────────────────────────────────
const CONTEST_KEYS = [
  "title", "description", "rules", "currency", "ranking", "starts_at", "ends_at", "vote_mode", "free_vote_period",
];

function parseContest(fd: FormData) {
  const title = text(fd, "title");
  const description = text(fd, "description");
  const rules = text(fd, "rules");
  const currency = text(fd, "currency");
  const ranking = text(fd, "ranking");
  const voteMode = text(fd, "vote_mode") || "paid";
  const freePeriod = text(fd, "free_vote_period") || "once";
  const startsRaw = text(fd, "starts_at");
  const endsRaw = text(fd, "ends_at");

  const toDate = (raw: string) => {
    if (!raw) return null;
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? undefined : d;
  };
  const starts = toDate(startsRaw);
  const ends = toDate(endsRaw);

  let error: string | undefined;
  if (title.length < 3) error = "Le titre doit contenir au moins 3 caractères.";
  else if (title.length > 120) error = "Le titre est trop long (120 caractères maximum).";
  else if (description.length > 2000) error = "La description est trop longue (2 000 caractères maximum).";
  else if (rules.length > 4000) error = "Le règlement est trop long (4 000 caractères maximum).";
  else if (currency !== "USD" && currency !== "CDF") error = "Choisissez la devise du concours.";
  else if (ranking !== "live" && ranking !== "hidden") error = "Choisissez l'affichage du classement.";
  else if (!isVoteMode(voteMode)) error = "Choisissez le type de vote.";
  else if (!isFreePeriod(freePeriod)) error = "Choisissez la fréquence du vote gratuit.";
  else if (starts === undefined || ends === undefined) error = "Une des dates n'est pas valide.";
  else if (starts && ends && ends <= starts) error = "La date de fin doit venir après la date de début.";

  return {
    error,
    data: {
      title,
      description: description || null,
      rules: rules || null,
      currency: currency as Currency,
      show_live_ranking: ranking === "live",
      vote_mode: voteMode as VoteMode,
      free_vote_period: freePeriod as FreePeriod,
      starts_at: starts ? starts.toISOString() : null,
      ends_at: ends ? ends.toISOString() : null,
    },
    ends,
  };
}

// ─────────────────────────────────────────────────────────────────────
// Concours : créer, modifier, supprimer, changer de statut
// ─────────────────────────────────────────────────────────────────────
export async function createContestAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase, user } = await getSessionUser();
  const v = values(fd, CONTEST_KEYS);

  const { error, data, ends } = parseContest(fd);
  if (error) return { error, values: v };
  if (ends && ends.getTime() <= Date.now()) {
    return { error: "La date de fin est déjà passée.", values: v };
  }

  // L'adresse publique (slug) doit être unique : on ajoute un court suffixe aléatoire.
  const base = slugify(data.title);
  for (let attempt = 0; attempt < 4; attempt++) {
    const slug = `${base}-${crypto.randomUUID().slice(0, 5)}`;
    const { data: created, error: dbError } = await supabase
      .from("contests")
      .insert({ ...data, slug, organizer_id: user.id })
      .select("id")
      .single();

    if (!dbError && created) {
      revalidatePath(dashboardPath);
      redirect(contestPath(created.id));
    }
    if (dbError?.code !== "23505") {
      return { error: failMessage("Le concours n'a pas pu être créé", "création du concours", dbError), values: v };
    }
  }
  return { error: "Le concours n'a pas pu être créé. Réessayez dans un instant.", values: v };
}

export async function updateContestAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase, user } = await getSessionUser();
  const id = text(fd, "id");
  const v = values(fd, CONTEST_KEYS);
  if (!isUuid(id)) return { error: "Concours introuvable.", values: v };

  const { error, data } = parseContest(fd);
  if (error) return { error, values: v };

  const { data: current } = await supabase
    .from("contests")
    .select("status, currency, vote_mode, free_vote_period")
    .eq("id", id)
    .eq("organizer_id", user.id)
    .maybeSingle();
  if (!current) return { error: "Concours introuvable.", values: v };
  if (current.status === "closed") return { error: "Ce concours est clôturé : il ne peut plus être modifié.", values: v };

  // La devise ne change plus une fois le concours publié (les prix des packs en dépendent).
  const update =
    current.status === "draft"
      ? data
      : { ...data, currency: current.currency, vote_mode: current.vote_mode, free_vote_period: current.free_vote_period };

  const { error: dbError } = await supabase.from("contests").update(update).eq("id", id).eq("organizer_id", user.id);
  if (dbError) return { error: failMessage("Les modifications n'ont pas pu être enregistrées", "modification du concours", dbError), values: v };

  revalidatePath(contestPath(id));
  revalidatePath(dashboardPath);
  return { message: "Modifications enregistrées.", nonce: Date.now() };
}

export async function setStatusAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase, user } = await getSessionUser();
  const id = text(fd, "contest_id");
  const to = text(fd, "to");
  if (!isUuid(id) || !["open", "draft", "closed"].includes(to)) return { error: "Action non reconnue." };

  const { data: contest } = await supabase
    .from("contests")
    .select("status, ends_at, vote_mode")
    .eq("id", id)
    .eq("organizer_id", user.id)
    .maybeSingle();
  if (!contest) return { error: "Concours introuvable." };

  const done = (message: string): ActionState => {
    revalidatePath(contestPath(id));
    revalidatePath(dashboardPath);
    return { message, nonce: Date.now() };
  };

  if (to === "open") {
    if (contest.status !== "draft") return { error: "Seul un brouillon peut être publié." };
    const [{ count: candidates }, { count: packs }] = await Promise.all([
      supabase.from("candidates").select("id", { count: "exact", head: true }).eq("contest_id", id),
      supabase.from("vote_packs").select("id", { count: "exact", head: true }).eq("contest_id", id).eq("is_active", true),
    ]);
    const r = getReadiness(candidates ?? 0, packs ?? 0, contest.ends_at, contest.vote_mode as VoteMode);
    if (!r.candidates) return { error: "Ajoutez au moins 2 candidates avant de publier." };
    if (!r.packs) return { error: "Ajoutez au moins un pack de votes avant de publier." };
    if (!r.dates) return { error: "La date de fin est déjà passée. Modifiez-la avant de publier." };
    const { error } = await supabase.from("contests").update({ status: "open" }).eq("id", id).eq("organizer_id", user.id);
    return error ? { error: failMessage("La publication a échoué", "publication du concours", error) } : done("Concours publié.");
  }

  if (to === "closed") {
    if (contest.status !== "open") return { error: "Seul un concours ouvert peut être clôturé." };
    const { error } = await supabase.from("contests").update({ status: "closed" }).eq("id", id).eq("organizer_id", user.id);
    return error ? { error: "La clôture a échoué. Réessayez." } : done("Concours clôturé.");
  }

  // to === "draft" : possible tant qu'aucun paiement n'a été enregistré
  if (contest.status !== "open") return { error: "Seul un concours ouvert peut repasser en brouillon." };
  const [{ count: payments }, { count: freeVotes }] = await Promise.all([
    supabase.from("payments").select("id", { count: "exact", head: true }).eq("contest_id", id),
    supabase.from("free_votes").select("id", { count: "exact", head: true }).eq("contest_id", id),
  ]);
  if ((payments ?? 0) + (freeVotes ?? 0) > 0) {
    return { error: "Des votes existent déjà : le concours ne peut plus repasser en brouillon. Vous pouvez le clôturer." };
  }
  const { error } = await supabase.from("contests").update({ status: "draft" }).eq("id", id).eq("organizer_id", user.id);
  return error ? { error: "L'opération a échoué. Réessayez." } : done("Concours repassé en brouillon.");
}

export async function deleteContestAction(fd: FormData): Promise<void> {
  const { supabase, user } = await getSessionUser();
  const id = text(fd, "contest_id");
  if (!isUuid(id)) return;
  // La base n'autorise la suppression que des brouillons (règle de sécurité)
  await supabase.from("contests").delete().eq("id", id).eq("organizer_id", user.id).eq("status", "draft");
  revalidatePath(dashboardPath);
  redirect(dashboardPath);
}

// ─────────────────────────────────────────────────────────────────────
// Candidates
// ─────────────────────────────────────────────────────────────────────
export async function addCandidateAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase, user } = await getSessionUser();
  const id = text(fd, "contest_id");
  const v = values(fd, ["number", "name", "bio"]);
  if (!isUuid(id)) return { error: "Concours introuvable.", values: v };

  const number = Number(text(fd, "number"));
  const name = text(fd, "name");
  const bio = text(fd, "bio");
  const photo = text(fd, "photo_url");

  if (!Number.isInteger(number) || number < 1 || number > 999) return { error: "Le numéro doit être compris entre 1 et 999.", values: v };
  if (name.length < 2) return { error: "Indiquez le nom de la candidate.", values: v };
  if (name.length > 80) return { error: "Le nom est trop long (80 caractères maximum).", values: v };
  if (bio.length > 1000) return { error: "La présentation est trop longue (1 000 caractères maximum).", values: v };

  // La photo doit venir de NOTRE espace de stockage, dans le dossier de cet organisateur
  const allowedPrefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/contest-media/${user.id}/`;
  if (photo && !photo.startsWith(allowedPrefix)) return { error: "La photo n'est pas valide. Envoyez-la de nouveau.", values: v };

  const { data: contest } = await supabase
    .from("contests")
    .select("status")
    .eq("id", id)
    .eq("organizer_id", user.id)
    .maybeSingle();
  if (!contest) return { error: "Concours introuvable.", values: v };
  if (contest.status === "closed") return { error: "Ce concours est clôturé : on ne peut plus y ajouter de candidate.", values: v };

  const { count } = await supabase.from("candidates").select("id", { count: "exact", head: true }).eq("contest_id", id);
  if ((count ?? 0) >= MAX_CANDIDATES) return { error: `Un concours est limité à ${MAX_CANDIDATES} candidates.`, values: v };

  const { error } = await supabase.from("candidates").insert({
    contest_id: id,
    number,
    name,
    bio: bio || null,
    photo_url: photo || null,
  });
  if (error) {
    if (error.code === "23505") return { error: `Le numéro ${number} est déjà attribué à une autre candidate.`, values: v };
    return { error: failMessage("La candidate n'a pas pu être ajoutée", "ajout d'une candidate", error), values: v };
  }

  revalidatePath(contestPath(id));
  return { message: `${name} a été ajoutée avec le numéro ${number}.`, nonce: Date.now() };
}

export async function deleteCandidateAction(fd: FormData): Promise<void> {
  const { supabase, user } = await getSessionUser();
  const id = text(fd, "contest_id");
  const candidateId = text(fd, "candidate_id");
  if (!isUuid(id) || !isUuid(candidateId)) return;

  const { data: contest } = await supabase
    .from("contests").select("status").eq("id", id).eq("organizer_id", user.id).maybeSingle();
  if (!contest || contest.status !== "draft") return;

  const { data: removed } = await supabase
    .from("candidates").delete().eq("id", candidateId).eq("contest_id", id).select("photo_url").maybeSingle();

  // On supprime aussi la photo (si elle existe) pour ne pas encombrer l'espace de stockage
  const marker = "/contest-media/";
  const url: string | null | undefined = removed?.photo_url;
  if (url && url.includes(marker)) {
    const path = url.slice(url.indexOf(marker) + marker.length);
    if (path.startsWith(`${user.id}/`)) await supabase.storage.from("contest-media").remove([path]);
  }
  revalidatePath(contestPath(id));
}

// ─────────────────────────────────────────────────────────────────────
// Packs de votes
// ─────────────────────────────────────────────────────────────────────
export async function addPackAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase, user } = await getSessionUser();
  const id = text(fd, "contest_id");
  const v = values(fd, ["label", "votes", "price"]);
  if (!isUuid(id)) return { error: "Concours introuvable.", values: v };

  const label = text(fd, "label");
  const votes = Number(text(fd, "votes"));
  const price = Number(text(fd, "price").replace(",", "."));

  if (label.length < 2 || label.length > 60) return { error: "Donnez un nom au pack (2 à 60 caractères).", values: v };
  if (!Number.isInteger(votes) || votes < 1 || votes > 100000) return { error: "Le nombre de votes doit être un entier entre 1 et 100 000.", values: v };
  if (!Number.isFinite(price) || price <= 0 || price > 1_000_000) return { error: "Indiquez un prix supérieur à zéro.", values: v };

  const { data: contest } = await supabase
    .from("contests").select("status, currency").eq("id", id).eq("organizer_id", user.id).maybeSingle();
  if (!contest) return { error: "Concours introuvable.", values: v };
  if (contest.status === "closed") return { error: "Ce concours est clôturé : on ne peut plus y ajouter de pack.", values: v };
  if (contest.currency === "CDF" && !Number.isInteger(price)) return { error: "En francs congolais, le prix doit être un nombre entier.", values: v };

  const { count } = await supabase.from("vote_packs").select("id", { count: "exact", head: true }).eq("contest_id", id);
  if ((count ?? 0) >= MAX_PACKS) return { error: `Un concours est limité à ${MAX_PACKS} packs.`, values: v };

  const { error } = await supabase.from("vote_packs").insert({
    contest_id: id,
    label,
    votes,
    price: Math.round(price * 100) / 100,
  });
  if (error) return { error: failMessage("Le pack n'a pas pu être ajouté", "ajout d'un pack", error), values: v };

  revalidatePath(contestPath(id));
  return { message: `Le pack « ${label} » a été ajouté.`, nonce: Date.now() };
}

export async function deletePackAction(fd: FormData): Promise<void> {
  const { supabase, user } = await getSessionUser();
  const id = text(fd, "contest_id");
  const packId = text(fd, "pack_id");
  if (!isUuid(id) || !isUuid(packId)) return;

  const { data: contest } = await supabase
    .from("contests").select("status").eq("id", id).eq("organizer_id", user.id).maybeSingle();
  if (!contest || contest.status !== "draft") return;

  await supabase.from("vote_packs").delete().eq("id", packId).eq("contest_id", id);
  revalidatePath(contestPath(id));
}

// ─────────────────────────────────────────────────────────────────────
// Modification et retrait (concours brouillon ou publié, jamais clôturé)
// ─────────────────────────────────────────────────────────────────────
const OWN_PHOTO = (userId: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/contest-media/${userId}/`;

// Supprime un fichier photo du stockage, seulement s'il est dans le dossier de cet organisateur
async function removePhotoFile(
  supabase: Awaited<ReturnType<typeof getSessionUser>>["supabase"],
  userId: string,
  url: string | null | undefined,
) {
  const marker = "/contest-media/";
  if (!url || !url.includes(marker)) return;
  const path = url.slice(url.indexOf(marker) + marker.length);
  if (path.startsWith(`${userId}/`)) await supabase.storage.from("contest-media").remove([path]);
}

export async function updateCandidateAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase, user } = await getSessionUser();
  const id = text(fd, "contest_id");
  const candidateId = text(fd, "candidate_id");
  const v = values(fd, ["number", "name", "bio"]);
  if (!isUuid(id) || !isUuid(candidateId)) return { error: "Candidate introuvable.", values: v };

  const name = text(fd, "name");
  const bio = text(fd, "bio");
  const photo = text(fd, "photo_url");
  if (name.length < 2) return { error: "Indiquez le nom de la candidate.", values: v };
  if (name.length > 80) return { error: "Le nom est trop long (80 caractères maximum).", values: v };
  if (bio.length > 1000) return { error: "La présentation est trop longue (1 000 caractères maximum).", values: v };
  if (photo && !photo.startsWith(OWN_PHOTO(user.id))) return { error: "La photo n'est pas valide. Envoyez-la de nouveau.", values: v };

  const { data: contest } = await supabase
    .from("contests").select("status").eq("id", id).eq("organizer_id", user.id).maybeSingle();
  if (!contest) return { error: "Concours introuvable.", values: v };
  if (contest.status === "closed") return { error: "Ce concours est clôturé : il ne peut plus être modifié.", values: v };

  const { data: current } = await supabase
    .from("candidates").select("number, photo_url").eq("id", candidateId).eq("contest_id", id).maybeSingle();
  if (!current) return { error: "Candidate introuvable.", values: v };

  const patch: Record<string, unknown> = { name, bio: bio || null, photo_url: photo || null };
  if (contest.status === "draft") {
    const number = Number(text(fd, "number"));
    if (!Number.isInteger(number) || number < 1 || number > 999) return { error: "Le numéro doit être compris entre 1 et 999.", values: v };
    patch.number = number;
  }

  const { error } = await supabase.from("candidates").update(patch).eq("id", candidateId).eq("contest_id", id);
  if (error) {
    if (error.code === "23505") return { error: "Ce numéro est déjà attribué à une autre candidate.", values: v };
    return { error: failMessage("La candidate n'a pas pu être modifiée", "modification d'une candidate", error), values: v };
  }

  // L'ancienne photo est supprimée du stockage si elle a été remplacée ou retirée
  if (current.photo_url && current.photo_url !== (photo || null)) await removePhotoFile(supabase, user.id, current.photo_url);

  revalidatePath(contestPath(id));
  return { message: "Modifications enregistrées.", nonce: Date.now() };
}

// Retirer du vote / rétablir (concours publié). Les candidates ne sont jamais supprimées :
// leur historique (paiements, votes) reste intact.
export async function setCandidateActiveAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase, user } = await getSessionUser();
  const id = text(fd, "contest_id");
  const candidateId = text(fd, "candidate_id");
  const active = text(fd, "active") === "true";
  if (!isUuid(id) || !isUuid(candidateId)) return { error: "Candidate introuvable." };

  const { data: contest } = await supabase
    .from("contests").select("status").eq("id", id).eq("organizer_id", user.id).maybeSingle();
  if (!contest) return { error: "Concours introuvable." };
  if (contest.status === "closed") return { error: "Ce concours est clôturé : il ne peut plus être modifié." };

  if (!active && contest.status === "open") {
    const { count } = await supabase
      .from("candidates").select("id", { count: "exact", head: true })
      .eq("contest_id", id).eq("is_active", true).neq("id", candidateId);
    if ((count ?? 0) < MIN_CANDIDATES) return { error: `Un concours publié garde au moins ${MIN_CANDIDATES} candidates en lice.` };
  }

  const { error } = await supabase
    .from("candidates").update({ is_active: active }).eq("id", candidateId).eq("contest_id", id);
  if (error) return { error: failMessage("L'opération a échoué", "retrait d'une candidate", error) };
  revalidatePath(contestPath(id));
  return { message: active ? "Candidate rétablie." : "Candidate retirée du vote.", nonce: Date.now() };
}

export async function updatePackAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase, user } = await getSessionUser();
  const id = text(fd, "contest_id");
  const packId = text(fd, "pack_id");
  const v = values(fd, ["label", "votes", "price"]);
  if (!isUuid(id) || !isUuid(packId)) return { error: "Pack introuvable.", values: v };

  const label = text(fd, "label");
  const votes = Number(text(fd, "votes"));
  const price = Number(text(fd, "price").replace(",", "."));
  if (label.length < 2 || label.length > 60) return { error: "Donnez un nom au pack (2 à 60 caractères).", values: v };
  if (!Number.isInteger(votes) || votes < 1 || votes > 100000) return { error: "Le nombre de votes doit être un entier entre 1 et 100 000.", values: v };
  if (!Number.isFinite(price) || price <= 0 || price > 1_000_000) return { error: "Indiquez un prix supérieur à zéro.", values: v };

  const { data: contest } = await supabase
    .from("contests").select("status, currency").eq("id", id).eq("organizer_id", user.id).maybeSingle();
  if (!contest) return { error: "Concours introuvable.", values: v };
  if (contest.status === "closed") return { error: "Ce concours est clôturé : il ne peut plus être modifié.", values: v };
  if (contest.currency === "CDF" && !Number.isInteger(price)) return { error: "En francs congolais, le prix doit être un nombre entier.", values: v };

  const { error } = await supabase
    .from("vote_packs")
    .update({ label, votes, price: Math.round(price * 100) / 100 })
    .eq("id", packId).eq("contest_id", id);
  if (error) return { error: failMessage("Le pack n'a pas pu être modifié", "modification d'un pack", error), values: v };

  revalidatePath(contestPath(id));
  return { message: "Modifications enregistrées. Elles comptent pour les prochains paiements.", nonce: Date.now() };
}

export async function setPackActiveAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase, user } = await getSessionUser();
  const id = text(fd, "contest_id");
  const packId = text(fd, "pack_id");
  const active = text(fd, "active") === "true";
  if (!isUuid(id) || !isUuid(packId)) return { error: "Pack introuvable." };

  const { data: contest } = await supabase
    .from("contests").select("status").eq("id", id).eq("organizer_id", user.id).maybeSingle();
  if (!contest) return { error: "Concours introuvable." };
  if (contest.status === "closed") return { error: "Ce concours est clôturé : il ne peut plus être modifié." };

  if (!active && contest.status === "open") {
    const { count } = await supabase
      .from("vote_packs").select("id", { count: "exact", head: true })
      .eq("contest_id", id).eq("is_active", true).neq("id", packId);
    if ((count ?? 0) < 1) return { error: "Un concours publié garde au moins un pack en vente." };
  }

  const { error } = await supabase.from("vote_packs").update({ is_active: active }).eq("id", packId).eq("contest_id", id);
  if (error) return { error: failMessage("L'opération a échoué", "retrait d'un pack", error) };
  revalidatePath(contestPath(id));
  return { message: active ? "Pack remis en vente." : "Pack retiré de la vente.", nonce: Date.now() };
}
